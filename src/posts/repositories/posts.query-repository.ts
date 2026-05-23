import { Filter, ObjectId, WithId } from 'mongodb';
import { PostType } from '../types/post.type';
import { postsCollection } from '../../db/mongodb/mongo.db';
import { GetPostsListQueryInputDTO } from '../routes/input-dto/get-posts-list-query.input-dto';

/*Query-репозиторий "postsQueryRepository" для работы с данными по постам в БД.*/
export const postsQueryRepository = {
  /*Метод "findManyByBlogId()" для поиска данных по всем постам в существующем блоге по ID в БД.*/
  async findManyByBlogId(
    blogId: string,
    queryDTO: GetPostsListQueryInputDTO
  ): Promise<{ items: WithId<PostType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDTO;
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра.*/
    const filter: Filter<PostType> = {};
    /*Добавляем в фильтр ID блога.*/
    filter.blogId = { $regex: blogId, $options: 'i' };

    /*Просим коллекцию "postsCollection" найти данные по всем постам в существующем блоге по ID в БД и подсчитать общее
    количество документов, подходящих под фильтр, без учета пагинации.*/
    const [items, totalCount] = await Promise.all([
      postsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      postsCollection.countDocuments(filter),
    ]);

    /*Возвращаем найденные данные по всем постам в существующем блоге.*/
    return { items, totalCount };
  },

  /*Метод "findById()" для поиска данных по посту по ID в БД.*/
  async findById(postId: string): Promise<WithId<PostType> | null> {
    /*Просим коллекцию "postsCollection" найти данные по посту по ID в БД.*/
    const res = await postsCollection.findOne({ _id: new ObjectId(postId) });
    /*Если данные по посту не были найдены, то возвращаем null.*/
    if (!res) return null;
    /*Если данные по посту были найдены, то возвращаем их.*/
    return res;
  },

  /*Метод "findMany()" для поиска данных по постам в БД.*/
  async findMany(queryDTO: GetPostsListQueryInputDTO): Promise<{ items: WithId<PostType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDTO;
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра.*/
    const filter: Filter<PostType> = {};

    /*Просим коллекцию "postsCollection" найти данные по всем постам в БД и подсчитать общее количество документов,
    подходящих под фильтр, без учета пагинации.*/
    const [items, totalCount] = await Promise.all([
      postsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      postsCollection.countDocuments(filter),
    ]);

    /*Возвращаем найденные данные по всем постам.*/
    return { items, totalCount };
  },
};
