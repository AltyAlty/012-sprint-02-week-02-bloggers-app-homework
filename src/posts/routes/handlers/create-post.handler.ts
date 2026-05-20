import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsService } from '../../application/posts.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreatePostInputDTO } from '../input-dto/create-post.input-dto';
import { postsQueryService } from '../../application/posts.query-service';

/*Функция-обработчик "createPostHandler()" для POST-запросов для добавления нового поста.*/
export const createPostHandler = async (req: Request<{}, {}, CreatePostInputDTO>, res: Response) => {
  try {
    /*Просим сервис "postsService" создать новый пост.*/
    const createdPostId = await postsService.create(req.body);
    /*Просим query-сервис "postsQueryService" найти данные по созданному посту по ID.*/
    const postOutput = await postsQueryService.findById(createdPostId);
    /*Отправляем данные по созданному блогу клиенту.*/
    res.status(HttpStatus.Created_201).send(postOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
