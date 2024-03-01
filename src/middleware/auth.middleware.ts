import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RefreshTokenRepository } from '../modules/auth/auth.repository';
import AuthService from '../modules/auth/auth.service';
import AccessTokenGenerator from '../modules/auth/accessToken.service';
import { UserWithoutPassword } from '../modules/auth/user.interface';

const ATG = new AccessTokenGenerator();
const authService = new AuthService();

export interface CustomRequest extends Request {
  user?: UserWithoutPassword;
}
export async function checkIfAdmin(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.isAdmin === true;

      if (isAdmin) {
        return next();
      } else {
        return res.status(401).json({ error: 'ACTION_NOT_PERMITTED' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }
}

export async function checkIfUserBlocked(req: CustomRequest, res: Response, next: NextFunction) {
    try {  
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'USER_NOT_FOUND' });
      }
      const notBlocked = req.user?.isBlocked ? false : true;

      if (!notBlocked) {
        return next();
      } else {
        return res.status(401).json({ error: 'USER_BLOCKED' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'INVALID_TOKEN' });
    }

}

export async function tokenVerification(req: CustomRequest, res: Response, next: Function) {
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
                if (!accessToken || !accessToken?.user) {
                  return res.status(401).json({ error: 'ACCESS_TOKEN_NOT_GENERATED_PROPERLY' });
                }
                req.user = accessToken?.user;
                res.setHeader('Authorization', `Bearer ${accessToken?.accessToken}`);
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