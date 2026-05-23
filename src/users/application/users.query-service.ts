import { GetUsersListQueryInputDTO } from '../routes/input-dto/get-users-list-query.input-dto';
import { usersQueryRepository } from '../repositories/users.query-repository';
import { mapToPaginatedUsersListOutputDTO } from '../repositories/mappers/map-to-paginated-users-list-output-dto.util';
import { PaginatedUsersListOutputDTO } from '../routes/output-dto/paginated-users-list.output-dto';
import { mapToUserOutputDTO } from '../repositories/mappers/map-to-user-output-dto.util';
import { UserOutputDTO } from '../routes/output-dto/user.output-dto';
import { Result } from '../../core/types/result/result.type';
import { ResultStatuses } from '../../core/types/result/result-statuses';

/*Query-сервис "usersQueryService" для работы с данными по пользователям.*/
export const usersQueryService = {
  /*Метод "findMany()" для поиска данных по пользователям.*/
  async findMany(
    queryDTO: GetUsersListQueryInputDTO
  ): Promise<Result<{ paginatedUsersListOutput: PaginatedUsersListOutputDTO }>> {
    /*Просим query-репозиторий "usersQueryRepository" найти данные по пользователям в БД.*/
    const { items, totalCount } = await usersQueryRepository.findMany(queryDTO);

    /*Преобразовываем данные по пользователям из БД в подготовленные для пагинации данные.*/
    const paginatedUsersListOutput = mapToPaginatedUsersListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });

    /*Возвращаем ResultObject c преобразованными для пагинации данными по пользователям.*/
    return {
      status: ResultStatuses.Ok,
      data: { paginatedUsersListOutput },
      extensions: [],
    };
  },

  /*Метод "findById()" для поиска данных по пользователю по ID.*/
  async findById(userId: string): Promise<Result<{ userOutput: UserOutputDTO } | null>> {
    /*Просим query-репозиторий "usersQueryRepository" найти данные по пользователю по ID в БД.*/
    const userDB = await usersQueryRepository.findById(userId);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userDB) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'userId', message: 'Not Found' }],
      };
    }

    /*Если пользователь был найден, то преобразовываем данные по пользователю из БД в подготовленные для отправки
    клиенту данные.*/
    const userOutput = mapToUserOutputDTO(userDB);

    /*Возвращаем ResultObject c преобразованными данными по пользователю.*/
    return {
      status: ResultStatuses.Ok,
      data: { userOutput },
      extensions: [],
    };
  },
};
