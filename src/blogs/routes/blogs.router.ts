import { Router } from 'express';
import { getBlogsListHandler } from './handlers/get-blogs-list.handler';
import { getBlogByIdHandler } from './handlers/get-blog-by-id.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { updateBlogByIdHandler } from './handlers/update-blog-by-id.handler';
import { deleteBlogByIdHandler } from './handlers/delete-blog-by-id.handler';
import { blogIdValidation, idValidation } from '../../core/middlewares/validation/params-id-validation.middlewares';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation/input-validation-result.middleware';
import { blogCreateInputValidation, blogUpdateInputValidation } from '../validation/blog-input-validation.middlewares';
import { basicAuthGuardMiddleware } from '../../auth/middlewares/guard-middlewares/basic-auth.guard-middleware';
import { paginationValidationMiddleware } from '../../core/middlewares/validation/pagination-validation.middleware';
import { getPostsListByBlogIdHandler } from './handlers/get-posts-list-by-blog-id.handler';
import { BlogSortFieldInputDTO } from './input-dto/blog-sort-field.input-dto';
import { postInBlogCreateInputValidation } from '../../posts/validation/post-input-validation.middlewares';
import { createPostInBlogByIdHandler } from './handlers/creat-post-in-blog-by-id.handler';
import { PostSortFieldInputDTO } from '../../posts/routes/input-dto/post-sort-field.input-dto';

/*Роутер из Express для работы с данными по блогам.*/
export const blogsRouter: Router = Router({});

/*Конфигурируем роутер "blogsRouter".*/
blogsRouter
  /*001. GET-запрос по получению блогов с пагинацией, используя query-параметры.*/
  .get('', paginationValidationMiddleware(BlogSortFieldInputDTO), inputValidationResultMiddleware, getBlogsListHandler)
  /*002. POST-запрос по добавлению блога.*/
  .post('', basicAuthGuardMiddleware, blogCreateInputValidation, inputValidationResultMiddleware, createBlogHandler)
  /*003. GET-запрос по получению постов с пагинацией в блоге по ID, используя URI-параметры.*/
  .get(
    '/:blogId/posts',
    blogIdValidation,
    paginationValidationMiddleware(PostSortFieldInputDTO),
    inputValidationResultMiddleware,
    getPostsListByBlogIdHandler
  )
  /*004. POST-запрос по добавлению поста в блог по ID, используя URI-параметры.*/
  .post(
    '/:blogId/posts',
    basicAuthGuardMiddleware,
    blogIdValidation,
    postInBlogCreateInputValidation,
    inputValidationResultMiddleware,
    createPostInBlogByIdHandler
  )
  /*005. GET-запрос по получению блога по ID, используя URI-параметры. При помощи ":" Express позволяет указывать переменные
  в пути. Такие переменные доступны через объект "req.params".*/
  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogByIdHandler)
  /*006. PUT-запрос по изменению блога по ID, используя URI-параметры.*/
  .put(
    '/:id',
    basicAuthGuardMiddleware,
    idValidation,
    blogUpdateInputValidation,
    inputValidationResultMiddleware,
    updateBlogByIdHandler
  )
  /*007. DELETE-запрос по удалению блога по ID, используя URI-параметры.*/
  .delete('/:id', basicAuthGuardMiddleware, idValidation, inputValidationResultMiddleware, deleteBlogByIdHandler);
