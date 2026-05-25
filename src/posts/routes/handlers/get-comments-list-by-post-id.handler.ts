import { Request, Response } from 'express';
import { GetCommentsListInExistingPostQueryInputDTO } from '../../../comments/routes/input-dto/get-comments-list-in-existing-post-query.input-dto';
import { matchedData } from 'express-validator';
import { applyDefaultPaginationSettings } from '../../../core/utils/pagination/apply-default-pagination-settings';
import { commentsQueryService } from '../../../comments/application/comments.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';

/*Функция-обработчик "getCommentsListByBlogIdHandler()" для GET-запросов для получения данных по всем комментариям в
существующем посте по ID с пагинацией при помощи URI-параметров.*/
export const getCommentsListByBlogIdHandler = async (
  req: Request<{ postId: string }, {}, {}, GetCommentsListInExistingPostQueryInputDTO>,
  res: Response
) => {
  try {
    /*Получаем ID поста.*/
    const postId = req.params.postId;

    /*Функция "matchedData()" из библиотеки express-validator берет из объекта "req" только те поля, которые ранее
    прошли через валидаторы и санитайзеры на основе библиотеки express-validator.*/
    const sanitizedQueryInput = matchedData<GetCommentsListInExistingPostQueryInputDTO>(req, {
      /*Берем данные только из объекта "req.query".*/
      locations: ['query'],
      /*Включить опциональные поля, то есть те, для которых в валидаторах использовался метод "optional()", даже если
      они не пришли в запросе или были пропущены.*/
      includeOptionals: true,
    });

    /*Добавляем к объекту с query-параметрами поля, чтобы этот объект соответствовал типу
    "defaultPaginationSettingsType".*/
    const sanitizedQueryInputWithDefaultPaginationSettings = applyDefaultPaginationSettings(sanitizedQueryInput);

    /*Просим query-сервис "commentsQueryService" найти данные по комментариям в существующем посте по ID.*/
    const paginatedCommentsListResult = await commentsQueryService.findManyByPostId(
      postId,
      sanitizedQueryInputWithDefaultPaginationSettings
    );

    /*Получаем HTTP-статус операции по поиску комментариев в существующем посте по ID.*/
    const paginatedCommentsListResultHttpStatus = mapResultCodeToHttpStatus(paginatedCommentsListResult.status);

    /*Если данные по комментариям не были найдены, то сообщаем об этом клиенту.*/
    if (paginatedCommentsListResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(paginatedCommentsListResultHttpStatus).send(paginatedCommentsListResult.extensions);
    }

    /*Если данные по комментариям были найдены, то отправляем их клиенту.*/
    res
      .status(paginatedCommentsListResultHttpStatus)
      .send(paginatedCommentsListResult.data!.paginatedCommentsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
