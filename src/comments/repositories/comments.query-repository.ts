import { Filter, ObjectId, WithId } from 'mongodb';
import { CommentType } from '../types/comment.type';
import { commentsCollection } from '../../db/mongodb/mongo.db';
import { GetCommentsListInPostQueryInputDTO } from '../routes/input-dto/get-comments-list-in-post-query.input-dto';
import { SortDirection } from '../../core/types/pagination/sort-direction';
import { CommentSortFieldInputDTO } from '../routes/input-dto/comment-sort-field.input-dto';

/*Query-репозиторий "commentsQueryRepository" для работы с комментариями в БД.*/
export const commentsQueryRepository = {
  /*Метод "findById()" для поиска комментария по ID в БД.*/
  async findById(commentId: string): Promise<WithId<CommentType> | null> {
    /*Просим коллекцию "commentsCollection" найти комментарий по ID в БД.*/
    const comment: WithId<CommentType> | null = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    /*Если комментарий не был найден, то возвращаем null.*/
    if (!comment) return null;
    /*Если комментарий был найден, то возвращаем его.*/
    return comment;
  },

  /*Метод "findManyByPostId()" для поиска комментариев в посте по ID в БД.*/
  async findManyByPostId(
    postId: string,
    queryDTO: GetCommentsListInPostQueryInputDTO
  ): Promise<{ items: WithId<CommentType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    }: {
      pageNumber: number;
      pageSize: number;
      sortBy: CommentSortFieldInputDTO;
      sortDirection: SortDirection;
    } = queryDTO;

    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра.*/
    const filter: Filter<CommentType> = {};
    /*Добавляем в фильтр ID поста.*/
    filter.postId = { $regex: postId, $options: 'i' };

    /*Просим коллекцию "commentsCollection" найти комментарии в посте по ID в БД и подсчитать общее количество
    документов, подходящих под фильтр, без учета пагинации.*/
    const [items, totalCount]: [WithId<CommentType>[], number] = await Promise.all([
      commentsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      commentsCollection.countDocuments(filter),
    ]);

    /*Возвращаем данные по комментариям.*/
    return { items, totalCount };
  },
};
