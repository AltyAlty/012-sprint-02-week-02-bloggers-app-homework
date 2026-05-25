import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../db/mongodb/mongo.db';
import { UserType } from '../types/user.type';

/*Репозиторий "usersRepository" для работы с данными по пользователям в БД.*/
export const usersRepository = {
  /*Метод "findByLogin()" для поиска пользователя по логину в БД.*/
  async findByLogin(userLogin: string): Promise<WithId<UserType> | null> {
    /*Просим коллекцию "usersCollection" найти пользователя по логину в БД.*/
    const user = await usersCollection.findOne({ login: userLogin });
    /*Если пользователь не был найден, то возвращаем null.*/
    if (!user) return null;
    /*Если пользователь был найден, то возвращаем данные о нем.*/
    return user;
  },

  /*Метод "findByEmail()" для поиска пользователя по email в БД.*/
  async findByEmail(userEmail: string): Promise<WithId<UserType> | null> {
    /*Просим коллекцию "usersCollection" найти пользователя по email в БД.*/
    const res = await usersCollection.findOne({ email: userEmail });
    /*Если пользователь не был найден, то возвращаем null.*/
    if (!res) return null;
    /*Если пользователь был найден, то возвращаем данные о нем.*/
    return res;
  },

  /*Метод "findByLoginOrEmail()" для поиска пользователя по логину/email в БД.*/
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserType> | null> {
    /*Просим коллекцию "usersCollection" найти пользователя по логину/email в БД.*/
    return await usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },

  /*Метод "create()" для добавления нового пользователя в БД.*/
  async create(newUser: UserType): Promise<string> {
    /*Просим коллекцию "usersCollection" создать нового пользователя в БД.*/
    const insertResult = await usersCollection.insertOne(newUser);
    /*Возвращаем ID созданного пользователя.*/
    return insertResult.insertedId.toString();
  },

  /*Метод "deleteById()" для удаления пользователя по ID в БД.*/
  async deleteById(userId: string): Promise<number> {
    /*Просим коллекцию "usersCollection" удалить пользователя по ID в БД.*/
    const deleteResult = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    /*Возвращаем количество удаленных пользователей.*/
    return deleteResult.deletedCount;
  },

  /*Метод "findById()" для поиска данных по пользователю по ID в БД.*/
  async findById(userId: string): Promise<WithId<UserType> | null> {
    /*Просим коллекцию "usersCollection" найти данные по пользователю по ID в БД.*/
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    /*Если данные по пользователю не были найдены, то возвращаем null.*/
    if (!user) return null;
    /*Если данные по пользователю были найдены, то возвращаем их.*/
    return user;
  },
};
