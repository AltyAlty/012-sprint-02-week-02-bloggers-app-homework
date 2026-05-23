import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { blogsService } from '../../application/blogs.service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';

/*Функция-обработчик "deleteBlogByIdHandler()" для DELETE-запросов для удаления блога по ID при помощи URI-параметров.*/
export const deleteBlogByIdHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    /*Получаем ID блога.*/
    const blogId = req.params.id;
    /*Просим сервис "blogsService" удалить блог по ID.*/
    const deletedBlogResult = await blogsService.deleteById(blogId);
    /*Получаем HTTP-статус операции по удалению блога по ID.*/
    const deletedBlogResultHttpStatus = mapResultCodeToHttpStatus(deletedBlogResult.status);

    /*Если блог не был удален, то сообщаем об этом клиенту.*/
    if (deletedBlogResultHttpStatus !== HttpStatuses.NoContent_204) {
      return res.status(deletedBlogResultHttpStatus).send(deletedBlogResult.extensions);
    }

    /*Если блог был удален, то сообщаем клиенту об этом.*/
    res.sendStatus(deletedBlogResultHttpStatus);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
