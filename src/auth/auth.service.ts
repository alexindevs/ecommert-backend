import bcrypt from "bcrypt";
import { User as PrismaUser } from '@prisma/client';
import * as schema from './user.interface';
import UserModel from "./user.model";
import RefreshTokenModel from "./refreshToken.model";
import AccessTokenGenerator from "./accessToken.service";

const ATG = new AccessTokenGenerator();

export class AuthService {
  private userModel: UserModel; 
  private RefreshTokenGenerator: RefreshTokenModel;
  constructor() {
    this.userModel = new UserModel();
    this.RefreshTokenGenerator = new RefreshTokenModel();
  }

  // User registration
  async registerUser(user: schema.UserWithoutId): Promise<Object | null> {
   try {
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

        if (!newUser) {
        throw new Error("Failed to create user.");
        }

        const RefreshToken = await RefreshTokenModel.createToken(newUser.id);
        const AccessToken = await ATG.generate(newUser.id);
        return {user: newUser, token: AccessToken};
    }
    catch (error: any) {
      throw error;
    }
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

  async loginUser(identifier: string, password: string): Promise<Object | null> {
    const user = await this.userModel.getUserByUsername(identifier) || await this.userModel.getUserByEmail(identifier);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (await this.checkPassword(user.id, password)) {
      throw new Error("Invalid credentials");
    } else {
      const RefreshToken = await RefreshTokenModel.createToken(user.id);
      const AccessToken = await ATG.generate(user.id);
      return {user: user, token: AccessToken};
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

  async updateUser(userId: number, user: Partial<PrismaUser>): Promise<PrismaUser | null> {
    try {
      const updatedUser = await this.userModel.updateUser(userId, user);
      return updatedUser;
    }
    catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<PrismaUser | null> {
    try {
      const deletedUser = await this.userModel.deleteUser(userId);
      return deletedUser;
    }
    catch (error) {
      throw error;
    }
  }
  
}
