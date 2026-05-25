import { Request, Response } from 'express';
import { CreateCommentInExistingPostInputDTO } from '../../../comments/routes/input-dto/create-comment-in-existing-post.input-dto';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { commentsService } from '../../../comments/application/comments.service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/mapResultCodeToHttpStatus';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { commentsQueryService } from '../../../comments/application/comments.query-service';
import { ExtensionType, Result } from '../../../core/types/result/result.type';
import { CommentOutputDTO } from '../../../comments/routes/output-dto/comment.output-dto';

/*Функция-обработчик "createCommentInExistingPostByIdHandler()" для POST-запросов для добавления нового комментария в
существующий пост по ID при помощи URI-параметров.*/
export const createCommentInExistingPostByIdHandler = async (
  req: Request<{ postId: string }, {}, CreateCommentInExistingPostInputDTO>,
  res: Response<CommentOutputDTO | ExtensionType[]>
) => {
  try {
    /*Получаем ID поста.*/
    const postId: string = req.params.postId;
    /*Получаем ID пользователя.*/
    const userId: string = req.userId?.id as string;

    /*Просим сервис "commentsService" создать комментарий в существующем посте.*/
    const createdCommentResult: Result<{ commentId: string } | null> = await commentsService.createInExistingPost(
      postId,
      userId,
      req.body
    );

    /*Получаем HTTP-статус операции по созданию комментария в существующем посте.*/
    const createdCommentResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(createdCommentResult.status);

    /*Если комментарий не был создан, то сообщаем об этом клиенту.*/
    if (createdCommentResultHttpStatus !== HttpStatuses.Created_201) {
      return res.status(createdCommentResultHttpStatus).send(createdCommentResult.extensions);
    }

    /*Если комментарий был создан, то просим query-сервис "commentsQueryService" найти данные по созданному комментарию
    по ID.*/
    const commentResult: Result<{ commentOutput: CommentOutputDTO } | null> = await commentsQueryService.findById(
      createdCommentResult.data!.commentId
    );

    /*Получаем HTTP-статус операции по поиску данных по созданному комментарию по ID.*/
    const commentResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(commentResult.status);

    /*Если данные по созданному комментарию не были найдены, то сообщаем об этом клиенту.*/
    if (commentResultHttpStatus !== HttpStatuses.Ok_200) {
      return res.status(commentResultHttpStatus).send(commentResult.extensions);
    }

    /*Если данные по созданному комментарию были найдены, то отправляем их клиенту.*/
    res.status(createdCommentResultHttpStatus).send(commentResult.data?.commentOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
