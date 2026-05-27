import { Request, Response } from 'express';
import { GetCommentsListInPostQueryInputDTO } from '../../../comments/routes/input-dto/get-comments-list-in-post-query.input-dto';
import { commentsQueryService } from '../../../comments/application/comments.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/map-result-code-to-http-status';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { PaginatedCommentsListOutputDTO } from '../../../comments/routes/output-dto/paginated-comments-list.output-dto';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';
import { CommentSortFieldInputDTO } from '../../../comments/routes/input-dto/comment-sort-field.input-dto';

/*Функция-обработчик "getCommentsListByPostIdHandler()" для GET-запросов по получению комментариев с пагинацией в посте
по ID, используя URI-параметры.*/
export const getCommentsListByPostIdHandler = async (
  req: Request<{ postId: string }, {}, {}, GetCommentsListInPostQueryInputDTO>,
  res: Response<PaginatedCommentsListOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем ID поста.*/
    const postId: string = req.params.postId;

    /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
    const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
      GetCommentsListInPostQueryInputDTO,
      CommentSortFieldInputDTO
    >(req);

    /*Просим query-сервис "commentsQueryService" найти комментарии в посте по ID.*/
    const paginatedCommentsListResult: Result<{ paginatedCommentsListOutput: PaginatedCommentsListOutputDTO } | null> =
      await commentsQueryService.findManyByPostId(postId, sanitizedQueryInputWithDefaultPaginationSettings);

    /*Получаем HTTP-статус операции по поиску комментариев в посте по ID.*/
    const paginatedCommentsListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(
      paginatedCommentsListResult.status
    );

    /*Если комментарии не были найдены в посте, то сообщаем об этом клиенту.*/
    if (paginatedCommentsListResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(paginatedCommentsListResultHttpStatus).send(paginatedCommentsListResult.extensions);
    }

    /*Если комментарии были найдены в посте, то отправляем их клиенту.*/
    res
      .status(paginatedCommentsListResultHttpStatus)
      .send(paginatedCommentsListResult.data!.paginatedCommentsListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
