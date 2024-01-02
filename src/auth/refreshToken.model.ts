import {  PrismaClient, RefreshToken as PrismaRefreshToken } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || 'secret';

class RefreshTokenModel {
  /**
   * Creates a new refresh token for the user.
   *
   * @param {number} userId - The ID of the user.
   * @return {Promise<Prisma.RefreshToken>} - The newly created refresh token.
   */
  static async createToken(userId: number): Promise<PrismaRefreshToken | null> {
    try {
      const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });

      const newToken = await prisma.refreshToken.create({
        data: {
          userId,
          token,
        },
      });

      return newToken;
    } catch (error) {
      console.error('Error creating token:', error);
      return null;
    }
  }

  /**
   * Checks the validity of the refresh token.
   *
   * @param {string} token - The refresh token.
   * @return {Promise<boolean>} - True if the token is valid, false otherwise.
   */
  static async checkTokenValidity(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      return true;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }

  /**
   * Gets the refresh token for a user.
   *
   * @param {number} userId - The ID of the user.
   * @return {Promise<Prisma.RefreshToken | null>} - The refresh token or null if not found.
   */
  static async getTokenByUserId(userId: number): Promise<PrismaRefreshToken | null> {
    try {
      const token = await prisma.refreshToken.findUnique({
        where: {
            userId,
        },
      });

      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  }

  /**
   * Destroys (deletes) a refresh token.
   *
   * @param {number} tokenId - The ID of the refresh token to destroy.
   * @return {Promise<void>} - A Promise that resolves when the token is destroyed.
   */
  static async destroyToken(tokenId: number): Promise<void> {
    try {
      await prisma.refreshToken.delete({
        where: {
          id: tokenId,
        },
      });
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  }
}

export default RefreshTokenModel;
