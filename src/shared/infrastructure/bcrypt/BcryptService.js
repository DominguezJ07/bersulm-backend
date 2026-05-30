import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export class BcryptService {
  async hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

export default new BcryptService();
