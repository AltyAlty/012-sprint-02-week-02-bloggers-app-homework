import { Filter, ObjectId, WithId } from 'mongodb';
import { CommentType } from '../types/comment.type';
import { commentsCollection } from '../../db/mongodb/mongo.db';
import { GetCommentsListInExistingPostQueryInputDTO } from '../routes/input-dto/get-comments-list-in-existing-post-query.input-dto';

/*Query-репозиторий "commentsQueryRepository" для работы с данными по комментариям в БД.*/
export const commentsQueryRepository = {
  /*Метод "findById()" для поиска данных по комментарию по ID в БД.*/
  async findById(commentId: string): Promise<WithId<CommentType> | null> {
    /*Просим коллекцию "commentsCollection" найти данные по комментарию по ID в БД.*/
    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    /*Если данные по комментарию не были найдены, то возвращаем null.*/
    if (!comment) return null;
    /*Если данные по комментарию были найдены, то возвращаем их.*/
    return comment;
  },

  /*Метод "findManyByPostId()" для поиска данных по всем комментариям в существующем посте по ID в БД.*/
  async findManyByPostId(
    postId: string,
    queryDTO: GetCommentsListInExistingPostQueryInputDTO
  ): Promise<{ items: WithId<CommentType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDTO;
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра.*/
    const filter: Filter<CommentType> = {};
    /*Добавляем в фильтр ID поста.*/
    filter.postId = { $regex: postId, $options: 'i' };

    /*Просим коллекцию "commentsCollection" найти данные по всем комментариям в существующем посте по ID в БД и
    подсчитать общее количество документов, подходящих под фильтр, без учета пагинации.*/
    const [items, totalCount] = await Promise.all([
      commentsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      commentsCollection.countDocuments(filter),
    ]);

    /*Возвращаем найденные данные по всем комментариям в существующем посте.*/
    return { items, totalCount };
  },
};
