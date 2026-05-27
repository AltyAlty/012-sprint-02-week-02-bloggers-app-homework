import { Filter, ObjectId, WithId } from 'mongodb';
import { UserType } from '../types/user.type';
import { usersCollection } from '../../db/mongodb/mongo.db';
import { GetUsersListQueryInputDTO } from '../routes/input-dto/get-users-list-query.input-dto';
import { SortDirection } from '../../core/types/pagination/sort-direction';
import { UserSortFieldInputDTO } from '../routes/input-dto/user-sort-field.input-dto';

/*Query-репозиторий "usersQueryRepository" для работы с пользователями в БД.*/
export const usersQueryRepository = {
  /*Метод "findById()" для поиска пользователя по ID в БД.*/
  async findById(userId: string): Promise<WithId<UserType> | null> {
    /*Просим коллекцию "usersCollection" найти пользователя по ID в БД.*/
    const user: WithId<UserType> | null = await usersCollection.findOne({ _id: new ObjectId(userId) });
    /*Если пользователь не был найден, то возвращаем null.*/
    if (!user) return null;
    /*Если пользователь был найден, то возвращаем его.*/
    return user;
  },

  /*Метод "findMany()" для поиска пользователей в БД.*/
  async findMany(queryDTO: GetUsersListQueryInputDTO): Promise<{ items: WithId<UserType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    }: {
      pageNumber: number;
      pageSize: number;
      sortBy: UserSortFieldInputDTO;
      sortDirection: SortDirection;
      searchLoginTerm?: string | undefined;
      searchEmailTerm?: string | undefined;
    } = queryDTO;

    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip: number = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. В итоге фильтр будет работать так: для получения пользователя
    нужно совпадение хотя бы по одному полю в фильтре, а не по всем сразу.*/
    const conditions: Filter<UserType>[] = [];
    if (searchLoginTerm) conditions.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    if (searchEmailTerm) conditions.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    const filter: Filter<UserType> = conditions.length > 0 ? { $or: conditions } : {};

    /*Просим коллекцию "usersCollection" найти пользователей по ID в БД и подсчитать общее количество документов,
    подходящих под фильтр, без учета пагинации.*/
    const [items, totalCount]: [WithId<UserType>[], number] = await Promise.all([
      usersCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      usersCollection.countDocuments(filter),
    ]);

    /*Возвращаем данные по пользователям.*/
    return { items, totalCount };
  },
};
