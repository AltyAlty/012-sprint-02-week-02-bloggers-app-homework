import { defaultPaginationSettingsType } from '../../../core/types/pagination/default-pagination-settings.type';
import { UserSortFieldInputDTO } from './user-sort-field.input-dto';

/*DTO для query-параметров при GET-запросе для получения данных по всем пользователям.*/
export type GetUsersListQueryInputDTO = defaultPaginationSettingsType<UserSortFieldInputDTO> &
  Partial<{ searchLoginTerm: string; searchEmailTerm: string }>;
