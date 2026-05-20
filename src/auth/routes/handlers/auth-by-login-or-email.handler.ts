import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { LoginDataInputDTO } from '../input-dto/login-data.input-dto';
import { authService } from '../../application/auth.service';
import { HttpStatus } from '../../../core/types/http-statuses';

/*Функция-обработчик "authByLoginOrEmailHandler()" для POST-запросов для аутентификации пользователя по логину или
email.*/
export const authByLoginOrEmailHandler = async (req: Request<{}, {}, LoginDataInputDTO>, res: Response) => {
  try {
    /*Получаем логин/email и пароль пользователя.*/
    const { loginOrEmail, password } = req.body;
    /*Просим сервис "authService" предоставить токен доступа для аутентификации пользователя по логину/email и паролю.*/
    const accessToken = await authService.loginUser(loginOrEmail, password);
    /*Если токен доступа не был получен, то сообщаем об этом клиенту.*/
    if (!accessToken) return res.sendStatus(HttpStatus.Unauthorized_401);
    /*Если токен доступа был получен, то отправляем его клиенту.*/
    return res.status(HttpStatus.NoContent_204).send({ accessToken });
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
