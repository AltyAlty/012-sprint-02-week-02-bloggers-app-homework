import { postsRepository } from '../repositories/posts.repository';
import { PostType } from '../types/post.type';
import { ObjectId, WithId } from 'mongodb';
import { CreatePostInputDTO } from '../routes/input-dto/create-post.input-dto';
import { CreatePostInExistingBlogInputDTO } from '../routes/input-dto/create-post-in-existing-blog.input-dto';
import { UpdatePostInputDTO } from '../routes/input-dto/update-post.input-dto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';

/*Сервис "postsService" для работы с данными по постам.*/
export const postsService = {
  /*Метод "findAllByBlogId()" для поиска всех постов в блоге по ID.*/
  async findAllByBlogId(blogId: string): Promise<Result<{ postsDB: WithId<PostType>[] | null }>> {
    /*Просим репозиторий "postsRepository" найти все посты в блоге по ID в БД.*/
    const postsDB = await postsRepository.findAllByBlogId(blogId);

    /*Возвращаем ResultObject c данными по постам.*/
    return {
      status: ResultStatuses.Ok,
      data: { postsDB },
      extensions: [],
    };
  },

  /*Метод "create()" для добавления нового поста.*/
  async create(dto: CreatePostInputDTO): Promise<Result<{ postId: string } | null>> {
    /*Просим репозиторий "blogsRepository" проверить по ID существует ли блог в БД.*/
    const blogDB = await blogsRepository.findById(dto.blogId);

    /*Если блог не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!blogDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'blogId', message: 'Not Found' }],
      };
    }

    /*Если блог существует, то создаем объект с данными нового поста.*/
    const newPost: PostType = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blogDB.name,
      createdAt: new Date(),
    };

    /*Просим репозиторий "postsRepository" создать новый пост в БД.*/
    const postId = await postsRepository.create(newPost);

    /*Возвращаем ResultObject c ID поста.*/
    return {
      status: ResultStatuses.Created,
      data: { postId },
      extensions: [],
    };
  },

  /*Метод "createInExistingBlog()" для добавления нового поста в существующий блог.*/
  async createInExistingBlog(
    blogId: string,
    dto: CreatePostInExistingBlogInputDTO
  ): Promise<Result<{ postId: string } | null>> {
    /*Просим репозиторий "blogsRepository" проверить по ID существует ли блог в БД.*/
    const blogDB = await blogsRepository.findById(blogId);

    /*Если блог не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!blogDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'blogId', message: 'Not Found' }],
      };
    }

    /*Если блог был найден, то создаем объект с данными по новому посту.*/
    const newPost: PostType = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blogDB.name,
      createdAt: new Date(),
    };

    /*Просим репозиторий "postsRepository" создать новый пост в БД.*/
    const postId = await postsRepository.create(newPost);

    /*Возвращаем ResultObject c ID поста.*/
    return {
      status: ResultStatuses.Created,
      data: { postId },
      extensions: [],
    };
  },

  /*Метод "updateById()" для изменения данных поста по ID.*/
  async updateById(postId: string, dto: UpdatePostInputDTO): Promise<Result<{} | null>> {
    /*Просим репозиторий "postsRepository" изменить данные поста по ID в БД.*/
    const updatedPostResult = await postsRepository.updateById(postId, dto);

    /*Если пост не был изменен, то возвращаем ResultObject с информацией об этом.*/
    if (updatedPostResult < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'postId', message: 'Not Found' }],
      };
    }

    /*Если пост был изменен, то возвращаем ResultObject c информацией об этом.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод "deleteById()" для удаления поста по ID.*/
  async deleteById(postId: string): Promise<Result<{} | null>> {
    /*Просим репозиторий "postsRepository" удалить пост по ID в БД.*/
    const deletedPostResult = await postsRepository.deleteById(postId);

    /*Если пост не был удален, то возвращаем ResultObject с информацией об этом.*/
    if (deletedPostResult < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'postId', message: 'Not Found' }],
      };
    }

    /*Если пост был удален, то возвращаем ResultObject c информацией об этом.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод "deleteManyByIds()" для удаления нескольких постов по их ID.*/
  async deleteManyByIds(postsIds: ObjectId[]): Promise<Result<{ deletedPostsResult: number }>> {
    /*Просим репозиторий "postsRepository" удалить несколько постов по их ID в БД.*/
    const deletedPostsResult = await postsRepository.deleteManyByIds(postsIds);

    /*Возвращаем ResultObject c информацией о количестве удаленных постов.*/
    return {
      status: ResultStatuses.NoContent,
      data: { deletedPostsResult },
      extensions: [],
    };
  },
};
