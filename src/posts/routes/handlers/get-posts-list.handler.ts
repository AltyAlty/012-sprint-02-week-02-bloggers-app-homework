import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { matchedData } from 'express-validator';
import { GetPostsListQueryInputDTO } from '../input-dto/get-posts-list-query.input-dto';
import { applyDefaultPaginationSettings } from '../../../core/utils/pagination/apply-default-pagination-settings';
import { postsQueryService } from '../../application/posts.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';

/*Функция-обработчик "getPostsListHandler()" для GET-запросов для получения данных по всем постам при помощи
query-параметров.*/
export const getPostsListHandler = async (req: Request<{}, {}, {}, GetPostsListQueryInputDTO>, res: Response) => {
  try {
    /*Функция "matchedData()" из библиотеки express-validator берет из объекта "req" только те поля, которые ранее
    прошли через валидаторы и санитайзеры на основе библиотеки express-validator.*/
    const sanitizedQueryInput = matchedData<GetPostsListQueryInputDTO>(req, {
      /*Берем данные только из объекта "req.query".*/
      locations: ['query'],
      /*Включаем опциональные поля - те, для которых в валидаторах использовался метод "optional()", даже если они не
      пришли в запросе или были пропущены.*/
      includeOptionals: true,
    });

    /*Добавляем к объекту с query-параметрами поля, чтобы этот объект соответствовал типу
    "defaultPaginationSettingsType".*/
    const sanitizedQueryInputWithDefaultPaginationSettings = applyDefaultPaginationSettings(sanitizedQueryInput);
    /*Просим query-сервис "postsQueryService" найти данные по постам.*/
    const paginatedPostsListResult = await postsQueryService.findMany(sanitizedQueryInputWithDefaultPaginationSettings);
    /*Получаем HTTP-статус операции по поиску данных по постам.*/
    const paginatedPostsListResultHttpStatus = mapResultCodeToHttpStatus(paginatedPostsListResult.status);
    /*Отправляем данные по постам клиенту.*/
    res.status(paginatedPostsListResultHttpStatus).send(paginatedPostsListResult.data.paginatedPostsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
