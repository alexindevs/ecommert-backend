import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import UserModel from './user.model';

const prisma = new PrismaClient();

class AccessTokenGenerator {
  private readonly secret: string = process.env.JWT_SECRET || 'coommma';
  private readonly expiresIn: string = '1h';
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
}

export default AccessTokenGenerator;
