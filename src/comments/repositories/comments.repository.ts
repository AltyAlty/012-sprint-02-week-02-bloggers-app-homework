import { UpdateCommentInputDTO } from '../routes/input-dto/update-comment.input-dto';
import { commentsCollection } from '../../db/mongodb/mongo.db';
import { DeleteResult, InsertOneResult, ObjectId, UpdateResult, WithId } from 'mongodb';
import { CommentType } from '../types/comment.type';

/*Репозиторий "commentsRepository" для работы с данными по комментариям в БД.*/
export const commentsRepository = {
  /*Метод "updateById()" для изменения данных комментария по ID в БД.*/
  async updateById(commentId: string, dto: UpdateCommentInputDTO): Promise<number> {
    /*Просим коллекцию "commentsCollection" изменить данные комментария по ID в БД.*/
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

  /*Метод "create()" для добавления нового комментария в БД.*/
  async create(newComment: CommentType): Promise<string> {
    /*Просим коллекцию "commentsCollection" создать новый комментарий в БД.*/
    const insertResult: InsertOneResult<CommentType> = await commentsCollection.insertOne(newComment);
    /*Возвращаем ID созданного комментария.*/
    return insertResult.insertedId.toString();
  },

  /*Метод "findById()" для поиска комментария по ID в БД.*/
  async findById(commentId: string): Promise<WithId<CommentType> | null> {
    /*Просим коллекцию "commentsCollection" найти данные по комментарию по ID в БД.*/
    const comment: WithId<CommentType> | null = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    /*Если данные по комментарию не были найдены, то возвращаем null.*/
    if (!comment) return null;
    /*Если данные по комментарию были найдены, то возвращаем их.*/
    return comment;
  },

  /*Метод "findAllByPostId()" для поиска всех комментариев в посте по ID в БД.*/
  async findAllByPostId(postId: string): Promise<WithId<CommentType>[] | null> {
    /*Просим коллекцию "commentsCollection" найти все комментарии в посте по ID в БД.*/
    const comments: WithId<CommentType>[] = await commentsCollection.find({ postId: postId }).toArray();
    /*Если комментариев не было найдено, то возвращаем null.*/
    if (!comments || comments.length === 0) return null;
    /*Если комментарии были найдены, то возвращаем данные о них.*/
    return comments;
  },

  /*Метод "deleteManyByIds()" для удаления нескольких комментариев по их ID в БД.*/
  async deleteManyByIds(commentsIds: ObjectId[]): Promise<number> {
    /*Просим коллекцию "commentsCollection" удалить несколько комментариев по их ID в БД.*/
    const result: DeleteResult = await commentsCollection.deleteMany({ _id: { $in: commentsIds } });
    /*Возвращаем количество удаленных комментариев.*/
    return result.deletedCount;
  },
};
