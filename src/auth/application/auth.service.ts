import { bcryptAdapter } from '../adapters/bcrypt.adapter';
import { argon2Adapter } from '../adapters/argon2.adapter';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { jwtAdapter } from '../adapters/jwt.adapter';
import { usersService } from '../../users/application/users.service';
import { UserOutputDTO } from '../../users/routes/output-dto/user.output-dto';

/*Сервис "authService" для работы с аутентификацией.*/
export const authService = {
  /*Метод "loginUser()" для аутентификации пользователя по логину/email и паролю.*/
  async loginUser(loginOrEmail: string, password: string): Promise<Result<{ accessToken: string } | null>> {
    /*Просим сервис "authService" проверить подлинность логина/email и пароля пользователя.*/
    const checkedUserCredentialsResult = await this.checkUserCredentials(loginOrEmail, password);

    /*Если проверка не прошла успешно, то возвращаем ResultObject с информацией об этом.*/
    if (checkedUserCredentialsResult.status !== ResultStatuses.Ok) {
      return {
        status: ResultStatuses.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
        data: null,
      };
    }

    /*Если проверка прошла успешно, то просим адаптер "jwtAdapter" создать AT.*/
    const accessToken: string = await jwtAdapter.createToken(checkedUserCredentialsResult.data!.id);

    /*Возвращаем ResultObject с AT.*/
    return {
      status: ResultStatuses.Ok,
      data: { accessToken },
      extensions: [],
    };
  },

  /*Метод "checkUserCredentials()" для проверки подлинности логина/email и пароля пользователя.*/
  async checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<{ id: string } | null>> {
    /*Просим сервис "usersService" найти пользователя по логину/email.*/
    const userResult: Result<{ userOutputWithPasswordHash: UserOutputDTO & { passwordHash: string } } | null> =
      await usersService.findByLoginOrEmail(loginOrEmail);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userResult) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };
    }

    /*Если пользователь был найден, то просим адаптер "bcryptAdapter" проверить подлинность пароля.*/
    // const isPasswordCorrect: boolean = await bcryptAdapter.checkPassword(
    //   password,
    //   userResult.data!.userOutputWithPasswordHash.passwordHash
    // );

    /*Если пользователь был найден, то просим адаптер "argon2Adapter" проверить подлинность пароля.*/
    const isPasswordCorrect: boolean = await argon2Adapter.checkPassword(
      password,
      userResult.data!.userOutputWithPasswordHash.passwordHash
    );

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
      data: { id: userResult.data!.userOutputWithPasswordHash.id },
      extensions: [],
    };
  },
};
