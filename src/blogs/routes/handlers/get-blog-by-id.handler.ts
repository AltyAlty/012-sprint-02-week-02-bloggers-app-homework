import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { blogsQueryService } from '../../application/blogs.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { BlogOutputDTO } from '../output-dto/blog.output-dto';

/*"Request" из Express используется для типизации параметра "req", а "Response" из Express используется для типизации
параметра "res".

Типизация первого параметра "req" второго параметра в виде асинхронной функции методов "get()", "post()", "delete()" и
"put()" внутри роутеров из Express:
1. На первом месте в типе идут URI-параметры.
2. На втором месте в типе идет "ResBody". Относится к параметру "res" внутри запроса, то есть что будет возвращено.
3. На третьем месте в типе идет "ReqBody". Это то, что приходит в body в запросе.
4. На четвертом месте в типе идут Query-параметры.

Функция-обработчик "getBlogByIdHandler()" для GET-запросов для поиска блога по ID при помощи URI-параметров.*/
export const getBlogByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response<BlogOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем ID блога.*/
    const blogId: string = req.params.id;
    /*Просим query-сервис "blogsQueryService" найти данные по блогу по ID.*/
    const blogResult: Result<{ blogOutput: BlogOutputDTO } | null> = await blogsQueryService.findById(blogId);
    /*Получаем HTTP-статус операции по поиску данных по блогу по ID.*/
    const blogResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(blogResult.status);

    /*Если данные по блогу не были найдены, то сообщаем об этом клиенту.*/
    if (blogResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(blogResultHttpStatus).send(blogResult.extensions);
    }

    /*Если данные по блогу были найдены, то отправляем их клиенту.*/
    res.status(blogResultHttpStatus).send(blogResult.data?.blogOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
