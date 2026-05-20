import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { UpdateBlogInputDTO } from '../input-dto/update-blog.input-dto';
import { blogsService } from '../../application/blogs.service';

/*Функция-обработчик "updateBlogByIdHandler()" для PUT-запросов для изменения данных блога по ID при помощи
URI-параметров.*/
export const updateBlogByIdHandler = async (req: Request<{ id: string }, {}, UpdateBlogInputDTO>, res: Response) => {
  try {
    /*Получаем ID блога.*/
    const blogId = req.params.id;
    /*Просим сервис "blogsService" изменить данные блога по ID.*/
    await blogsService.updateById(blogId, req.body);
    /*Сообщаем клиенту, что блог был изменен.*/
    res.sendStatus(HttpStatus.NoContent_204);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
