import { PaginationMetaDataOutputDTO } from '../../../core/types/pagination/pagination-meta-data.output-dto';
import { CommentOutputDTO } from './comment.output-dto';

/*DTO ответа со списком постов для пагинации: содержит метаданные пагинации и массив элементов комментариев.*/
export type PaginatedCommentsListOutputDTO = PaginationMetaDataOutputDTO & { items: CommentOutputDTO[] };
