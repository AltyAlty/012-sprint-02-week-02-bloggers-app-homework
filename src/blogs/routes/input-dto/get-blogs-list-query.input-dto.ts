import { defaultPaginationSettingsType } from '../../../core/types/pagination/default-pagination-settings.type';
import { BlogSortFieldInputDTO } from './blog-sort-field.input-dto';

/*Input DTO для query-параметров при получении блогов.

Касательно TS:
1. "defaultPaginationSettingsType<BlogSortFieldInputDTO>": обязательная часть типа.
2. "Partial<...>": дополнительные необязательные поля типа.*/
export type GetBlogsListQueryInputDTO = defaultPaginationSettingsType<BlogSortFieldInputDTO> &
  Partial<{ searchNameTerm: string }>;
