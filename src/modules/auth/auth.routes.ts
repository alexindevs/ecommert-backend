import express from 'express';
import AuthController from './auth.controller';

const AuthRouter = express.Router();

AuthRouter.post('/register', AuthController.registerUser);
AuthRouter.post('/login', AuthController.loginUser);
AuthRouter.post('/logout/:userId', AuthController.logoutUser);
AuthRouter.get('/user/:userId', AuthController.getUserById);
AuthRouter.put('/user/:userId', AuthController.updateUser);
AuthRouter.delete('/user/:userId', AuthController.deleteUser);
AuthRouter.put('/change-password/:userId', AuthController.changePassword);
AuthRouter.post('/forgot-password', AuthController.forgotPassword);
AuthRouter.put('/reset-password/:userId', AuthController.resetPassword);

export default AuthRouter;
