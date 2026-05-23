import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { UpdateBlogInputDTO } from '../input-dto/update-blog.input-dto';
import { blogsService } from '../../application/blogs.service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';

/*Функция-обработчик "updateBlogByIdHandler()" для PUT-запросов для изменения данных блога по ID при помощи
URI-параметров.*/
export const updateBlogByIdHandler = async (req: Request<{ id: string }, {}, UpdateBlogInputDTO>, res: Response) => {
  try {
    /*Получаем ID блога.*/
    const blogId = req.params.id;
    /*Просим сервис "blogsService" изменить данные блога по ID.*/
    const updatedBlogResult = await blogsService.updateById(blogId, req.body);
    /*Получаем HTTP-статус операции по изменению данных блога по ID.*/
    const updatedBlogResultHttpStatus = mapResultCodeToHttpStatus(updatedBlogResult.status);

    /*Если блог не был изменен, то сообщаем об этом клиенту.*/
    if (updatedBlogResultHttpStatus !== HttpStatuses.NoContent_204) {
      return res.status(updatedBlogResultHttpStatus).send(updatedBlogResult.extensions);
    }

    /*Если блог был изменен, то сообщаем клиенту об этом.*/
    res.sendStatus(updatedBlogResultHttpStatus);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
