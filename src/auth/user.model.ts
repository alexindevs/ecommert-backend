import { PrismaClient, User as PrismaUser } from '@prisma/client';
import * as schema from './user.interface';
import bcrypt from 'bcrypt';

export default class UserModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async addUser(user: schema.UserWithoutId): Promise<PrismaUser | null> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isBlocked: user.isBlocked,
          profileImage: user.profileImage || null,
          otp: user.otp || null,
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

  async getUserByUsername(username: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
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
}
