import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { matchedData } from 'express-validator';
import { GetBlogsListQueryInputDTO } from '../input-dto/get-blogs-list-query.input-dto';
import { applyDefaultPaginationSettings } from '../../../core/utils/pagination/apply-default-pagination-settings';
import { blogsQueryService } from '../../application/blogs.query-service';

/*Функция-обработчик "getBlogsListHandler()" для GET-запросов для получения данных по всем блогам при помощи
query-параметров.*/
export const getBlogsListHandler = async (req: Request<{}, {}, {}, GetBlogsListQueryInputDTO>, res: Response) => {
  try {
    /*Функция "matchedData()" из библиотеки express-validator берет из объекта "req" только те поля, которые ранее
    прошли через валидаторы и санитайзеры на основе библиотеки express-validator.*/
    const sanitizedQueryInput = matchedData<GetBlogsListQueryInputDTO>(req, {
      /*Берем данные только из объекта "req.query".*/
      locations: ['query'],
      /*Включаем опциональные поля - те, для которых в валидаторах использовался метод "optional()", даже если они не
      пришли в запросе или были пропущены.*/
      includeOptionals: true,
    });

    /*Добавляем к объекту с query-параметрами поля, чтобы этот объект соответствовал типу
    "defaultPaginationSettingsType".*/
    const sanitizedQueryInputWithDefaultPaginationSettings = applyDefaultPaginationSettings(sanitizedQueryInput);
    /*Просим query-сервис "blogsQueryService" найти данные по блогам.*/
    const paginatedBlogsListOutput = await blogsQueryService.findMany(sanitizedQueryInputWithDefaultPaginationSettings);
    /*Отправляем данные по блогам клиенту.*/
    res.send(paginatedBlogsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
