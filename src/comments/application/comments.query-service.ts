import { Result } from '../../core/types/result/result.type';
import { CommentOutputDTO } from '../routes/output-dto/comment.output-dto';
import { commentsQueryRepository } from '../repositories/comments.query-repository';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { mapToCommentOutputDTO } from '../repositories/mappers/map-to-comment-output-dto.util';
import { GetCommentsListInPostQueryInputDTO } from '../routes/input-dto/get-comments-list-in-post-query.input-dto';
import { PaginatedCommentsListOutputDTO } from '../routes/output-dto/paginated-comments-list.output-dto';
import { mapToPaginatedCommentsListOutputDTO } from '../repositories/mappers/map-to-paginated-comments-list-output-dto.util';
import { WithId } from 'mongodb';
import { CommentType } from '../types/comment.type';
import { postsService } from '../../posts/application/posts.service';
import { PostOutputDTO } from '../../posts/routes/output-dto/post.output-dto';

/*Query-сервис "commentsQueryService" для работы с комментариями.*/
export const commentsQueryService = {
  /*Метод "findById()" для поиска комментария по ID.*/
  async findById(commentId: string): Promise<Result<{ commentOutput: CommentOutputDTO } | null>> {
    /*Просим query-репозиторий "commentsQueryRepository" найти комментарий по ID в БД.*/
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

    /*Если комментарий был найден, то преобразовываем комментарий из БД в подготовленный для отправки клиенту
    комментарий.*/
    const commentOutput: CommentOutputDTO = mapToCommentOutputDTO(commentDB);

    /*Возвращаем ResultObject c преобразованным комментарием.*/
    return {
      status: ResultStatuses.Ok,
      data: { commentOutput },
      extensions: [],
    };
  },

  /*Метод "findManyByPostId()" для поиска комментариев в посте по ID.*/
  async findManyByPostId(
    postId: string,
    queryDTO: GetCommentsListInPostQueryInputDTO
  ): Promise<Result<{ paginatedCommentsListOutput: PaginatedCommentsListOutputDTO } | null>> {
    /*Просим сервис "postsService" найти пост по ID.*/
    const postResult: Result<{ postOutput: PostOutputDTO } | null> = await postsService.findById(postId);

    /*Если пост не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!postResult.data!.postOutput) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'postId', message: 'Not Found' }],
      };
    }

    /*Если пост был найден, то просим query-репозиторий "commentsQueryRepository" найти комментарии в посте по ID в
    БД.*/
    const { items, totalCount }: { items: WithId<CommentType>[]; totalCount: number } =
      await commentsQueryRepository.findManyByPostId(postId, queryDTO);

    /*Преобразовываем комментарии из БД в подготовленные для пагинации комментарии.*/
    const paginatedCommentsListOutput: PaginatedCommentsListOutputDTO = mapToPaginatedCommentsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject c преобразованными для пагинации комментариями.*/
    return {
      status: ResultStatuses.Ok,
      data: { paginatedCommentsListOutput },
      extensions: [],
    };
  },
};
