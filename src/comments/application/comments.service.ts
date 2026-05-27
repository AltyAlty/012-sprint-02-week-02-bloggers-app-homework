import { UpdateCommentInputDTO } from '../routes/input-dto/update-comment.input-dto';
import { Result } from '../../core/types/result/result.type';
import { commentsRepository } from '../repositories/comments.repository';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { CreateCommentInPostInputDTO } from '../routes/input-dto/create-comment-in-post.input-dto';
import { CommentType } from '../types/comment.type';
import { WithId } from 'mongodb';
import { usersService } from '../../users/application/users.service';
import { UserOutputDTO } from '../../users/routes/output-dto/user.output-dto';
import { postsService } from '../../posts/application/posts.service';
import { PostOutputDTO } from '../../posts/routes/output-dto/post.output-dto';

/*Сервис "commentsService" для работы с комментариями.*/
export const commentsService = {
  /*Метод "findAllByPostId()" для поиска комментариев в посте по ID.*/
  async findAllByPostId(postId: string): Promise<Result<{ commentsDB: WithId<CommentType>[] | null }>> {
    /*Просим репозиторий "commentsRepository" найти комментарии в посте по ID в БД.*/
    const commentsDB: WithId<CommentType>[] | null = await commentsRepository.findAllByPostId(postId);

    /*Возвращаем ResultObject c комментариями.*/
    return {
      status: ResultStatuses.Ok,
      data: { commentsDB },
      extensions: [],
    };
  },

  /*Метод "findAllByUserId()" для поиска комментариев пользователя по ID.*/
  async findAllByUserId(userId: string): Promise<Result<{ commentsDB: WithId<CommentType>[] | null }>> {
    /*Просим репозиторий "commentsRepository" найти комментарии пользователя по ID.*/
    const commentsDB: WithId<CommentType>[] | null = await commentsRepository.findAllByUserId(userId);

    /*Возвращаем ResultObject c данными по комментариям.*/
    return {
      status: ResultStatuses.Ok,
      data: { commentsDB },
      extensions: [],
    };
  },

  /*Метод "createInPost()" для добавления комментария в пост.*/
  async createInPost(
    postId: string,
    userId: string,
    dto: CreateCommentInPostInputDTO
  ): Promise<Result<{ commentId: string } | null>> {
    /*Просим сервис "usersService" найти пользователя по ID.*/
    const userResult: Result<{ userOutput: UserOutputDTO } | null> = await usersService.findById(userId);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userResult.data!.userOutput) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'userId', message: 'Not Found' }],
      };
    }

    /*Если пользователь был найден, то просим сервис "postsService" найти пост по ID.*/
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

    /*Если пользователь и пост были найдены, то создаем объект с данными нового комментария.*/
    const newComment: CommentType = {
      content: dto.content,
      postId: postId,
      commentatorInfo: { userId, userLogin: userResult.data!.userOutput.login },
      createdAt: new Date(),
    };

    /*Просим репозиторий "commentsRepository" создать комментарий в БД.*/
    const commentId: string = await commentsRepository.create(newComment);

    /*Возвращаем ResultObject c ID созданного комментария.*/
    return {
      status: ResultStatuses.Created,
      data: { commentId },
      extensions: [],
    };
  },

  /*Метод "updateById()" для изменения комментария по ID.*/
  async updateById(commentId: string, dto: UpdateCommentInputDTO, userId?: string): Promise<Result<{} | null>> {
    /*Просим репозиторий "commentsRepository" найти комментарий по ID в БД.*/
    const commentDB: WithId<CommentType> | null = await commentsRepository.findById(commentId);

    /*Если комментарий не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!commentDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'commentId', message: 'Not Found' }],
      };
    }

    /*Если комментарий был найден, но пользователь не является его автором, то возвращаем ResultObject с информацией об
    этом.*/
    if (userId && commentDB.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatuses.Forbidden,
        data: null,
        errorMessage: 'Forbidden',
        extensions: [{ field: 'userId', message: 'Forbidden' }],
      };
    }

    /*Если пользователь является автором комментария, то просим репозиторий "commentsRepository" изменить комментарий по
    ID в БД.*/
    const updatedCommentCount: number = await commentsRepository.updateById(commentId, dto);

    /*Если комментарий не был изменен, то возвращаем ResultObject с информацией об этом.*/
    if (updatedCommentCount < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'commentId', message: 'Not Found' }],
      };
    }

    /*Если комментарий был изменен, то возвращаем ResultObject c информацией об этом.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод "deleteById()" для удаления комментария по ID.*/
  async deleteById(commentId: string, userId?: string): Promise<Result<{} | null>> {
    /*Просим репозиторий "commentsRepository" найти комментарий по ID в БД.*/
    const commentDB: WithId<CommentType> | null = await commentsRepository.findById(commentId);

    /*Если комментарий не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!commentDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'commentId', message: 'Not Found' }],
      };
    }

    /*Если комментарий был найден, но пользователь не является его автором, то возвращаем ResultObject с информацией об
    этом.*/
    if (userId && commentDB.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatuses.Forbidden,
        data: null,
        errorMessage: 'Forbidden',
        extensions: [{ field: 'userId', message: 'Forbidden' }],
      };
    }

    /*Если пользователь является автором комментария, то просим репозиторий "commentsRepository" удалить комментарий по
    ID в БД.*/
    const deletedCommentCount: number = await commentsRepository.deleteById(commentId);

    /*Если комментарий не был удален, то возвращаем ResultObject с информацией об этом.*/
    if (deletedCommentCount < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'commentId', message: 'Not Found' }],
      };
    }

    /*Если комментарий был удален, то возвращаем ResultObject c информацией об этом.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },
};
