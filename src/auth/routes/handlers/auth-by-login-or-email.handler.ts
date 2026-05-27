import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { LoginDataInputDTO } from '../input-dto/login-data.input-dto';
import { authService } from '../../application/auth.service';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/map-result-code-to-http-status';
import { AccessTokenOutputDTO } from '../output-dto/access-token.output-dto';
import { ExtensionType, Result } from '../../../core/types/result/result.type';

/*Функция-обработчик "authByLoginOrEmailHandler()" для POST-запросов по аутентификации пользователя по логину/email.*/
export const authByLoginOrEmailHandler = async (
  req: Request<{}, {}, LoginDataInputDTO>,
  res: Response<AccessTokenOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем логин/email и пароль пользователя.*/
    const { loginOrEmail, password }: { loginOrEmail: string; password: string } = req.body;
    /*Просим сервис "authService" аутентифицировать пользователя по логину/email и паролю.*/
    const loginUserResult: Result<{ accessToken: string } | null> = await authService.loginUser(loginOrEmail, password);
    /*Получаем HTTP-статус операции по аутентификации пользователя по логину/email и паролю.*/
    const loginUserResultHttpResult: HttpStatuses = mapResultCodeToHttpStatus(loginUserResult.status);

    /*Если аутентификация не прошла успешно, то сообщаем об этом клиенту.*/
    if (loginUserResultHttpResult !== HttpStatuses.Ok_200) {
      return res.status(loginUserResultHttpResult).send(loginUserResult.extensions);
    }

    /*Если аутентификация прошла успешно, то отправляем AT клиенту.*/
    return res.status(loginUserResultHttpResult).send({ accessToken: loginUserResult.data!.accessToken });
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
