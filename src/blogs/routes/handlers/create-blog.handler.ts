import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreateBlogInputDTO } from '../input-dto/create-blog.input-dto';
import { blogsQueryService } from '../../application/blogs.query-service';

/*Функция-обработчик "createBlogHandler()" для POST-запросов для добавления нового блога.*/
export const createBlogHandler = async (req: Request<{}, {}, CreateBlogInputDTO>, res: Response) => {
  try {
    /*Просим сервис "blogsService" создать новый блог.*/
    const createdBlogId = await blogsService.create(req.body);
    /*Просим query-сервис "blogsQueryService" найти данные по созданному блогу по ID.*/
    const blogOutput = await blogsQueryService.findById(createdBlogId);
    /*Отправляем данные по созданному блогу клиенту.*/
    res.status(HttpStatus.Created_201).send(blogOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
