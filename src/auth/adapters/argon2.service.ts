import * as argon2 from '@node-rs/argon2';
import { Algorithm, Version } from '@node-rs/argon2';

/*Адаптер "argon2Service" для работы с библиотекой @node-rs/argon2.*/
export const argon2Service = {
  /*Метод "generateHash()" для генерации хеша для паролей.*/
  async generateHash(password: string) {
    return argon2.hash(password, {
      memoryCost: 65536,
      timeCost: 3,
      outputLen: 32,
      parallelism: 4,
      algorithm: Algorithm.Argon2id,
      version: Version.V0x13,
    });
  },

  /*Метод "checkPassword()" для проверки подлинности пароля по хэшу.*/
  async checkPassword(password: string, hash: string) {
    return argon2.verify(hash, password);
  },
};
