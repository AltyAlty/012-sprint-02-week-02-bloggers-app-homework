import { Router } from 'express';
import { idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { getCommentByIdHandler } from './handlers/get-comment-by-id.handler';
import { accessTokenGuardMiddleware } from '../../auth/middlewares/guard-middlewares/access-token.guard-middleware';
import { commentUpdateInputValidation } from '../validation/comment-input-validation.middlewares';
import { updateCommentByIdHandler } from './handlers/update-comment-by-id.handler';
import { deleteCommentByIdHandler } from './handlers/delete-comment-by-id.handler';

/*Роутер из Express для работы с данными по комментариям.*/
export const commentsRouter = Router({});

/*Конфигурируем роутер "commentsRouter".*/
commentsRouter
  /*PUT-запрос для изменения данных комментария по ID при помощи URI-параметров.*/
  .put(
    '/:id',
    accessTokenGuardMiddleware,
    idValidation,
    commentUpdateInputValidation,
    inputValidationResultMiddleware,
    updateCommentByIdHandler
  )
  /*DELETE-запрос для удаления комментария по ID при помощи URI-параметров.*/
  .delete('/:id', accessTokenGuardMiddleware, idValidation, inputValidationResultMiddleware, deleteCommentByIdHandler)
  /*GET-запрос для поиска комментария по ID при помощи URI-параметров.*/
  .get('/:id', idValidation, inputValidationResultMiddleware, getCommentByIdHandler);
