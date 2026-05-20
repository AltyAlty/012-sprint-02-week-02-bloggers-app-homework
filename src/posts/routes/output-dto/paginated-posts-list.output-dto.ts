import { PaginationMetaDataOutputDTO } from '../../../core/types/pagination/pagination-meta-data.output-dto';
import { PostOutputDTO } from './post.output-dto';

/*DTO ответа со списком постов для пагинации: содержит метаданные пагинации и массив элементов постов.*/
export type PaginatedPostsListOutputDTO = PaginationMetaDataOutputDTO & { items: PostOutputDTO[] };
