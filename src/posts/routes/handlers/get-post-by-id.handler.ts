import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsQueryService } from '../../application/posts.query-service';

/*Функция-обработчик "getPostByIdHandler()" для GET-запросов для поиска поста по ID при помощи URI-параметров.*/
export const getPostByIdHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    /*Получаем ID поста.*/
    const postId = req.params.id;
    /*Просим query-сервис "postsQueryService" найти данные по посту по ID.*/
    const postOutput = await postsQueryService.findById(postId);
    /*Отправляем данные по посту клиенту.*/
    res.status(HttpStatus.Ok_200).send(postOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
