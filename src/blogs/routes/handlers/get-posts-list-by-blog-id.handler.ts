import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { GetPostsListInBlogQueryInputDTO } from '../../../posts/routes/input-dto/get-posts-list-in-blog-query.input-dto';
import { postsQueryService } from '../../../posts/application/posts.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/map-result-code-to-http-status';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { PaginatedPostsListOutputDTO } from '../../../posts/routes/output-dto/paginated-posts-list.output-dto';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';
import { PostSortFieldInputDTO } from '../../../posts/routes/input-dto/post-sort-field.input-dto';

/*Функция-обработчик "getPostsListByBlogIdHandler()" для GET-запросов по получению постов с пагинацией в блоге по ID,
используя URI-параметры.*/
export const getPostsListByBlogIdHandler = async (
  req: Request<{ blogId: string }, {}, {}, GetPostsListInBlogQueryInputDTO>,
  res: Response<PaginatedPostsListOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем ID блога.*/
    const blogId: string = req.params.blogId;

    /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
    const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
      GetPostsListInBlogQueryInputDTO,
      PostSortFieldInputDTO
    >(req);

    /*Просим query-сервис "postsQueryService" найти посты в блоге по ID.*/
    const paginatedPostsListResult: Result<{ paginatedPostsListOutput: PaginatedPostsListOutputDTO } | null> =
      await postsQueryService.findMany(sanitizedQueryInputWithDefaultPaginationSettings, blogId);

    /*Получаем HTTP-статус операции по поиску постов в блоге по ID.*/
    const paginatedPostsListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedPostsListResult.status);

    /*Если данные посты в блоге не были найдены, то сообщаем об этом клиенту.*/
    if (paginatedPostsListResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(paginatedPostsListResultHttpStatus).send(paginatedPostsListResult.extensions);
    }

    /*Если посты в блоге были найдены, то отправляем их клиенту.*/
    res.status(paginatedPostsListResultHttpStatus).send(paginatedPostsListResult.data!.paginatedPostsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
