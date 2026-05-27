import { DeleteResult, InsertOneResult, ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../db/mongodb/mongo.db';
import { UserType } from '../types/user.type';

/*Репозиторий "usersRepository" для работы с пользователями в БД.*/
export const usersRepository = {
  /*Метод "findByLoginOrEmail()" для поиска пользователя по логину/email в БД.*/
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserType> | null> {
    /*Просим коллекцию "usersCollection" найти пользователя по логину/email в БД.*/
    const user: WithId<UserType> | null = await usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });

    /*Если пользователь не был найден, то возвращаем null.*/
    if (!user) return null;
    /*Если пользователь был найден, то возвращаем его.*/
    return user;
  },

  /*Метод "findById()" для поиска пользователя по ID в БД.*/
  async findById(userId: string): Promise<WithId<UserType> | null> {
    /*Просим коллекцию "usersCollection" найти пользователя по ID в БД.*/
    const user: WithId<UserType> | null = await usersCollection.findOne({ _id: new ObjectId(userId) });
    /*Если пользователь не был найден, то возвращаем null.*/
    if (!user) return null;
    /*Если пользователь был найден, то возвращаем его.*/
    return user;
  },

  /*Метод "create()" для добавления пользователя в БД.*/
  async create(newUser: UserType): Promise<string> {
    /*Просим коллекцию "usersCollection" создать пользователя в БД.*/
    const insertResult: InsertOneResult<UserType> = await usersCollection.insertOne(newUser);
    /*Возвращаем ID созданного пользователя.*/
    return insertResult.insertedId.toString();
  },

  /*Метод "deleteById()" для удаления пользователя по ID в БД.*/
  async deleteById(userId: string): Promise<number> {
    /*Просим коллекцию "usersCollection" удалить пользователя по ID в БД.*/
    const deleteResult: DeleteResult = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    /*Возвращаем количество удаленных пользователей.*/
    return deleteResult.deletedCount;
  },
};
