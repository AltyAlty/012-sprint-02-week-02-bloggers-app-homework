import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
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
  async findById(blogId: string): Promise<WithId<BlogType>> {
    /*Просим коллекцию "blogsCollection" найти блог по ID в БД.*/
    const blog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
    /*Если блог не был найден, то выкидываем ошибку.*/
    if (!blog) throw new RepositoryNotFoundError('Blog does not exist');
    /*Если блог был найден, то возвращаем данные о нем.*/
    return blog;
  },

  /*Метод "updateById()" для изменения данных блога по ID в БД.*/
  async updateById(blogId: string, dto: UpdateBlogInputDTO): Promise<void> {
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

    /*Если блог не был найден, то выкидываем ошибку с информацией об этом.*/
    if (updateResult.matchedCount < 1) throw new RepositoryNotFoundError('Blog does not exist');
    return;
  },

  /*Метод "deleteById()" для удаления блога по ID в БД.*/
  async deleteById(blogId: string): Promise<void> {
    /*Просим коллекцию "blogsCollection" удалить блог по ID в БД.*/
    const deleteResult = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
    /*Если блог не был найден, то выкидываем ошибку с информацией об этом.*/
    if (deleteResult.deletedCount < 1) throw new RepositoryNotFoundError('Blog does not exist');
    return;
  },
};
