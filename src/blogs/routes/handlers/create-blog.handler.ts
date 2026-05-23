import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { CreateBlogInputDTO } from '../input-dto/create-blog.input-dto';
import { blogsQueryService } from '../../application/blogs.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';

/*Функция-обработчик "createBlogHandler()" для POST-запросов для добавления нового блога.*/
export const createBlogHandler = async (req: Request<{}, {}, CreateBlogInputDTO>, res: Response) => {
  try {
    /*Просим сервис "blogsService" создать новый блог.*/
    const createdBlogResult = await blogsService.create(req.body);
    /*Получаем HTTP-статус операции по созданию нового блога.*/
    const createdBlogResultHttpStatus = mapResultCodeToHttpStatus(createdBlogResult.status);
    /*Просим query-сервис "blogsQueryService" найти данные по созданному блогу по ID.*/
    const blogResult = await blogsQueryService.findById(createdBlogResult.data.blogId);
    /*Получаем HTTP-статус операции по поиску данных по созданному блогу по ID.*/
    const blogResultHttpStatus = mapResultCodeToHttpStatus(blogResult.status);

    /*Если данные по созданному блогу не были найдены, то сообщаем об этом клиенту.*/
    if (blogResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(blogResultHttpStatus).send(blogResult.extensions);
    }

    /*Если данные по созданному блогу были найдены, то отправляем их клиенту.*/
    res.status(createdBlogResultHttpStatus).send(blogResult.data?.blogOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
