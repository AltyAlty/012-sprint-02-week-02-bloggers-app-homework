import { defaultPaginationSettingsType } from '../../../core/types/pagination/default-pagination-settings.type';
import { UserSortFieldInputDTO } from './user-sort-field.input-dto';

/*Input DTO для query-параметров при получении пользователей.*/
export type GetUsersListQueryInputDTO = defaultPaginationSettingsType<UserSortFieldInputDTO> &
  Partial<{ searchLoginTerm: string; searchEmailTerm: string }>;
