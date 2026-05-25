/*DTO для query-параметров при GET-запросе для получения данных по всем постам в существующем блоге.*/
import { defaultPaginationSettingsType } from '../../../core/types/pagination/default-pagination-settings.type';
import { CommentSortFieldInputDTO } from './comment-sort-field.input-dto';

export type GetCommentsListInExistingPostQueryInputDTO = defaultPaginationSettingsType<CommentSortFieldInputDTO>;
