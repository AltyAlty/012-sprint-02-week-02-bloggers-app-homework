import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { matchedData } from 'express-validator';
import { applyDefaultPaginationSettings } from '../../../core/utils/pagination/apply-default-pagination-settings';
import { GetPostsListInExistingBlogQueryInputDTO } from '../../../posts/routes/input-dto/get-posts-list-in-existing-blog-query.input-dto';
import { postsQueryService } from '../../../posts/application/posts.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';

/*Функция-обработчик "getPostsListByBlogIdHandler()" для GET-запросов для получения данных по всем постам в существующем
блоге по ID с пагинацией при помощи URI-параметров.*/
export const getPostsListByBlogIdHandler = async (
  req: Request<{ blogId: string }, {}, {}, GetPostsListInExistingBlogQueryInputDTO>,
  res: Response
) => {
  try {
    /*Получаем ID блога.*/
    const blogId = req.params.blogId;

    /*Функция "matchedData()" из библиотеки express-validator берет из объекта "req" только те поля, которые ранее
    прошли через валидаторы и санитайзеры на основе библиотеки express-validator.*/
    const sanitizedQueryInput = matchedData<GetPostsListInExistingBlogQueryInputDTO>(req, {
      /*Берем данные только из объекта "req.query".*/
      locations: ['query'],
      /*Включить опциональные поля, то есть те, для которых в валидаторах использовался метод "optional()", даже если
      они не пришли в запросе или были пропущены.*/
      includeOptionals: true,
    });

    /*Добавляем к объекту с query-параметрами поля, чтобы этот объект соответствовал типу
    "defaultPaginationSettingsType".*/
    const sanitizedQueryInputWithDefaultPaginationSettings = applyDefaultPaginationSettings(sanitizedQueryInput);

    /*Просим query-сервис "postsQueryService" найти данные по постам в существующем блоге по ID.*/
    const paginatedPostsListResult = await postsQueryService.findManyByBlogId(
      blogId,
      sanitizedQueryInputWithDefaultPaginationSettings
    );

    /*Получаем HTTP-статус операции по поиску постов в существующем блоге по ID.*/
    const paginatedPostsListResultHttpStatus = mapResultCodeToHttpStatus(paginatedPostsListResult.status);

    /*Если данные по постам не были найдены, то сообщаем об этом клиенту.*/
    if (paginatedPostsListResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(paginatedPostsListResultHttpStatus).send(paginatedPostsListResult.extensions);
    }

    /*Если данные по постам были найдены, то отправляем их клиенту.*/
    res.status(paginatedPostsListResultHttpStatus).send(paginatedPostsListResult.data!.paginatedPostsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
