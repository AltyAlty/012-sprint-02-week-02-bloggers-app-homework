import { UpdateCommentInputDTO } from '../routes/input-dto/update-comment.input-dto';
import { Result } from '../../core/types/result/result.type';
import { commentsRepository } from '../repositories/comments.repository';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { CreateCommentInExistingPostInputDTO } from '../routes/input-dto/create-comment-in-existing-post.input-dto';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { CommentType } from '../types/comment.type';
import { usersRepository } from '../../users/repositories/users.repository';
import { ObjectId, WithId } from 'mongodb';

/*Сервис "commentsService" для работы с данными по комментариям.*/
export const commentsService = {
  /*Метод "updateById()" для изменения данных комментария по ID.*/
  async updateById(commentId: string, userId: string, dto: UpdateCommentInputDTO): Promise<Result<{} | null>> {
    /*Просим репозиторий "commentsRepository" проверить по ID существует ли комментарий в БД.*/
    const commentDB = await commentsRepository.findById(commentId);

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
    if (commentDB.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatuses.Forbidden,
        data: null,
        errorMessage: 'Forbidden',
        extensions: [{ field: 'userId', message: 'Forbidden' }],
      };
    }

    /*Если пользователь является автором комментария, то просим репозиторий "commentsRepository" изменить данные
    комментария по ID в БД.*/
    const updatedCommentResult = await commentsRepository.updateById(commentId, dto);

    /*Если комментарий не был изменен, то возвращаем ResultObject с информацией об этом.*/
    if (updatedCommentResult < 1) {
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
  async deleteById(commentId: string, userId: string): Promise<Result<{} | null>> {
    /*Просим репозиторий "commentsRepository" проверить по ID существует ли комментарий в БД.*/
    const commentDB = await commentsRepository.findById(commentId);

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
    if (commentDB.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatuses.Forbidden,
        data: null,
        errorMessage: 'Forbidden',
        extensions: [{ field: 'userId', message: 'Forbidden' }],
      };
    }

    /*Если пользователь является автором комментария, то просим репозиторий "commentsRepository" удалить комментарий по
    ID в БД.*/
    const deletedPostResult = await commentsRepository.deleteById(commentId);

    /*Если комментарий не был удален, то возвращаем ResultObject с информацией об этом.*/
    if (deletedPostResult < 1) {
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

  /*Метод "createInExistingPost()" для добавления нового комментария в существующий пост.*/
  async createInExistingPost(
    postId: string,
    userId: string,
    dto: CreateCommentInExistingPostInputDTO
  ): Promise<Result<{ commentId: string } | null>> {
    /*Просим репозиторий "usersRepository" проверить по ID существует ли пользователь в БД.*/
    const userDB = await usersRepository.findById(userId);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'userId', message: 'Not Found' }],
      };
    }

    /*Просим репозиторий "postsRepository" проверить по ID существует ли пост в БД.*/
    const postDB = await postsRepository.findById(postId);

    /*Если пост не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!postDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'postId', message: 'Not Found' }],
      };
    }

    /*Если пользователь и пост были найдены, то создаем объект с данными по новому комментарию.*/
    const newComment: CommentType = {
      content: dto.content,
      postId: postId,
      commentatorInfo: { userId, userLogin: userDB.login },
      createdAt: new Date(),
    };

    /*Просим репозиторий "commentsRepository" создать новый комментарий в БД.*/
    const commentId = await commentsRepository.create(newComment);

    /*Возвращаем ResultObject c ID комментария.*/
    return {
      status: ResultStatuses.Created,
      data: { commentId },
      extensions: [],
    };
  },

  /*Метод "findAllByPostId()" для поиска всех комментариев в посте по ID.*/
  async findAllByPostId(postId: string): Promise<Result<{ commentsDB: WithId<CommentType>[] | null }>> {
    /*Просим репозиторий "commentsRepository" найти все комментарии в посте по ID в БД.*/
    const commentsDB = await commentsRepository.findAllByPostId(postId);

    /*Возвращаем ResultObject c данными по комментариям.*/
    return {
      status: ResultStatuses.Ok,
      data: { commentsDB },
      extensions: [],
    };
  },

  /*Метод "deleteManyByIds()" для удаления нескольких комментариев по их ID.*/
  async deleteManyByIds(commentsIds: ObjectId[]): Promise<Result<{ deletedCommentsResult: number }>> {
    /*Просим репозиторий "commentsRepository" удалить несколько комментариев по их ID в БД.*/
    const deletedCommentsResult = await commentsRepository.deleteManyByIds(commentsIds);

    /*Возвращаем ResultObject c информацией о количестве удаленных комментариев.*/
    return {
      status: ResultStatuses.NoContent,
      data: { deletedCommentsResult },
      extensions: [],
    };
  },
};
