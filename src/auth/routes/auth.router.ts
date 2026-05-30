import { Router } from 'express';
import { authByLoginOrEmailHandler } from './handlers/auth-by-login-or-email.handler';
import { authUserPostInputValidation } from '../validation/auth-input-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { accessTokenGuardMiddleware } from '../middlewares/guard-middlewares/access-token.guard-middleware';
import { getAuthDataByTokenHandler } from './handlers/get-auth-data-by-token.handler';

/*Роутер из Express для работы с аутентификацией и авторизацией.*/
export const authRouter: Router = Router({});
/*Конфигурируем роутер "authRouter".*/
authRouter
  /*001. POST-запрос по аутентификации пользователя по логину/email.*/
  .post('/login', authUserPostInputValidation, inputValidationResultMiddleware, authByLoginOrEmailHandler)
  /*002. GET-запрос по получению данных пользователя по токену.*/
  .get('/me', accessTokenGuardMiddleware, getAuthDataByTokenHandler);
