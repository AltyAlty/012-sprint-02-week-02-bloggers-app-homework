import { Router } from 'express';
import { authByLoginOrEmailHandler } from './handlers/auth-by-login-or-email.handler';
import { authUserPostInputValidation } from '../validation/auth-input-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { accessTokenGuardMiddleware } from '../middlewares/guard-middlewares/access-token.guard-middleware';
import { getAuthDataByTokenHandler } from './handlers/get-auth-data-by-token.handler';

/*Роутер из Express для работы с аутентификацией.*/
export const authRouter = Router({});
/*Конфигурируем роутер "authRouter".*/
authRouter
  /*POST-запрос для аутентификации пользователя по логину или email.*/
  .post('/login', authUserPostInputValidation, inputValidationResultMiddleware, authByLoginOrEmailHandler)
  /*GET-запрос для получения данных пользователя по токену.*/
  .get('/me', accessTokenGuardMiddleware, getAuthDataByTokenHandler);
