import express from 'express';
import AuthController from './auth.controller';
import  * as AuthMiddleware from './auth.middleware';
 
const AuthRouter = express.Router();

AuthRouter.post('/register', AuthController.registerUser);
AuthRouter.post('/login', AuthController.loginUser);
AuthRouter.post('/logout/:userId', AuthController.logoutUser);
AuthRouter.get('/user/:userId', AuthMiddleware.tokenVerification, AuthController.getUserById);
AuthRouter.put('/user/:userId', AuthMiddleware.tokenVerification, AuthController.updateUser);
AuthRouter.delete('/user/:userId', AuthMiddleware.tokenVerification, AuthController.deleteUser);
AuthRouter.put('/change-password/:userId', AuthMiddleware.tokenVerification, AuthController.changePassword);
AuthRouter.post('/forgot-password', AuthController.forgotPassword); 
AuthRouter.put('/reset-password/:userId', AuthController.resetPassword);

// Admin functions
AuthRouter.put('/block-user/:userId', AuthMiddleware.tokenVerification, AuthMiddleware.checkIfAdmin, AuthController.blockUser);
AuthRouter.put('/unblock-user/:userId', AuthMiddleware.tokenVerification, AuthController.unblockUser);
AuthRouter.get('/', AuthMiddleware.tokenVerification, AuthController.getAllUsers);

export default AuthRouter;
