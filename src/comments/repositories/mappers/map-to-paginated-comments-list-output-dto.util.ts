import { WithId } from 'mongodb';
import { CommentType } from '../../types/comment.type';
import { PaginatedCommentsListOutputDTO } from '../../routes/output-dto/paginated-comments-list.output-dto';
import { CommentOutputDTO } from '../../routes/output-dto/comment.output-dto';

/*Функция "mapToPaginatedCommentsListOutputDTO()" преобразовывает комментарии из БД в подготовленные для пагинации
комментарии.*/
export const mapToPaginatedCommentsListOutputDTO = (
  comments: WithId<CommentType>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number }
): PaginatedCommentsListOutputDTO => {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: comments.map(
      (comment): CommentOutputDTO => ({
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
      })
    ),
  };
};
