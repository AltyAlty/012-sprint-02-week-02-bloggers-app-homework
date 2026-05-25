import { Request, Response } from 'express';
import { UpdateCommentInputDTO } from '../input-dto/update-comment.input-dto';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { commentsService } from '../../application/comments.service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';

/*Функция-обработчик "updateCommentByIdHandler()" для PUT-запросов для изменения данных комментария по ID при помощи
URI-параметров.*/
export const updateCommentByIdHandler = async (
  req: Request<{ id: string }, {}, UpdateCommentInputDTO>,
  res: Response
) => {
  try {
    /*Получаем ID комментария.*/
    const commentId = req.params.id;
    /*Получаем ID пользователя.*/
    const userId = req.userId?.id as string;
    /*Просим сервис "commentsService" изменить данные комментария по ID.*/
    const updatedCommentResult = await commentsService.updateById(commentId, userId, req.body);
    /*Получаем HTTP-статус операции по изменению данных комментария по ID.*/
    const updatedCommentResultHttpStatus = mapResultCodeToHttpStatus(updatedCommentResult.status);

    /*Если комментарий не был изменен, то сообщаем об этом клиенту.*/
    if (updatedCommentResultHttpStatus !== HttpStatuses.NoContent_204) {
      return res.status(updatedCommentResultHttpStatus).send(updatedCommentResult.extensions);
    }

    /*Если комментарий был изменен, то сообщаем клиенту об этом.*/
    res.sendStatus(updatedCommentResultHttpStatus);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
