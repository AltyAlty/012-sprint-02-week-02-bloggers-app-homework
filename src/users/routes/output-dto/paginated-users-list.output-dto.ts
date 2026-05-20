import { PaginationMetaDataOutputDTO } from '../../../core/types/pagination/pagination-meta-data.output-dto';
import { UserOutputDTO } from './user.output-dto';

/*DTO ответа со списком пользователей для пагинации: содержит метаданные пагинации и массив элементов пользователей.*/
export type PaginatedUsersListOutputDTO = PaginationMetaDataOutputDTO & { items: UserOutputDTO[] };
