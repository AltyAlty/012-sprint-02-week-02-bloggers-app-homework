import { GetPostsListQueryInputDTO } from '../routes/input-dto/get-posts-list-query.input-dto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { postsQueryRepository } from '../repositories/posts.query-repository';
import { mapToPaginatedPostsListOutputDTO } from '../repositories/mappers/map-to-paginated-posts-list-output-dto.util';
import { PaginatedPostsListOutputDTO } from '../routes/output-dto/paginated-posts-list.output-dto';
import { mapToPostOutputDTO } from '../repositories/mappers/map-to-post-output-dto.util';
import { PostOutputDTO } from '../routes/output-dto/post.output-dto';

/*Query-сервис "postsQueryService" для работы с данными по постам.*/
export const postsQueryService = {
  /*Метод "findManyByBlogId()" для поиска данных по всем постам в существующем блоге по ID.*/
  async findManyByBlogId(blogId: string, queryDTO: GetPostsListQueryInputDTO): Promise<PaginatedPostsListOutputDTO> {
    /*Просим репозиторий "blogsRepository" проверить по ID существует ли блог в БД.*/
    await blogsRepository.findById(blogId);
    /*Просим query-репозиторий "postsQueryRepository" найти данные по постам в существующем блоге по ID в БД.*/
    const { items, totalCount } = await postsQueryRepository.findManyByBlogId(blogId, queryDTO);

    /*Преобразовываем данные по постам из БД в подготовленные для пагинации данные.*/
    return mapToPaginatedPostsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });
  },

  /*Метод "findById()" для поиска данных по посту по ID.*/
  async findById(postId: string): Promise<PostOutputDTO> {
    /*Просим query-репозиторий "postsQueryRepository" найти данные по посту по ID в БД.*/
    const postDB = await postsQueryRepository.findById(postId);
    /*Преобразовываем данные по посту из БД в подготовленные для отправки клиенту данные.*/
    return mapToPostOutputDTO(postDB);
  },

  /*Метод "findMany()" для поиска данных по постам.*/
  async findMany(queryDTO: GetPostsListQueryInputDTO): Promise<PaginatedPostsListOutputDTO> {
    /*Просим query-репозиторий "postsQueryRepository" найти данные по постам в БД.*/
    const { items, totalCount } = await postsQueryRepository.findMany(queryDTO);

    /*Преобразовываем данные по постам из БД в подготовленные для пагинации данные.*/
    return mapToPaginatedPostsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });
  },
};
