import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { logger } from '../utils/logger';

/**
 * AuthController: Thin controller that delegates to AuthService.
 * Single Responsibility: Only handles HTTP request/response mapping.
 */
export class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeService } = await import('../services/EmployeeService');
      const employee = await employeeService.findByUserId(req.user!.userId);

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          employee,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
