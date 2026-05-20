import { postsRepository } from '../repositories/posts.repository';
import { PostType } from '../types/post.type';
import { ObjectId, WithId } from 'mongodb';
import { CreatePostInputDTO } from '../routes/input-dto/create-post.input-dto';
import { CreatePostInExistingBlogInputDTO } from '../routes/input-dto/create-post-in-existing-blog.input-dto';
import { UpdatePostInputDTO } from '../routes/input-dto/update-post.input-dto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';

/*Сервис "postsService" для работы с данными по постам.*/
export const postsService = {
  /*Метод "findAllByBlogId()" для поиска всех постов в блоге по ID.*/
  async findAllByBlogId(blogId: string): Promise<WithId<PostType>[] | null> {
    /*Просим репозиторий "postsRepository" найти все посты в блоге по ID в БД.*/
    return await postsRepository.findAllByBlogId(blogId);
  },

  /*Метод "create()" для добавления нового поста.*/
  async create(dto: CreatePostInputDTO): Promise<string> {
    /*Просим репозиторий "blogsRepository" проверить по ID существует ли блог в БД.*/
    const blog = await blogsRepository.findById(dto.blogId);

    /*Если блог существует, то создаем объект с данными нового поста.*/
    const newPost: PostType = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
      createdAt: new Date(),
    };

    /*Просим репозиторий "postsRepository" создать новый пост в БД.*/
    return await postsRepository.create(newPost);
  },

  /*Метод "createInExistingBlog()" для добавления нового поста в существующий блог.*/
  async createInExistingBlog(blogId: string, dto: CreatePostInExistingBlogInputDTO): Promise<string> {
    /*Просим репозиторий "blogsRepository" проверить по ID существует ли блог в БД.*/
    const blog = await blogsRepository.findById(blogId);

    /*Если блог существует, то создаем объект с данными по новому посту.*/
    const newPost: PostType = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
      createdAt: new Date(),
    };

    /*Просим репозиторий "postsRepository" создать новый пост в БД.*/
    return await postsRepository.create(newPost);
  },

  /*Метод "updateById()" для изменения данных поста по ID.*/
  async updateById(postId: string, dto: UpdatePostInputDTO): Promise<void> {
    /*Просим репозиторий "postsRepository" изменить данные поста по ID в БД.*/
    return await postsRepository.updateById(postId, dto);
  },

  /*Метод "deleteById()" для удаления поста по ID.*/
  async deleteById(postId: string): Promise<void> {
    /*Просим репозиторий "postsRepository" удалить пост по ID в БД.*/
    return await postsRepository.deleteById(postId);
  },

  /*Метод "deleteManyByIds()" для удаления нескольких постов по их ID.*/
  async deleteManyByIds(postsIds: ObjectId[]): Promise<number> {
    /*Просим репозиторий "postsRepository" удалить несколько постов по их ID в БД.*/
    return await postsRepository.deleteManyByIds(postsIds);
  },
};
