import { Request, Response } from 'express';
import { AuthService } from './auth.service';

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.body;
      const result = await this.authService.registerUser(user);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, password } = req.body;
      const result = await this.authService.loginUser(identifier, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const result = await this.authService.logout(Number(userId));
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const result = await this.authService.getUserById(Number(userId));
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const updatedData = req.body;
      const result = await this.authService.updateUser(Number(userId), updatedData);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const result = await this.authService.deleteUser(Number(userId));
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const { oldPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(Number(userId), oldPassword, newPassword);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = req.body.email;
      await this.authService.forgotPassword(email);
      res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const { token, newPassword } = req.body;
      const result = await this.authService.resetPassword(Number(userId), token, newPassword);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(401).json({ error: 'Invalid token or user' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

export default new AuthController();
