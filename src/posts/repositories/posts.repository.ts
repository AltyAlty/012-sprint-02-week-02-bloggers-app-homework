import { postsCollection } from '../../db/mongodb/mongo.db';
import { PostType } from '../types/post.type';
import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { UpdatePostInputDTO } from '../routes/input-dto/update-post.input-dto';

/*Репозиторий "postsRepository" для работы с данными по постам в БД.*/
export const postsRepository = {
  /*Метод "findAllByBlogId()" для поиска всех постов в блоге по ID в БД.*/
  async findAllByBlogId(blogId: string): Promise<WithId<PostType>[] | null> {
    /*Просим коллекцию "postsCollection" найти все посты в блоге по ID в БД.*/
    const posts = await postsCollection.find({ blogId: blogId }).toArray();
    /*Если постов не было найдено, то возвращаем null.*/
    if (!posts || posts.length === 0) return null;
    /*Если посты были найдены, то возвращаем данные о них.*/
    return posts;
  },

  /*Метод "create()" для добавления нового поста в БД.*/
  async create(newPost: PostType): Promise<string> {
    /*Просим коллекцию "postsCollection" создать новый пост в БД.*/
    const insertResult = await postsCollection.insertOne(newPost);
    /*Возвращаем ID созданного поста.*/
    return insertResult.insertedId.toString();
  },

  /*Метод "updateById()" для изменения данных поста по ID в БД.*/
  async updateById(postId: string, dto: UpdatePostInputDTO): Promise<void> {
    /*Просим коллекцию "postsCollection" изменить данные поста по ID в БД.*/
    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
        },
      }
    );

    /*Если поста не был найден, то выкидываем ошибку с информацией об этом.*/
    if (updateResult.matchedCount < 1) throw new RepositoryNotFoundError('Post does not exist');
    return;
  },

  /*Метод "deleteById()" для удаления поста по ID в БД.*/
  async deleteById(postId: string): Promise<void> {
    /*Просим коллекцию "postsCollection" удалить пост по ID в БД.*/
    const deleteResult = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
    /*Если пост не был найден, то выкидываем ошибку с информацией об этом.*/
    if (deleteResult.deletedCount < 1) throw new RepositoryNotFoundError('Post does not exist');
    return;
  },

  /*Метод "deleteManyByIds()" для удаления нескольких постов по их ID в БД.*/
  async deleteManyByIds(postsIds: ObjectId[]): Promise<number> {
    /*Просим коллекцию "postsCollection" удалить несколько постов по их ID в БД.*/
    const result = await postsCollection.deleteMany({ _id: { $in: postsIds } });
    /*Возвращаем количество удаленных постов.*/
    return result.deletedCount;
  },
};
