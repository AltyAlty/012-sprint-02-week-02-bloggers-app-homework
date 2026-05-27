import { GetBlogsListQueryInputDTO } from '../routes/input-dto/get-blogs-list-query.input-dto';
import { blogsQueryRepository } from '../repositories/blogs.query-repository';
import { mapToPaginatedBlogsListOutputDTO } from '../repositories/mappers/map-to-paginated-blogs-list-output-dto.util';
import { PaginatedBlogsListOutputDTO } from '../routes/output-dto/paginated-blogs-list.output-dto';
import { mapToBlogOutputDTO } from '../repositories/mappers/map-to-blog-output-dto.util';
import { BlogOutputDTO } from '../routes/output-dto/blog.output-dto';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { WithId } from 'mongodb';
import { BlogType } from '../types/blog.type';

/*Query-сервис "blogsQueryService" для работы с блогами.*/
export const blogsQueryService = {
  /*Метод "findById()" для поиска блога по ID.*/
  async findById(blogId: string): Promise<Result<{ blogOutput: BlogOutputDTO } | null>> {
    /*Просим query-репозиторий "blogsQueryRepository" найти блог по ID в БД.*/
    const blogDB: WithId<BlogType> | null = await blogsQueryRepository.findById(blogId);

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

  /*Метод "findMany()" для поиска блогов.*/
  async findMany(
    queryDTO: GetBlogsListQueryInputDTO
  ): Promise<Result<{ paginatedBlogsListOutput: PaginatedBlogsListOutputDTO }>> {
    /*Просим query-репозиторий "blogsQueryRepository" найти блоги в БД.*/
    const { items, totalCount }: { items: WithId<BlogType>[]; totalCount: number } =
      await blogsQueryRepository.findMany(queryDTO);

    /*Преобразовываем блоги из БД в подготовленные для пагинации блоги.*/
    const paginatedBlogsListOutput: PaginatedBlogsListOutputDTO = mapToPaginatedBlogsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject c преобразованными для пагинации блогами.*/
    return {
      status: ResultStatuses.Ok,
      data: { paginatedBlogsListOutput },
      extensions: [],
    };
  },
};
