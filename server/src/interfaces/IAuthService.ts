import { User } from '@prisma/client';

/**
 * Dependency Inversion Principle (DIP):
 * Controllers depend on this abstraction, not on the concrete AuthService.
 */

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IAuthService {
  /** Authenticate user with email and password, return JWT tokens */
  login(dto: LoginDto): Promise<{ user: Omit<User, 'password'>; tokens: AuthTokens }>;

  /** Invalidate refresh token */
  logout(refreshToken: string): Promise<void>;

  /** Refresh access token using valid refresh token */
  refreshAccessToken(refreshToken: string): Promise<AuthTokens>;

  /** Validate and decode an access token */
  validateToken(token: string): JwtPayload;
}
