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
import { postInExistingBlogCreateInputValidation } from '../../posts/validation/post-input-validation.middlewares';
import { createPostInExistingBlogByIdHandler } from './handlers/creat-post-in-blog-by-id.handler';
import { PostSortFieldInputDTO } from '../../posts/routes/input-dto/post-sort-field.input-dto';

/*Роутер из Express для работы с данными по блогам.*/
export const blogsRouter: Router = Router({});

/*Конфигурируем роутер "blogsRouter".*/
blogsRouter
  /*GET-запрос для получения данных по всем блогам с пагинацией при помощи query-параметров.*/
  .get('', paginationValidationMiddleware(BlogSortFieldInputDTO), inputValidationResultMiddleware, getBlogsListHandler)
  /*POST-запрос для добавления нового блога.*/
  .post('', basicAuthGuardMiddleware, blogCreateInputValidation, inputValidationResultMiddleware, createBlogHandler)
  /*GET-запрос для получения данных по всем постам в существующем блоге по ID с пагинацией при помощи URI-параметров.*/
  .get(
    '/:blogId/posts',
    blogIdValidation,
    paginationValidationMiddleware(PostSortFieldInputDTO),
    inputValidationResultMiddleware,
    getPostsListByBlogIdHandler
  )
  /*POST-запрос для добавления нового поста в существующий блог по ID при помощи URI-параметров.*/
  .post(
    '/:blogId/posts',
    basicAuthGuardMiddleware,
    blogIdValidation,
    postInExistingBlogCreateInputValidation,
    inputValidationResultMiddleware,
    createPostInExistingBlogByIdHandler
  )
  /*GET-запрос для поиска блога по ID при помощи URI-параметров. При помощи ":" Express позволяет указывать переменные в
  пути. Такие переменные доступны через объект "req.params".*/
  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogByIdHandler)
  /*PUT-запрос для изменения данных блога по ID при помощи URI-параметров.*/
  .put(
    '/:id',
    basicAuthGuardMiddleware,
    idValidation,
    blogUpdateInputValidation,
    inputValidationResultMiddleware,
    updateBlogByIdHandler
  )
  /*DELETE-запрос для удаления блога по ID при помощи URI-параметров.*/
  .delete('/:id', basicAuthGuardMiddleware, idValidation, inputValidationResultMiddleware, deleteBlogByIdHandler);
