import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { GetPostsListQueryInputDTO } from '../input-dto/get-posts-list-query.input-dto';
import { postsQueryService } from '../../application/posts.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/map-result-code-to-http-status';
import { PaginatedPostsListOutputDTO } from '../output-dto/paginated-posts-list.output-dto';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { PostSortFieldInputDTO } from '../input-dto/post-sort-field.input-dto';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';

/*Функция-обработчик "getPostsListHandler()" для GET-запросов по получению постов с пагинацией, используя
query-параметры.*/
export const getPostsListHandler = async (
  req: Request<{}, {}, {}, GetPostsListQueryInputDTO>,
  res: Response<PaginatedPostsListOutputDTO | ExtensionType[]>
) => {
  try {
    /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
    const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
      GetPostsListQueryInputDTO,
      PostSortFieldInputDTO
    >(req);

    /*Просим query-сервис "postsQueryService" найти посты.*/
    const paginatedPostsListResult: Result<{ paginatedPostsListOutput: PaginatedPostsListOutputDTO } | null> =
      await postsQueryService.findMany(sanitizedQueryInputWithDefaultPaginationSettings);

    /*Получаем HTTP-статус операции по поиску постов.*/
    const paginatedPostsListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedPostsListResult.status);

    /*Если был указан блог для постов и этот блог не был найден, то сообщаем об этом клиенту.*/
    if (paginatedPostsListResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(paginatedPostsListResultHttpStatus).send(paginatedPostsListResult.extensions);
    }

    /*Если посты были найдены, то отправляем их клиенту.*/
    res.status(paginatedPostsListResultHttpStatus).send(paginatedPostsListResult.data!.paginatedPostsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
