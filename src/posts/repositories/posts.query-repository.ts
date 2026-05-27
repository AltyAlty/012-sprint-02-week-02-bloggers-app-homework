import { Filter, ObjectId, WithId } from 'mongodb';
import { PostType } from '../types/post.type';
import { postsCollection } from '../../db/mongodb/mongo.db';
import { GetPostsListQueryInputDTO } from '../routes/input-dto/get-posts-list-query.input-dto';
import { SortDirection } from '../../core/types/pagination/sort-direction';
import { PostSortFieldInputDTO } from '../routes/input-dto/post-sort-field.input-dto';

/*Query-репозиторий "postsQueryRepository" для работы с постами в БД.*/
export const postsQueryRepository = {
  /*Метод "findById()" для поиска поста по ID в БД.*/
  async findById(postId: string): Promise<WithId<PostType> | null> {
    /*Просим коллекцию "postsCollection" найти пост по ID в БД.*/
    const result: WithId<PostType> | null = await postsCollection.findOne({ _id: new ObjectId(postId) });
    /*Если пост не был найден, то возвращаем null.*/
    if (!result) return null;
    /*Если пост был найден, то возвращаем его.*/
    return result;
  },

  /*Метод "findMany()" для поиска постов в БД.*/
  async findMany(
    queryDTO: GetPostsListQueryInputDTO,
    blogId?: string
  ): Promise<{ items: WithId<PostType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    }: {
      pageNumber: number;
      pageSize: number;
      sortBy: PostSortFieldInputDTO;
      sortDirection: SortDirection;
    } = queryDTO;

    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра.*/
    const filter: Filter<PostType> = {};
    /*Если был указан ID блога, то добавляем его в фильтр.*/
    if (blogId) filter.blogId = { $regex: blogId, $options: 'i' };

    /*Просим коллекцию "postsCollection" найти посты в БД и подсчитать общее количество документов, подходящих под
    фильтр, без учета пагинации.*/
    const [items, totalCount]: [WithId<PostType>[], number] = await Promise.all([
      postsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      postsCollection.countDocuments(filter),
    ]);

    /*Возвращаем данные по постам.*/
    return { items, totalCount };
  },
};
