import { PrismaClient, User as PrismaUser, RefreshToken as PrismaRefreshToken } from '@prisma/client';
import * as schema from './user.interface';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || 'secret';

class AuthRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Adds a new user to the database.
   *
   * @param {schema.UserWithoutId} user - The user object without an ID.
   * @return {Promise<PrismaUser | null>} A promise that resolves to the newly created user object, or null if an error occurs.
   */
  async addUser(user: schema.UserWithoutId): Promise<PrismaUser | null> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: number): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async verifyUser(userId: number): Promise<PrismaUser | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId},
        data: {
          isVerified: true
        }
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async fetchBlockedUsers(): Promise<PrismaUser[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { isBlocked: true },
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<PrismaUser | null> {
      try {
        const user = await this.prisma.user.findUnique({
          where: { email },
        });
        return user;
      } catch (error) {
        throw error;
      }
  }

  async updateUser(userId: number, user: Partial<PrismaUser>): Promise<PrismaUser | null> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: user,
      });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<PrismaUser | null> {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id: userId },
      });
      return deletedUser;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<PrismaUser[]> {
    try {
      const users = await this.prisma.user.findMany();
      return users;
    } catch (error) {
      throw error;
    }
  }

  // Admin functions

  async blockUser(userId: number): Promise<PrismaUser | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId},
        data: {
          isBlocked: true
        }
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async unblockUser(userId: number): Promise<PrismaUser | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId},
        data: {
          isBlocked: false
        }
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
}

class RefreshTokenRepository {
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

  static async updateToken(tokenId: number): Promise<PrismaRefreshToken | null> {
    try {
      const oldToken = await prisma.refreshToken.findUnique({
        where: {
          id: tokenId,
        },
      });
      if (!oldToken) {
        return null;
      }
      const userId = oldToken.userId;
      const newToken = jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
      const token = await prisma.refreshToken.update({
        where: {
          id: tokenId,
        },
        data: {
          token: newToken,
        },
      });
      return token;
    } catch (error) {
      console.error('Error updating token:', error);
      return null;
    }
  }

  // Admin functions 
}

export { AuthRepository, RefreshTokenRepository };