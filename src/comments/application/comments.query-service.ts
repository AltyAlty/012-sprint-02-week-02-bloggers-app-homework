import { Result } from '../../core/types/result/result.type';
import { CommentOutputDTO } from '../routes/output-dto/comment.output-dto';
import { commentsQueryRepository } from '../repositories/comments.query-repository';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { mapToCommentOutputDTO } from '../repositories/mappers/map-to-comment-output-dto.util';
import { GetCommentsListInExistingPostQueryInputDTO } from '../routes/input-dto/get-comments-list-in-existing-post-query.input-dto';
import { PaginatedCommentsListOutputDTO } from '../routes/output-dto/paginated-comments-list.output-dto';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { mapToPaginatedCommentsListOutputDTO } from '../repositories/mappers/map-to-paginated-comments-list-output-dto.util';
import { WithId } from 'mongodb';
import { CommentType } from '../types/comment.type';
import { PostType } from '../../posts/types/post.type';

/*Query-сервис "commentsQueryService" для работы с данными по комментариям.*/
export const commentsQueryService = {
  /*Метод "findById()" для поиска данных по комментарию по ID.*/
  async findById(commentId: string): Promise<Result<{ commentOutput: CommentOutputDTO } | null>> {
    /*Просим query-репозиторий "commentsQueryRepository" найти данные по комментарию по ID в БД.*/
    const commentDB: WithId<CommentType> | null = await commentsQueryRepository.findById(commentId);

    /*Если комментарий не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!commentDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'commentId', message: 'Not Found' }],
      };
    }

    /*Если комментарий был найден, то преобразовываем данные по комментарию из БД в подготовленные для отправки клиенту
    данные.*/
    const commentOutput: CommentOutputDTO = mapToCommentOutputDTO(commentDB);

    /*Возвращаем ResultObject c преобразованными данными по комментарию.*/
    return {
      status: ResultStatuses.Ok,
      data: { commentOutput },
      extensions: [],
    };
  },

  /*Метод "findManyByPostId()" для поиска данных по всем комментариям в существующем блоге по ID.*/
  async findManyByPostId(
    postId: string,
    queryDTO: GetCommentsListInExistingPostQueryInputDTO
  ): Promise<Result<{ paginatedCommentsListOutput: PaginatedCommentsListOutputDTO } | null>> {
    /*Просим репозиторий "postsRepository" проверить по ID существует ли пост в БД.*/
    const postDB: WithId<PostType> | null = await postsRepository.findById(postId);

    /*Если пост не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!postDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'postId', message: 'Not Found' }],
      };
    }

    /*Если пост был найден, то просим query-репозиторий "commentsQueryRepository" найти данные по комментариям в
    существующем посте по ID в БД.*/
    const { items, totalCount }: { items: WithId<CommentType>[]; totalCount: number } =
      await commentsQueryRepository.findManyByPostId(postId, queryDTO);

    /*Преобразовываем данные по комментариям из БД в подготовленные для пагинации данные.*/
    const paginatedCommentsListOutput: PaginatedCommentsListOutputDTO = mapToPaginatedCommentsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject c преобразованными для пагинации данными по комментариям.*/
    return {
      status: ResultStatuses.Ok,
      data: { paginatedCommentsListOutput },
      extensions: [],
    };
  },
};
