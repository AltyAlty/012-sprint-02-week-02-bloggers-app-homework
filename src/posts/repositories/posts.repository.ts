import { postsCollection } from '../../db/mongodb/mongo.db';
import { PostType } from '../types/post.type';
import { DeleteResult, InsertOneResult, ObjectId, UpdateResult, WithId } from 'mongodb';
import { UpdatePostInputDTO } from '../routes/input-dto/update-post.input-dto';

/*Репозиторий "postsRepository" для работы с постами в БД.*/
export const postsRepository = {
  /*Метод "findById()" для поиска поста по ID в БД.*/
  async findById(postId: string): Promise<WithId<PostType> | null> {
    /*Просим коллекцию "postsCollection" найти пост по ID в БД.*/
    const post: WithId<PostType> | null = await postsCollection.findOne({ _id: new ObjectId(postId) });
    /*Если пост не был найден, то возвращаем null.*/
    if (!post) return null;
    /*Если пост был найден, то возвращаем его.*/
    return post;
  },

  /*Метод "findAllByBlogId()" для поиска постов в блоге по ID в БД.*/
  async findAllByBlogId(blogId: string): Promise<WithId<PostType>[] | null> {
    /*Просим коллекцию "postsCollection" найти посты в блоге по ID в БД.*/
    const posts: WithId<PostType>[] = await postsCollection.find({ blogId: blogId }).toArray();
    /*Если постов не было найдено, то возвращаем null.*/
    if (!posts || posts.length === 0) return null;
    /*Если посты были найдены, то возвращаем их.*/
    return posts;
  },

  /*Метод "create()" для добавления поста в БД.*/
  async create(newPost: PostType): Promise<string> {
    /*Просим коллекцию "postsCollection" создать пост в БД.*/
    const insertResult: InsertOneResult<PostType> = await postsCollection.insertOne(newPost);
    /*Возвращаем ID созданного поста.*/
    return insertResult.insertedId.toString();
  },

  /*Метод "updateById()" для изменения поста по ID в БД.*/
  async updateById(postId: string, dto: UpdatePostInputDTO): Promise<number> {
    /*Просим коллекцию "postsCollection" изменить пост по ID в БД.*/
    const updateResult: UpdateResult<PostType> = await postsCollection.updateOne(
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

    /*Возвращаем количество измененных постов.*/
    return updateResult.matchedCount;
  },

  /*Метод "deleteById()" для удаления поста по ID в БД.*/
  async deleteById(postId: string): Promise<number> {
    /*Просим коллекцию "postsCollection" удалить пост по ID в БД.*/
    const deleteResult: DeleteResult = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
    /*Возвращаем количество удаленных постов.*/
    return deleteResult.deletedCount;
  },
};
