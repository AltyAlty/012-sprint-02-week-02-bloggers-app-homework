import { WithId } from 'mongodb';
import { CommentType } from '../../types/comment.type';
import { CommentOutputDTO } from '../../routes/output-dto/comment.output-dto';

/*Функция "mapToCommentOutputDTO()" преобразовывает комментарий из БД в подготовленный для отправки клиенту
комментарий.*/
export const mapToCommentOutputDTO = (comment: WithId<CommentType>): CommentOutputDTO => {
  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: { userId: comment.commentatorInfo.userId, userLogin: comment.commentatorInfo.userLogin },
    createdAt: comment.createdAt,
  };
};
