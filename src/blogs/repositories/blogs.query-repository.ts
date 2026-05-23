import { GetBlogsListQueryInputDTO } from '../routes/input-dto/get-blogs-list-query.input-dto';
import { Filter, ObjectId, WithId } from 'mongodb';
import { BlogType } from '../types/blog.type';
import { blogsCollection } from '../../db/mongodb/mongo.db';

/*Query-репозиторий "blogsQueryRepository" для работы с данными по блогам в БД.*/
export const blogsQueryRepository = {
  /*Метод "findMany()" для поиска данных по блогам в БД.*/
  async findMany(queryDTO: GetBlogsListQueryInputDTO): Promise<{ items: WithId<BlogType>[]; totalCount: number }> {
    /*Создаем переменные на основе параметра "queryDTO" при помощи деструктуризации.*/
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } = queryDTO;
    /*Переменная "skip" обозначает сколько записей надо пропустить перед тем, как начать отдавать запрошенную страницу
    "pageNumber".*/
    const skip = (pageNumber - 1) * pageSize;
    /*Динамически собираем фильтр для поиска в MongoDB. Начинаем с пустого фильтра.*/
    const filter: Filter<BlogType> = {};
    /*Если в query-параметрах было указано имя блога, то добавляем условие по полю "name".
    "$regex: searchNameTerm" означает поиск по шаблону - по вхождению строки. "$options: 'i'" означает, что поиск будет
    без учета регистра.*/
    if (searchNameTerm) filter.name = { $regex: searchNameTerm, $options: 'i' };

    /*Просим коллекцию "blogsCollection" найти данные по блогам в БД:
    1. ".find(filter)": выбираем документы по собранному фильтру.
    2. ".sort({ [sortBy]: sortDirection })": сортируем по полю сортировки, которое берется динамически из переменной
    "sortBy", а направление сортировки из переменной "sortDirection".
    3. ".skip(skip)": пропускаем нужное количество записей, чтобы взять записи для запрошенной страницы.
    4. ".limit(pageSize)": берем записей не больше размера запрошенной страницы.
    5. ".toArray()": превращаем курсор в обычный массив и возвращаем его.*/
    const items = await blogsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    /*Просим коллекцию "blogsCollection" подсчитать общее количество документов, подходящих под фильтр, без учета
    пагинации.*/
    const totalCount = await blogsCollection.countDocuments(filter);
    /*Возвращаем найденные данные по блогам.*/
    return { items, totalCount };
  },

  /*Метод "findById()" для поиска данных по блогу по ID в БД.*/
  async findById(blogId: string): Promise<WithId<BlogType> | null> {
    /*Просим коллекцию "blogsCollection" найти данные по блогу по ID в БД.*/
    const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
    /*Если данные по блогу не были найдены, то возвращаем null.*/
    if (!blog) return null;
    /*Если данные по блогу были найдены, то возвращаем их.*/
    return blog;
  },
};
