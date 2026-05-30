import { RegisterUseCase } from '../application/RegisterUseCase.js';
import { LoginUseCase } from '../application/LoginUseCase.js';
import { MongoUserRepository } from './MongoUserRepository.js';

const userRepository = new MongoUserRepository();
const registerUseCase = new RegisterUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);

export class AuthController {
  async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;
      const user = await registerUseCase.execute({ name, email, phone, password });
      
      // Don't return passwordHash
      const { passwordHash, ...userResponse } = user;
      
      res.status(201).json({
        status: 'success',
        data: userResponse
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await loginUseCase.execute({ email, password });
      
      // Don't return passwordHash
      const { passwordHash, ...userResponse } = user;

      res.status(200).json({
        status: 'success',
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}
