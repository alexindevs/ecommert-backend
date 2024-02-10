import { PrismaClient } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {UserModel} from './auth.repository';

const prisma = new PrismaClient();

class AccessTokenGenerator {
  private readonly secret: string = process.env.JWT_SECRET || 'coommma';
  private readonly expiresIn: string = '1h';
  private readonly expiresInVerif: string = '15m';
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  public async generate(userId: number): Promise<string | null> {
    try {
      const user = await this.userModel.getUserById(userId);

      if (user) {
        const { password, ...userWithoutPassword } = user;

        const accessToken = jwt.sign({ user: userWithoutPassword }, this.secret, {
          expiresIn: this.expiresIn,
        });

        return accessToken;
      }

      return null;
    } catch (error) {
      console.log('error:', error);
      return null;
    }
  }

  async generateForVerification(userId: number): Promise<string | null> {
    try {
      const user = await this.userModel.getUserById(userId);

      if (user) {
        const { password, ...userWithoutPassword } = user;

        const accessToken = jwt.sign({ user: userWithoutPassword }, this.secret, {
          expiresIn: this.expiresInVerif,
        });

        return accessToken;
      }

      return null;
    } catch (error) {
      console.log('error:', error);
      return null;
    }
  }

   async checkTokenValidity(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      return decoded;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }
}

export default AccessTokenGenerator;
