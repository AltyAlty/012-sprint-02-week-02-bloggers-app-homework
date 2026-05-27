import { WithId } from 'mongodb';
import { UserType } from '../../types/user.type';
import { UserOutputDTO } from '../../routes/output-dto/user.output-dto';
import { PaginatedUsersListOutputDTO } from '../../routes/output-dto/paginated-users-list.output-dto';

/*Функция "mapToPaginatedUsersListOutputDTO()" преобразовывает пользователей из БД в подготовленные для пагинации
пользователей.*/
export const mapToPaginatedUsersListOutputDTO = (
  users: WithId<UserType>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number }
): PaginatedUsersListOutputDTO => {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: users.map(
      (user): UserOutputDTO => ({
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      })
    ),
  };
};
