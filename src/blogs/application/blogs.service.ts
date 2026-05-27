import { blogsRepository } from '../repositories/blogs.repository';
import { BlogType } from '../types/blog.type';
import { WithId } from 'mongodb';
import { CreateBlogInputDTO } from '../routes/input-dto/create-blog.input-dto';
import { UpdateBlogInputDTO } from '../routes/input-dto/update-blog.input-dto';
import { postsService } from '../../posts/application/posts.service';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { PostType } from '../../posts/types/post.type';
import { BlogOutputDTO } from '../routes/output-dto/blog.output-dto';
import { mapToBlogOutputDTO } from '../repositories/mappers/map-to-blog-output-dto.util';

/*Сервис "blogsService" для работы с блогами.*/
export const blogsService = {
  /*Метод "findById()" для поиска блога по ID.*/
  async findById(blogId: string): Promise<Result<{ blogOutput: BlogOutputDTO } | null>> {
    /*Просим репозиторий "blogsRepository" найти блог по ID в БД.*/
    const blogDB: WithId<BlogType> | null = await blogsRepository.findById(blogId);

    /*Если блог не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!blogDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'blogId', message: 'Not Found' }],
      };
    }

    /*Если блог был найден, то преобразовываем блог из БД в подготовленный для отправки клиенту блог.*/
    const blogOutput: BlogOutputDTO = mapToBlogOutputDTO(blogDB);

    /*Возвращаем ResultObject c преобразованным блогом.*/
    return {
      status: ResultStatuses.Ok,
      data: { blogOutput },
      extensions: [],
    };
  },

  /*Метод "create()" для добавления блога.*/
  async create(dto: CreateBlogInputDTO): Promise<Result<{ blogId: string }>> {
    /*Создаем объект с данными нового блога.*/
    const newBlog: BlogType = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };

    /*Просим репозиторий "blogsRepository" создать блог в БД.*/
    const blogId: string = await blogsRepository.create(newBlog);

    /*Возвращаем ResultObject c ID созданного блога.*/
    return {
      status: ResultStatuses.Created,
      data: { blogId },
      extensions: [],
    };
  },

  /*Метод "updateById()" для изменения блога по ID.*/
  async updateById(blogId: string, dto: UpdateBlogInputDTO): Promise<Result<{} | null>> {
    /*Просим репозиторий "blogsRepository" изменить блог по ID в БД.*/
    const updatedBlogCount: number = await blogsRepository.updateById(blogId, dto);

    /*Если блог не был изменен, то возвращаем ResultObject с информацией об этом.*/
    if (updatedBlogCount < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'blogId', message: 'Not Found' }],
      };
    }

    /*Если блог был изменен, то возвращаем ResultObject c информацией об этом.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод "deleteById()" для удаления блога по ID.*/
  async deleteById(blogId: string): Promise<Result<{} | null>> {
    /*Просим репозиторий "blogsRepository" найти блог по ID в БД.*/
    const blogDB: WithId<BlogType> | null = await blogsRepository.findById(blogId);

    /*Если блог не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!blogDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'blogId', message: 'Not Found' }],
      };
    }

    /*Если блог был найден, то просим сервис "postsService" найти посты в блоге по ID.*/
    const postsResult: Result<{ postsDB: WithId<PostType>[] | null }> = await postsService.findAllByBlogId(blogId);

    /*Если посты в блоге были найдены, то удаляем их.*/
    if (postsResult.data.postsDB) {
      /*Получаем массив ID постов внутри блога.*/
      const postIds: string[] = postsResult.data.postsDB.map(post => String(post._id));
      /*Просим сервис "postsService" удалить посты внутри блога по ID.*/
      for (const postId of postIds) await postsService.deleteById(postId);
    }

    /*Просим репозиторий "blogsRepository" удалить блог по ID в БД.*/
    const deletedBlogCount: number = await blogsRepository.deleteById(blogId);

    /*Если блог не был удален, то возвращаем ResultObject с информацией об этом.*/
    if (deletedBlogCount < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'blogId', message: 'Not Found' }],
      };
    }

    /*Если блог был удален, то возвращаем ResultObject c информацией об удалении блога.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },
};
