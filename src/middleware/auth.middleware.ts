import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RefreshTokenRepository } from '../modules/auth/auth.repository';
import AuthService from '../modules/auth/auth.service';
import AccessTokenGenerator from '../modules/auth/accessToken.service';

const ATG = new AccessTokenGenerator();
const authService = new AuthService();
export async function checkIfAdmin(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'TOKEN_NOT_FOUND_IN_HEADER' });
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "") as unknown as { exp: number; user: { id: number } };
      const expDate = decodedToken?.exp;
      const userId = decodedToken?.user.id;

      const user = await authService.getUserById(userId);
      const isAdmin = user?.isAdmin === true;

      if (isAdmin) {
        return next();
      } else {
        return res.status(401).json({ error: 'ACTION_NOT_PERMITTED' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }

}

export async function tokenVerification(req: Request, res: Response, next: Function) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'TOKEN_NOT_FOUND_IN_HEADER' });
    }
  
    try {
      const decodedToken = jwt.decode(token) as { exp: number; user: { id: number } };
      const expDate = decodedToken?.exp;
      const userId = decodedToken?.user.id;
  
      if (!expDate) {
        return res.status(401).json({ error: 'INVALID_TOKEN_EXPIRATION' });
      }
  
        if (expDate < Math.floor(Date.now() / 1000)) {
          const refreshToken = await RefreshTokenRepository.getTokenByUserId(userId);
  
          if (refreshToken) {
            const tokenIsValid = await RefreshTokenRepository.checkTokenValidity(refreshToken.token);
  
            if (tokenIsValid) {
              const accessToken = await ATG.generate(userId);
  
                res.setHeader('Authorization', `Bearer ${accessToken}`);
                return next();
              } else {
                return res.status(404).json({ error: 'USER_NOT_FOUND' });
              }
          } else {
              return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
           }
        } else {
           return next();
        }
      }
    catch (error) {
      console.error('Error in tokenVerification:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }