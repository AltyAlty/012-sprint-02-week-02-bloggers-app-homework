import { defaultPaginationSettingsType } from '../../../core/types/pagination/default-pagination-settings.type';
import { PostSortFieldInputDTO } from './post-sort-field.input-dto';

/*DTO для query-параметров при GET-запросе для получения данных по всем постам в существующем блоге.*/
export type GetPostsListInExistingBlogQueryInputDTO = defaultPaginationSettingsType<PostSortFieldInputDTO>;
