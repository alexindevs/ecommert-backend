import bcrypt from "bcrypt";
import { User as PrismaUser } from '@prisma/client';
import jwt from "jsonwebtoken";
import * as schema from './user.interface';
import { AuthRepository, RefreshTokenRepository } from "./auth.models";
import AccessTokenGenerator from "./accessToken.service";
import { sendEmail } from "../../utils/email";
import { readFileSync } from "fs";

const ATG = new AccessTokenGenerator();
const platformName = process.env.PLATFORM_NAME || "Ecommert";

export default class AuthService {
  private authRepo: AuthRepository; 
  private RefreshTokenGenerator: RefreshTokenRepository;
  constructor() {
    this.authRepo = new AuthRepository();
    this.RefreshTokenGenerator = new RefreshTokenRepository();
  }

  // User registration
  async registerUser(user: schema.UserWithoutId): Promise<Object | null> {
   try {
        // Check if the username or email already exists
        const existingUser = await this.authRepo.getUserByUsername(user.username);
        if (existingUser) {
        throw new Error("Username already exists.");
        }

        const existingEmail = await this.authRepo.getUserByUsername(user.email);
        if (existingEmail) {
        throw new Error("Email already exists.");
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;

        // Create the user
        const newUser = await this.authRepo.addUser(user);

        if (!newUser) {
        throw new Error("Failed to create user.");
        }
        const RefreshToken = await RefreshTokenRepository.createToken(newUser.id);
        const AccessToken = await ATG.generate(newUser.id);
        await this.sendVerificationEmail(newUser);
        return {user: newUser, token: AccessToken};
    }
    catch (error: any) {
      throw error;
    }
  }

  async checkPassword(userId: number, password: string): Promise<boolean> {
    try {
      const user = await this.authRepo.getUserById(userId);
      if (!user) {
        return false;
      }
      return bcrypt.compareSync(password, user.password);
    } catch (error) {
      throw error;
    }
  }

  async verifyUser(token: string): Promise<PrismaUser | null> {
    try {
      const verifiedToken = ATG.checkTokenValidity(token);
      if (!verifiedToken) {
        return null;
      }

      const jwtSecret = process.env.JWT_SECRET ||  "";
      const resolvedUser = jwt.verify(token, jwtSecret) as unknown as { user: PrismaUser, exp: number };
      const user = await this.authRepo.getUserById(resolvedUser?.user.id);
      if (!user) {
        return null;
      }
      const verifiedUser = await this.authRepo.verifyUser(user.id);
      return verifiedUser;
    } catch (error) {
      throw new Error("The verification process failed. Please try again.");
    }
  }

  async loginUser(identifier: string, password: string): Promise<Object | null> {
    const user = await this.authRepo.getUserByUsername(identifier) || await this.authRepo.getUserByEmail(identifier);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (!await this.checkPassword(user.id, password)) {
      throw new Error("Invalid credentials");
    } else {
      let RefreshToken = await RefreshTokenRepository.getTokenByUserId(user.id);
        if (!RefreshToken) {
          RefreshToken = await RefreshTokenRepository.createToken(user.id);
        } else {
          RefreshToken = await RefreshTokenRepository.updateToken(RefreshToken.id);
        }
      const AccessToken = await ATG.generate(user.id);
      return {user: user, token: AccessToken};
    }
  }

  async logout(userId: number): Promise<PrismaUser | null> {
    try {
      const refreshToken = await RefreshTokenRepository.getTokenByUserId(userId);
      const user = await this.authRepo.getUserById(userId);
      if (refreshToken) {
        const deleteRefreshToken = await RefreshTokenRepository?.destroyToken(refreshToken.id);
      } else {
        return null;
      }
      return user;
    }
    catch (error) {
      throw error;
    }
  }

  async getUserById(userId: number): Promise<PrismaUser | null> {
    try {
      const user = await this.authRepo.getUserById(userId);
      return user;
    }
    catch (error) {
      throw error;
    }
  }

  async updateUser(userId: number, user: Partial<PrismaUser>): Promise<PrismaUser | null> {
    try {
      const updatedUser = await this.authRepo.updateUser(userId, user);
      return updatedUser;
    }
    catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<PrismaUser | null> {
    try {
      const deletedUser = await this.authRepo.deleteUser(userId);
      return deletedUser;
    }
    catch (error) {
      throw error;
    }
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<PrismaUser | null> {
    try {
      const user = await this.authRepo.getUserById(userId);
      if (!user) {
        return null;
      }
      if (!await this.checkPassword(user.id, oldPassword)) {
        throw new Error("Invalid password");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await this.authRepo.updateUser(userId, { password: hashedPassword });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await this.authRepo.getUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      await this.sendForgotPasswordEmail(user);
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(userId: number, token: string, newPassword: string): Promise<PrismaUser | null> {
    try {
      const verifiedToken = ATG.checkTokenValidity(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await this.authRepo.updateUser(userId, { password: hashedPassword });
      return updatedUser;
    } catch (error) {
      throw new Error("The verification process failed. Please try again.");
    }
  }

  /**
   * Sends a verification email to the specified user with the given token.
   *
   * @param {PrismaUser} user - The user to send the verification email to.
   * @return {Promise<void>} A promise that resolves when the email is sent successfully.
   */
  async sendVerificationEmail(user: PrismaUser): Promise<void> {
    try {
      const token = ATG.generateForVerification(user.id);
      const html = readFileSync("./src/templates/emails/verifyAccount.html", "utf8");
      const url = `${process.env.FRONTEND_URL}/auth/verify-account/${token}`;
      const username = user.username;
      const email = user.email;
      await sendEmail(
        email,
        "Verify your account",
        html.replace("{{username}}", username).replace("{{platformName}}", platformName).replace("{{url}}", url));
    } catch (error) {
      throw error;
    }
  }

  async sendForgotPasswordEmail(user: PrismaUser): Promise<void> {
    try {
      const token = ATG.generateForVerification(user.id);
      const html = readFileSync("./src/templates/emails/forgotPassword.html", "utf8");
      const url = `${process.env.FRONTEND_URL}/auth/forgot-password/${token}`;
      const username = user.username;
      const email = user.email;
      await sendEmail(
        email,
        "Need a new password?",
        html.replace("{{username}}", username).replace("{{platformName}}", platformName).replace("{{url}}", url));
    } catch (error) {
      throw error;
    }
  }
  
  // admin functions: block user, unblock user, get all users

  async blockUser(userId: number): Promise<PrismaUser | null> {
    try {
      const user = await this.authRepo.blockUser(userId);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async unblockUser(userId: number): Promise<PrismaUser | null> {
    try {
      const user = await this.authRepo.unblockUser(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<PrismaUser[]> {
    try {
      const users = await this.authRepo.getAllUsers();
      return users;
    } catch (error) {
      throw error;
    }
  }
}