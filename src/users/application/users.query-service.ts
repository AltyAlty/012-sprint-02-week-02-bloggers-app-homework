import { GetUsersListQueryInputDTO } from '../routes/input-dto/get-users-list-query.input-dto';
import { usersQueryRepository } from '../repositories/users.query-repository';
import { mapToPaginatedUsersListOutputDTO } from '../repositories/mappers/map-to-paginated-users-list-output-dto.util';
import { PaginatedUsersListOutputDTO } from '../routes/output-dto/paginated-users-list.output-dto';
import { mapToUserOutputDTO } from '../repositories/mappers/map-to-user-output-dto.util';
import { UserOutputDTO } from '../routes/output-dto/user.output-dto';
import { Result } from '../../core/types/result/result.type';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { WithId } from 'mongodb';
import { UserType } from '../types/user.type';

/*Query-сервис "usersQueryService" для работы с пользователями.*/
export const usersQueryService = {
  /*Метод "findById()" для поиска пользователя по ID.*/
  async findById(userId: string): Promise<Result<{ userOutput: UserOutputDTO } | null>> {
    /*Просим query-репозиторий "usersQueryRepository" найти пользователя по ID в БД.*/
    const userDB: WithId<UserType> | null = await usersQueryRepository.findById(userId);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'userId', message: 'Not Found' }],
      };
    }

    /*Если пользователь был найден, то преобразовываем пользователя из БД в подготовленного для отправки пользователя.*/
    const userOutput: UserOutputDTO = mapToUserOutputDTO(userDB);

    /*Возвращаем ResultObject c преобразованным пользователем.*/
    return {
      status: ResultStatuses.Ok,
      data: { userOutput },
      extensions: [],
    };
  },

  /*Метод "findMany()" для поиска пользователей.*/
  async findMany(
    queryDTO: GetUsersListQueryInputDTO
  ): Promise<Result<{ paginatedUsersListOutput: PaginatedUsersListOutputDTO }>> {
    /*Просим query-репозиторий "usersQueryRepository" найти пользователей в БД.*/
    const { items, totalCount }: { items: WithId<UserType>[]; totalCount: number } =
      await usersQueryRepository.findMany(queryDTO);

    /*Преобразовываем пользователей из БД в подготовленных для пагинации пользователей.*/
    const paginatedUsersListOutput: PaginatedUsersListOutputDTO = mapToPaginatedUsersListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject c преобразованными пользователями.*/
    return {
      status: ResultStatuses.Ok,
      data: { paginatedUsersListOutput },
      extensions: [],
    };
  },
};
