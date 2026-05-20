import { usersRepository } from '../../users/repositories/users.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { argon2Service } from '../adapters/argon2.service';

/*Сервис "authService" для работы с аутентификацией.*/
export const authService = {
  /*Метод "loginUser()" для аутентификации пользователя по логину/email и паролю.*/
  async loginUser(loginOrEmail: string, password: string): Promise<{ accessToken: string } | null> {
    /*Просим сервис "authService" проверить подлинность логина/email и пароля пользователя.*/
    const isCorrectCredentials = await this.checkUserCredentials(loginOrEmail, password);
    /*Если проверка прошла неуспешно, то возвращаем null.*/
    if (!isCorrectCredentials) return null;
    /*Если проверка прошла успешно, то возвращаем токен доступа.*/
    return { accessToken: 'token' };
  },

  /*Метод "checkUserCredentials()" для проверки подлинности логина/email и пароля пользователя.*/
  async checkUserCredentials(loginOrEmail: string, password: string): Promise<boolean> {
    /*Просим репозиторий "usersRepository" найти пользователя по логину/email в БД.*/
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
    /*Если пользователь не был найден, то возвращаем false.*/
    if (!user) return false;
    /*Если пользователь был найден, то просим адаптер "bcryptService" проверить подлинность пароля.*/
    // return bcryptService.checkPassword(password, user.passwordHash);
    /*Если пользователь был найден, то просим адаптер "argon2Service" проверить подлинность пароля.*/
    return argon2Service.checkPassword(password, user.passwordHash);
  },
};
