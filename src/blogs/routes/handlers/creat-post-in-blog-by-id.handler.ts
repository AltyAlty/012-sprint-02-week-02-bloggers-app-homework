import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsService } from '../../../posts/application/posts.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreatePostInExistingBlogInputDTO } from '../../../posts/routes/input-dto/create-post-in-existing-blog.input-dto';
import { postsQueryService } from '../../../posts/application/posts.query-service';

/*Функция-обработчик "createPostInExistingBlogByIdHandler()" для POST-запросов для добавления нового постав в
существующий блог по ID при помощи URI-параметров.*/
export const createPostInExistingBlogByIdHandler = async (
  req: Request<{ blogId: string }, {}, CreatePostInExistingBlogInputDTO>,
  res: Response
) => {
  try {
    /*Получаем ID блога.*/
    const blogId = req.params.blogId;
    /*Просим сервис "postsService" создать пост в существующем блоге.*/
    const createdPostId = await postsService.createInExistingBlog(blogId, req.body);
    /*Просим query-сервис "postsQueryService" найти созданный пост по ID.*/
    const postOutput = await postsQueryService.findById(createdPostId);
    /*Отправляем данные по посту клиенту.*/
    res.status(HttpStatus.Created_201).send(postOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
