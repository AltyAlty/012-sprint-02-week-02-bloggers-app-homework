import { Filter, ObjectId, WithId } from 'mongodb';
import { UserType } from '../types/user.type';
import { usersCollection } from '../../db/mongodb/mongo.db';
import { GetUsersListQueryInputDTO } from '../routes/input-dto/get-users-list-query.input-dto';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';

/*Query-репозиторий "usersQueryRepository" для работы с данными по пользователям в БД.*/
export const usersQueryRepository = {
  /*Метод "findMany()" для поиска данных по пользователям в БД.*/
  async findMany(queryDTO: GetUsersListQueryInputDTO): Promise<{ items: WithId<UserType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } = queryDTO;
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. В итоге фильтр будет работать так: для получения пользователя
    нужно совпадение хотя бы по одному полю в фильтре, а не по всем сразу.*/
    const conditions: Filter<UserType>[] = [];
    if (searchLoginTerm) conditions.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    if (searchEmailTerm) conditions.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    const filter: Filter<UserType> = conditions.length > 0 ? { $or: conditions } : {};

    /*Просим коллекцию "usersCollection" найти данные по пользователям в БД.*/
    const items = await usersCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    /*Просим коллекцию "usersCollection" подсчитать общее количество документов, подходящих под фильтр, без учета
    пагинации.*/
    const totalCount = await usersCollection.countDocuments(filter);
    /*Возвращаем найденные данные по блогам.*/
    return { items, totalCount };
  },

  /*Метод "findById()" для поиска данных по пользователю по ID в БД.*/
  async findById(userId: string): Promise<WithId<UserType>> {
    /*Просим коллекцию "usersCollection" найти данные по пользователю по ID в БД.*/
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    /*Если данные по пользователю не были найдены, то выкидываем ошибку.*/
    if (!user) throw new RepositoryNotFoundError('User does not exist');
    /*Если данные по пользователю были найдены, то возвращаем их.*/
    return user;
  },
};
