import { Collection, Db, MongoClient } from 'mongodb';
import { SETTINGS } from '../../core/settings/settings';
import { BlogType } from '../../blogs/types/blog.type';
import { PostType } from '../../posts/types/post.type';
import { UserType } from '../../users/types/user.type';

export let client: MongoClient;
export let blogsCollection: Collection<BlogType>;
export let postsCollection: Collection<PostType>;
export let usersCollection: Collection<UserType>;

/*Функция "runDB()" для подключения к серверу MongoDB.*/
export const runDB = async (url: string, dbName: string): Promise<void> => {
  /*Создаем клиента для MongoDB.*/
  client = new MongoClient(url);
  /*Указываем БД, к которой будет подключаться клиент для MongoDB.*/
  const db: Db = client.db(dbName);
  /*Создаем коллекции в указанной БД.*/
  blogsCollection = db.collection<BlogType>(SETTINGS.BLOGS_COLLECTION_NAME);
  postsCollection = db.collection<PostType>(SETTINGS.POSTS_COLLECTION_NAME);
  usersCollection = db.collection<UserType>(SETTINGS.USERS_COLLECTION_NAME);

  try {
    /*Присоединяем клиента для MongoDB к серверу и проверяем соединение.*/
    await client.connect();
    await db.command({ ping: 1 });
    console.log('✅ Successfully connected to the MongoDB server');
  } catch (error) {
    await client.close();
    throw new Error(`❌ Cannot connect to the MongoDB server: ${error}`);
  }
};

/*Функция "stopDb()" для отключения от сервера MongoDB.*/
export const stopDb = async () => {
  if (!client) throw new Error(`❌ No MongoDB clients`);
  await client.close();
};
