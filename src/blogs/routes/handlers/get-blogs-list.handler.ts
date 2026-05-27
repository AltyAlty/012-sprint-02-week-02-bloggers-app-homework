import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { GetBlogsListQueryInputDTO } from '../input-dto/get-blogs-list-query.input-dto';
import { blogsQueryService } from '../../application/blogs.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/map-result-code-to-http-status';
import { PaginatedBlogsListOutputDTO } from '../output-dto/paginated-blogs-list.output-dto';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { Result } from '../../../core/types/result/result.type';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';
import { BlogSortFieldInputDTO } from '../input-dto/blog-sort-field.input-dto';

/*Функция-обработчик "getBlogsListHandler()" для GET-запросов по получению блогов, используя query-параметры.*/
export const getBlogsListHandler = async (
  req: Request<{}, {}, {}, GetBlogsListQueryInputDTO>,
  res: Response<PaginatedBlogsListOutputDTO>
) => {
  try {
    /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
    const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
      GetBlogsListQueryInputDTO,
      BlogSortFieldInputDTO
    >(req);

    /*Просим query-сервис "blogsQueryService" найти блоги.*/
    const paginatedBlogsListResult: Result<{ paginatedBlogsListOutput: PaginatedBlogsListOutputDTO }> =
      await blogsQueryService.findMany(sanitizedQueryInputWithDefaultPaginationSettings);

    /*Получаем HTTP-статус операции по поиску блогов.*/
    const paginatedBlogsListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedBlogsListResult.status);
    /*Отправляем блоги клиенту.*/
    res.status(paginatedBlogsListResultHttpStatus).send(paginatedBlogsListResult.data.paginatedBlogsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
