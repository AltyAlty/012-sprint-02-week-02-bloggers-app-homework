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
import { getCommentsListByPostIdHandler } from './handlers/get-comments-list-by-post-id.handler';
import { accessTokenGuardMiddleware } from '../../auth/middlewares/guard-middlewares/access-token.guard-middleware';
import { commentInPostCreateInputValidation } from '../../comments/validation/comment-input-validation.middlewares';
import { createCommentInPostByIdHandler } from './handlers/creat-comment-in-post-by-id.handler';

/*Роутер из Express для работы с данными по постам.*/
export const postsRouter: Router = Router({});

/*Конфигурируем роутер "postsRouter".*/
postsRouter
  /*001. GET-запрос по получению комментариев с пагинацией в посте по ID, используя URI-параметры.*/
  .get(
    '/:postId/comments',
    postIdValidation,
    paginationValidationMiddleware(CommentSortFieldInputDTO),
    inputValidationResultMiddleware,
    getCommentsListByPostIdHandler
  )
  /*002. POST-запрос по добавлению комментария в пост по ID, используя URI-параметры.*/
  .post(
    '/:postId/comments',
    accessTokenGuardMiddleware,
    postIdValidation,
    commentInPostCreateInputValidation,
    inputValidationResultMiddleware,
    createCommentInPostByIdHandler
  )
  /*003. GET-запрос по получению постов с пагинацией, используя query-параметры.*/
  .get('', paginationValidationMiddleware(PostSortFieldInputDTO), inputValidationResultMiddleware, getPostsListHandler)
  /*004. POST-запрос по добавлению поста.*/
  .post('', basicAuthGuardMiddleware, postCreateInputValidation, inputValidationResultMiddleware, createPostHandler)
  /*005. GET-запрос по получению поста по ID, используя URI-параметры.*/
  .get('/:id', idValidation, inputValidationResultMiddleware, getPostByIdHandler)
  /*006. PUT-запрос по изменению поста по ID, используя URI-параметры.*/
  .put(
    '/:id',
    basicAuthGuardMiddleware,
    idValidation,
    postUpdateInputValidation,
    inputValidationResultMiddleware,
    updatePostByIdHandler
  )
  /*007. DELETE-запрос по удалению поста по ID, используя URI-параметры.*/
  .delete('/:id', basicAuthGuardMiddleware, idValidation, inputValidationResultMiddleware, deletePostByIdHandler);
