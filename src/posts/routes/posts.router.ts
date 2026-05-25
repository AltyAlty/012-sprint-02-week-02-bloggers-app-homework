import { Router } from 'express';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { basicAuthGuardMiddleware } from '../../auth/middlewares/guard-middlewares/basic-auth.guard-middleware';
import { idValidation, postIdValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { postCreateInputValidation, postUpdateInputValidation } from '../validation/post-input-validation.middlewares';
import { createPostHandler } from './handlers/create-post.handler';
import { getPostsListHandler } from './handlers/get-posts-list.handler';
import { getPostByIdHandler } from './handlers/get-post-by-id.handler';
import { updatePostByIdHandler } from './handlers/update-post-by-id.handler';
import { paginationValidationMiddleware } from '../../core/middlewares/validation/pagination-validation.middleware';
import { PostSortFieldInputDTO } from './input-dto/post-sort-field.input-dto';
import { deletePostByIdHandler } from './handlers/delete-post-by-id.handler';
import { CommentSortFieldInputDTO } from '../../comments/routes/input-dto/comment-sort-field.input-dto';
import { getCommentsListByBlogIdHandler } from './handlers/get-comments-list-by-post-id.handler';
import { accessTokenGuardMiddleware } from '../../auth/middlewares/guard-middlewares/access-token.guard-middleware';
import { commentInExistingPostCreateInputValidation } from '../../comments/validation/comment-input-validation.middlewares';
import { createCommentInExistingPostByIdHandler } from './handlers/creat-comment-in-post-by-id.handler';

/*Роутер из Express для работы с данными по постам.*/
export const postsRouter = Router({});

/*Конфигурируем роутер "postsRouter".*/
postsRouter
  /*GET-запрос для получения данных по всем комментариям в существующем посте по ID с пагинацией при помощи
  URI-параметров.*/
  .get(
    '/:postId/comments',
    postIdValidation,
    paginationValidationMiddleware(CommentSortFieldInputDTO),
    inputValidationResultMiddleware,
    getCommentsListByBlogIdHandler
  )
  /*POST-запрос для добавления нового комментария в существующий пост по ID при помощи URI-параметров.*/
  .post(
    '/:postId/comments',
    accessTokenGuardMiddleware,
    postIdValidation,
    commentInExistingPostCreateInputValidation,
    inputValidationResultMiddleware,
    createCommentInExistingPostByIdHandler
  )
  /*GET-запрос для получения данных по всем постам с пагинацией при помощи query-параметров.*/
  .get('', paginationValidationMiddleware(PostSortFieldInputDTO), inputValidationResultMiddleware, getPostsListHandler)
  /*POST-запрос для добавления нового поста.*/
  .post('', basicAuthGuardMiddleware, postCreateInputValidation, inputValidationResultMiddleware, createPostHandler)
  /*GET-запрос для поиска поста по ID при помощи URI-параметров.*/
  .get('/:id', idValidation, inputValidationResultMiddleware, getPostByIdHandler)
  /*PUT-запрос для изменения данных поста по ID при помощи URI-параметров.*/
  .put(
    '/:id',
    basicAuthGuardMiddleware,
    idValidation,
    postUpdateInputValidation,
    inputValidationResultMiddleware,
    updatePostByIdHandler
  )
  /*DELETE-запрос для удаления поста по ID при помощи URI-параметров.*/
  .delete('/:id', basicAuthGuardMiddleware, idValidation, inputValidationResultMiddleware, deletePostByIdHandler);
