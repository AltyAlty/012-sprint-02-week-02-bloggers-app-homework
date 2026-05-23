import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../db/mongodb/mongo.db';
import { BlogType } from '../types/blog.type';
import { UpdateBlogInputDTO } from '../routes/input-dto/update-blog.input-dto';

/*Репозиторий "blogsRepository" для работы с данными по блогам в БД.*/
export const blogsRepository = {
  /*Метод "create()" для добавления нового блога в БД.*/
  async create(newBlog: BlogType): Promise<string> {
    /*Просим коллекцию "blogsCollection" создать новый блог в БД.*/
    const insertResult = await blogsCollection.insertOne(newBlog);
    /*Возвращаем ID созданного блога.*/
    return insertResult.insertedId.toString();
  },

  /*Метод "findById()" для поиска блога по ID в БД.*/
  async findById(blogId: string): Promise<WithId<BlogType> | null> {
    /*Просим коллекцию "blogsCollection" найти данные по блогу по ID в БД.*/
    const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
    /*Если данные по блогу не были найдены, то возвращаем null.*/
    if (!blog) return null;
    /*Если данные по блогу были найдены, то возвращаем их.*/
    return blog;
  },

  /*Метод "updateById()" для изменения данных блога по ID в БД.*/
  async updateById(blogId: string, dto: UpdateBlogInputDTO): Promise<number> {
    /*Просим коллекцию "blogsCollection" изменить данные блога по ID в БД.*/
    const updateResult = await blogsCollection.updateOne(
      { _id: new ObjectId(blogId) },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      }
    );

    /*Возвращаем количество измененных блогов.*/
    return updateResult.matchedCount;
  },

  /*Метод "deleteById()" для удаления блога по ID в БД.*/
  async deleteById(blogId: string): Promise<number> {
    /*Просим коллекцию "blogsCollection" удалить блог по ID в БД.*/
    const deleteResult = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
    /*Возвращаем количество удаленных блогов.*/
    return deleteResult.deletedCount;
  },
};
