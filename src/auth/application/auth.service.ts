import { usersRepository } from '../../users/repositories/users.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { argon2Service } from '../adapters/argon2.service';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { WithId } from 'mongodb';
import { UserType } from '../../users/types/user.type';
import { Result } from '../../core/types/result/result.type';
import { jwtService } from '../adapters/jwt.service';

/*Сервис "authService" для работы с аутентификацией.*/
export const authService = {
  /*Метод "loginUser()" для аутентификации пользователя по логину/email и паролю.*/
  async loginUser(loginOrEmail: string, password: string): Promise<Result<{ accessToken: string } | null>> {
    /*Просим сервис "authService" проверить подлинность логина/email и пароля пользователя.*/
    const result = await this.checkUserCredentials(loginOrEmail, password);

    /*Если проверка прошла неуспешно, то формируем ResultObject с информацией об этом.*/
    if (result.status !== ResultStatuses.Ok) {
      return {
        status: ResultStatuses.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
        data: null,
      };
    }

    /*Если проверка прошла успешно, то просим адаптер "jwtService" создать AT.*/
    const accessToken = await jwtService.createToken(result.data!._id.toString());

    /*Возвращаем ResultObject с AT.*/
    return {
      status: ResultStatuses.Ok,
      data: { accessToken },
      extensions: [],
    };
  },

  /*Метод "checkUserCredentials()" для проверки подлинности логина/email и пароля пользователя.*/
  async checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<WithId<UserType> | null>> {
    /*Просим репозиторий "usersRepository" найти пользователя по логину/email в БД.*/
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!user) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };
    }

    /*Если пользователь был найден, то просим адаптер "bcryptService" проверить подлинность пароля.*/
    // const isPasswordCorrect: boolean = await bcryptService.checkPassword(password, user.passwordHash);
    /*Если пользователь был найден, то просим адаптер "argon2Service" проверить подлинность пароля.*/
    const isPasswordCorrect: boolean = await argon2Service.checkPassword(password, user.passwordHash);

    /*Если пароль не корректный, то возвращаем ResultObject с информацией об этом.*/
    if (!isPasswordCorrect) {
      return {
        status: ResultStatuses.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'password', message: 'Wrong password' }],
      };
    }

    /*Если с учетными данными нет проблем, то возвращаем ResultObject с информацией об этом.*/
    return {
      status: ResultStatuses.Ok,
      data: user,
      extensions: [],
    };
  },
};
