import { blogsRepository } from '../repositories/blogs.repository';
import { BlogType } from '../types/blog.type';
import { ObjectId } from 'mongodb';
import { CreateBlogInputDTO } from '../routes/input-dto/create-blog.input-dto';
import { UpdateBlogInputDTO } from '../routes/input-dto/update-blog.input-dto';
import { postsService } from '../../posts/application/posts.service';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';

/*Сервис "blogsService" для работы с данными по блогам.*/
export const blogsService = {
  /*Метод "create()" для добавления нового блога.*/
  async create(dto: CreateBlogInputDTO): Promise<Result<{ blogId: string }>> {
    /*Создаем объект с данными нового блога.*/
    const newBlog: BlogType = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };

    /*Просим репозиторий "blogsRepository" создать новый блог в БД.*/
    const blogId = await blogsRepository.create(newBlog);

    /*Возвращаем ResultObject c ID блога.*/
    return {
      status: ResultStatuses.Created,
      data: { blogId },
      extensions: [],
    };
  },

  /*Метод "updateById()" для изменения данных блога по ID.*/
  async updateById(blogId: string, dto: UpdateBlogInputDTO): Promise<Result<{} | null>> {
    /*Просим репозиторий "blogsRepository" изменить данные блога по ID в БД.*/
    const updatedBlogResult = await blogsRepository.updateById(blogId, dto);

    /*Если блог не был изменен, то возвращаем ResultObject с информацией об этом.*/
    if (updatedBlogResult < 1) {
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

    /*Если блог был найден, то просим сервис "postsService" узнать нет ли у этого блога постов.*/
    const postsResult = await postsService.findAllByBlogId(blogId);

    /*Если посты в блоге были найдены, то просим сервис "postsService" удалить их.*/
    if (postsResult.data.postsDB) {
      const postsIds: ObjectId[] = postsResult.data.postsDB!.map(post => post._id);
      await postsService.deleteManyByIds(postsIds);
    }

    /*Просим репозиторий "blogsRepository" удалить блог по ID в БД.*/
    const deletedBlogResult = await blogsRepository.deleteById(blogId);

    /*Если блог не был удален, то возвращаем ResultObject с информацией об этом.*/
    if (deletedBlogResult < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'blogId', message: 'Not Found' }],
      };
    }

    /*Возвращаем ResultObject c информацией об удалении блога.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },
};
