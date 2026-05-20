import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { blogsService } from '../../application/blogs.service';

/*Функция-обработчик "deleteBlogByIdHandler()" для DELETE-запросов для удаления блога по ID при помощи URI-параметров.*/
export const deleteBlogByIdHandler = async (req: Request<{ id: string }>, res: Response) => {
  try {
    /*Получаем ID блога.*/
    const blogId = req.params.id;
    /*Просим сервис "blogsService" удалить блог по ID.*/
    await blogsService.deleteById(blogId);
    /*Сообщаем клиенту, что блог был удален.*/
    res.sendStatus(HttpStatus.NoContent_204);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
