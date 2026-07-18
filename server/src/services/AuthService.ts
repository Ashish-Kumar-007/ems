import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { prisma } from '../config/database';
import { userRepository } from '../repositories/UserRepository';
import { IAuthService, LoginDto, AuthTokens, JwtPayload } from '../interfaces/IAuthService';
import { UnauthorizedError, NotFoundError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { User } from '@prisma/client';

/**
 * AuthService: Handles authentication business logic.
 *
 * Single Responsibility: Only handles auth concerns (login, logout, token management).
 * Dependency Inversion: Implements IAuthService interface.
 */
export class AuthService implements IAuthService {
  private readonly SALT_ROUNDS = 12;

  /**
   * Authenticate user with email and password.
   * Returns user info (without password) and JWT tokens.
   */
  async login(dto: LoginDto): Promise<{ user: Omit<User, 'password'>; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Contact admin.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Log audit
    logger.info(`User logged in: ${user.email}`);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  /**
   * Invalidate refresh token (logout).
   */
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    logger.info('User logged out, refresh token invalidated');
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedError('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Delete old refresh token (token rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    return this.generateTokens(storedToken.user);
  }

  /**
   * Validate and decode an access token.
   */
  validateToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Hash a password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Generate both access and refresh tokens, storing the refresh token in DB.
   */
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    const refreshTokenValue = uuidv4();

    // Parse refresh expiry
    const refreshExpiresMs = this.parseExpiry(config.jwt.refreshExpiresIn);
    const expiresAt = new Date(Date.now() + refreshExpiresMs);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  /**
   * Parse expiry string like "7d", "15m", "1h" to milliseconds.
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

export const authService = new AuthService();
