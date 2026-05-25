import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { commentsService } from '../../application/comments.service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { ExtensionType, Result } from '../../../core/types/result/result.type';

/*Функция-обработчик "deleteCommentByIdHandler()" для DELETE-запросов для удаления комментария по ID при помощи
URI-параметров.*/
export const deleteCommentByIdHandler = async (req: Request<{ id: string }>, res: Response<void | ExtensionType[]>) => {
  try {
    /*Получаем комментария блога.*/
    const commentId: string = req.params.id;
    /*Получаем ID пользователя.*/
    const userId: string = req.userId?.id as string;
    /*Просим сервис "commentsService" удалить комментарий по ID.*/
    const deletedCommentResult: Result<{} | null> = await commentsService.deleteById(commentId, userId);
    /*Получаем HTTP-статус операции по удалению комментария по ID.*/
    const deletedCommentResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(deletedCommentResult.status);

    /*Если комментарий не был удален, то сообщаем об этом клиенту.*/
    if (deletedCommentResultHttpStatus !== HttpStatuses.NoContent_204) {
      return res.status(deletedCommentResultHttpStatus).send(deletedCommentResult.extensions);
    }

    /*Если комментарий был удален, то сообщаем клиенту об этом.*/
    res.sendStatus(deletedCommentResultHttpStatus);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
