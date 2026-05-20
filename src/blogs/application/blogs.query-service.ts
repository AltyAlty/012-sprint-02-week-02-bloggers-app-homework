import { GetBlogsListQueryInputDTO } from '../routes/input-dto/get-blogs-list-query.input-dto';
import { blogsQueryRepository } from '../repositories/blogs.query-repository';
import { mapToPaginatedBlogsListOutputDTO } from '../repositories/mappers/map-to-paginated-blogs-list-output-dto.util';
import { PaginatedBlogsListOutputDTO } from '../routes/output-dto/paginated-blogs-list.output-dto';
import { mapToBlogOutputDTO } from '../repositories/mappers/map-to-blog-output-dto.util';
import { BlogOutputDTO } from '../routes/output-dto/blog.output-dto';

/*Query-сервис "blogsQueryService" для работы с данными по блогам.*/
export const blogsQueryService = {
  /*Метод "findMany()" для поиска данных по блогам.*/
  async findMany(queryDTO: GetBlogsListQueryInputDTO): Promise<PaginatedBlogsListOutputDTO> {
    /*Просим query-репозиторий "blogsQueryRepository" найти данные по блогам в БД.*/
    const { items, totalCount } = await blogsQueryRepository.findMany(queryDTO);

    /*Преобразовываем данные по блогам из БД в подготовленные для пагинации данные.*/
    return mapToPaginatedBlogsListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });
  },

  /*Метод "findById()" для поиска данных по блогу по ID.*/
  async findById(blogId: string): Promise<BlogOutputDTO> {
    /*Просим query-репозиторий "blogsQueryRepository" найти данные по блогу по ID в БД.*/
    const blogDB = await blogsQueryRepository.findById(blogId);
    /*Преобразовываем данные по блогу из БД в подготовленные для отправки клиенту данные. Знак "!" означает, что мы
    гарантируем "blogDB" не null или undefined в этом месте.*/
    return mapToBlogOutputDTO(blogDB!);
  },
};
