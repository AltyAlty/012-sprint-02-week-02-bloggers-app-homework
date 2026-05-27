import { Router } from 'express';
import { paginationValidationMiddleware } from '../../core/middlewares/validation/pagination-validation.middleware';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { basicAuthGuardMiddleware } from '../../auth/middlewares/guard-middlewares/basic-auth.guard-middleware';
import { idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { getUsersListHandler } from './handlers/get-users-list.handler';
import { UserSortFieldInputDTO } from './input-dto/user-sort-field.input-dto';
import { createUserHandler } from './handlers/create-user.handler';
import { deleteUserByIdHandler } from './handlers/delete-user-by-id.handler';
import { userCreateInputValidation } from '../validation/user-input-validation.middlewares';

/*Роутер из Express для работы с данными по пользователям.*/
export const usersRouter: Router = Router({});
/*Применяем middleware "basicAuthGuardMiddleware" ко всем маршрутам.*/
usersRouter.use(basicAuthGuardMiddleware);

/*Конфигурируем роутер "usersRouter".*/
usersRouter
  /*GET-запрос по получению пользователей с пагинацией, используя query-параметры.*/
  .get('', paginationValidationMiddleware(UserSortFieldInputDTO), inputValidationResultMiddleware, getUsersListHandler)
  /*POST-запрос по добавлению пользователя.*/
  .post('', userCreateInputValidation, inputValidationResultMiddleware, createUserHandler)
  /*DELETE-запрос по удалению пользователя по ID, используя URI-параметры.*/
  .delete('/:id', idValidation, inputValidationResultMiddleware, deleteUserByIdHandler);
