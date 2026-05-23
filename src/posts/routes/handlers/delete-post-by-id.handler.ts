import { Request, Response } from 'express';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { postsService } from '../../application/posts.service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';

/*Функция-обработчик "deletePostByIdHandler()" для DELETE-запросов для удаления поста по ID при помощи URI-параметров.*/
export const deletePostByIdHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    /*Получаем ID поста.*/
    const postId = req.params.id;
    /*Просим сервис "postsService" удалить пост по ID.*/
    const deletedPostResult = await postsService.deleteById(postId);
    /*Получаем HTTP-статус операции по удалению поста по ID.*/
    const deletedPostResultHttpStatus = mapResultCodeToHttpStatus(deletedPostResult.status);

    /*Если пост не был удален, то сообщаем об этом клиенту.*/
    if (deletedPostResultHttpStatus !== HttpStatuses.NoContent_204) {
      return res.status(deletedPostResultHttpStatus).send(deletedPostResult.extensions);
    }

    /*Если пост был удален, то сообщаем клиенту об этом.*/
    res.sendStatus(deletedPostResultHttpStatus);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
