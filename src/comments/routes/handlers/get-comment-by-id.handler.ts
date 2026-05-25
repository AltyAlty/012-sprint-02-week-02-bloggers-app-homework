import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { commentsQueryService } from '../../application/comments.query-service';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { CommentOutputDTO } from '../output-dto/comment.output-dto';

/*Функция-обработчик "getCommentByIdHandler()" для GET-запросов для поиска комментария по ID при помощи
URI-параметров.*/
export const getCommentByIdHandler = async (
  req: Request<{ id: string }>,
  res: Response<CommentOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем ID комментария.*/
    const commentId: string = req.params.id;

    /*Просим query-сервис "commentsQueryService" найти данные по комментарию по ID.*/
    const commentResult: Result<{ commentOutput: CommentOutputDTO } | null> =
      await commentsQueryService.findById(commentId);

    /*Получаем HTTP-статус операции по поиску данных по комментарию по ID.*/
    const commentResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(commentResult.status);

    /*Если данные по комментарию не были найдены, то сообщаем об этом клиенту.*/
    if (commentResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(commentResultHttpStatus).send(commentResult.extensions);
    }

    /*Если данные по комментарию были найдены, то отправляем их клиенту.*/
    res.status(commentResultHttpStatus).send(commentResult.data?.commentOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
