import { BlogOutputDTO } from './blog.output-dto';
import { PaginationMetaDataOutputDTO } from '../../../core/types/pagination/pagination-meta-data.output-dto';

/*DTO ответа со списком блогов для пагинации: содержит метаданные пагинации и массив элементов блогов.*/
export type PaginatedBlogsListOutputDTO = PaginationMetaDataOutputDTO & { items: BlogOutputDTO[] };
