import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request } from "express"; // Assuming you're using Express
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import * as schema from './user.interface';
import UserModel from "./user.model";

export class AuthService {
  private prisma: PrismaClient;
  private userModel: UserModel;

  constructor() {
    this.prisma = new PrismaClient();
    this.userModel = new UserModel();
  }

  // User registration
  async registerUser(user: schema.UserWithoutId): Promise<PrismaUser | null> {
    // Check if the username or email already exists
    const existingUser = await this.userModel.getUserByUsername(user.username);
    if (existingUser) {
      throw new Error("Username already exists.");
    }

    const existingEmail = await this.userModel.getUserByUsername(user.email);
    if (existingEmail) {
      throw new Error("Email already exists.");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;

    // Create the user
    const newUser = await this.userModel.addUser(user);
    return newUser;
  }

  async checkPassword(userId: number, password: string): Promise<boolean> {
    try {
      const user = await this.userModel.getUserById(userId);
      if (!user) {
        return false;
      }
      return bcrypt.compareSync(password, user.password);
    } catch (error) {
      throw error;
    }
  }

  async checkCredentials(identifier: string, password: string): Promise<boolean> {
    const user = await this.userModel.getUserByUsername(identifier) || await this.userModel.getUserByEmail(identifier);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (await this.checkPassword(user.id, password)) {
      throw new Error("Invalid credentials");
    } else {
        return true;
    }
  }

  async getUserById(userId: number): Promise<PrismaUser | null> {
    try {
      const user = await this.userModel.getUserById(userId);
      return user;
    }
    catch (error) {
      throw error;
    }
  }
  
}
