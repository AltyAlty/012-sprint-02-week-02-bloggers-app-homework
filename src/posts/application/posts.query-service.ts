import { GetPostsListQueryInputDTO } from '../routes/input-dto/get-posts-list-query.input-dto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { postsQueryRepository } from '../repositories/posts.query-repository';
import { mapToPaginatedPostsListOutputDTO } from '../repositories/mappers/map-to-paginated-posts-list-output-dto.util';
import { PaginatedPostsListOutputDTO } from '../routes/output-dto/paginated-posts-list.output-dto';
import { mapToPostOutputDTO } from '../repositories/mappers/map-to-post-output-dto.util';
import { PostOutputDTO } from '../routes/output-dto/post.output-dto';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';

/*Query-сервис "postsQueryService" для работы с данными по постам.*/
export const postsQueryService = {
  /*Метод "findManyByBlogId()" для поиска данных по всем постам в существующем блоге по ID.*/
  async findManyByBlogId(
    blogId: string,
    queryDTO: GetPostsListQueryInputDTO
  ): Promise<Result<{ paginatedPostsListOutput: PaginatedPostsListOutputDTO } | null>> {
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

    /*Если блог был найден, то просим query-репозиторий "postsQueryRepository" найти данные по постам в существующем
    блоге по ID в БД.*/
    const { items, totalCount } = await postsQueryRepository.findManyByBlogId(blogId, queryDTO);

    /*Преобразовываем данные по постам из БД в подготовленные для пагинации данные.*/
    const paginatedPostsListOutput = mapToPaginatedPostsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject c преобразованными для пагинации данными по постам.*/
    return {
      status: ResultStatuses.Ok,
      data: { paginatedPostsListOutput },
      extensions: [],
    };
  },

  /*Метод "findById()" для поиска данных по посту по ID.*/
  async findById(postId: string): Promise<Result<{ postOutput: PostOutputDTO } | null>> {
    /*Просим query-репозиторий "postsQueryRepository" найти данные по посту по ID в БД.*/
    const postDB = await postsQueryRepository.findById(postId);

    /*Если пост не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!postDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'postId', message: 'Not Found' }],
      };
    }

    /*Если пост был найден, то преобразовываем данные по посту из БД в подготовленные для отправки клиенту данные.*/
    const postOutput = mapToPostOutputDTO(postDB);

    /*Возвращаем ResultObject c преобразованными данными по посту.*/
    return {
      status: ResultStatuses.Ok,
      data: { postOutput },
      extensions: [],
    };
  },

  /*Метод "findMany()" для поиска данных по постам.*/
  async findMany(
    queryDTO: GetPostsListQueryInputDTO
  ): Promise<Result<{ paginatedPostsListOutput: PaginatedPostsListOutputDTO }>> {
    /*Просим query-репозиторий "postsQueryRepository" найти данные по постам в БД.*/
    const { items, totalCount } = await postsQueryRepository.findMany(queryDTO);

    /*Преобразовываем данные по постам из БД в подготовленные для пагинации данные.*/
    const paginatedPostsListOutput = mapToPaginatedPostsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject c преобразованными для пагинации данными по постам.*/
    return {
      status: ResultStatuses.Ok,
      data: { paginatedPostsListOutput },
      extensions: [],
    };
  },
};
