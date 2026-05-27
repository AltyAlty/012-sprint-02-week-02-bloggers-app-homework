import { UpdateCommentInputDTO } from '../routes/input-dto/update-comment.input-dto';
import { commentsCollection } from '../../db/mongodb/mongo.db';
import { DeleteResult, InsertOneResult, ObjectId, UpdateResult, WithId } from 'mongodb';
import { CommentType } from '../types/comment.type';

/*Репозиторий "commentsRepository" для работы с комментариями в БД.*/
export const commentsRepository = {
  /*Метод "findById()" для поиска комментария по ID в БД.*/
  async findById(commentId: string): Promise<WithId<CommentType> | null> {
    /*Просим коллекцию "commentsCollection" найти комментарий по ID в БД.*/
    const comment: WithId<CommentType> | null = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    /*Если комментарий не был найден, то возвращаем null.*/
    if (!comment) return null;
    /*Если комментарий был найден, то возвращаем его.*/
    return comment;
  },

  /*Метод "findAllByPostId()" для поиска комментариев в посте по ID в БД.*/
  async findAllByPostId(postId: string): Promise<WithId<CommentType>[] | null> {
    /*Просим коллекцию "commentsCollection" найти комментарии в посте по ID в БД.*/
    const comments: WithId<CommentType>[] = await commentsCollection.find({ postId: postId }).toArray();
    /*Если комментариев не было найдено, то возвращаем null.*/
    if (!comments || comments.length === 0) return null;
    /*Если комментарии были найдены, то возвращаем их.*/
    return comments;
  },

  /*Метод "findAllByUserId()" для поиска комментариев пользователя по ID в БД.*/
  async findAllByUserId(userId: string): Promise<WithId<CommentType>[] | null> {
    /*Просим коллекцию "commentsCollection" найти комментарии пользователя по ID в БД.*/
    const comments: WithId<CommentType>[] = await commentsCollection
      .find({ 'commentatorInfo.userId': userId })
      .toArray();

    /*Если комментариев не было найдено, то возвращаем null.*/
    if (!comments || comments.length === 0) return null;
    /*Если комментарии были найдены, то возвращаем их.*/
    return comments;
  },

  /*Метод "create()" для добавления комментария в БД.*/
  async create(newComment: CommentType): Promise<string> {
    /*Просим коллекцию "commentsCollection" создать комментарий в БД.*/
    const insertResult: InsertOneResult<CommentType> = await commentsCollection.insertOne(newComment);
    /*Возвращаем ID созданного комментария.*/
    return insertResult.insertedId.toString();
  },

  /*Метод "updateById()" для изменения комментария по ID в БД.*/
  async updateById(commentId: string, dto: UpdateCommentInputDTO): Promise<number> {
    /*Просим коллекцию "commentsCollection" изменить комментарий по ID в БД.*/
    const updateResult: UpdateResult<CommentType> = await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { content: dto.content } }
    );

    /*Возвращаем количество измененных комментариев.*/
    return updateResult.matchedCount;
  },

  /*Метод "deleteById()" для удаления комментария по ID в БД.*/
  async deleteById(commentId: string): Promise<number> {
    /*Просим коллекцию "commentsCollection" удалить комментарий по ID в БД.*/
    const deleteResult: DeleteResult = await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
    /*Возвращаем количество удаленных комментариев.*/
    return deleteResult.deletedCount;
  },
};
