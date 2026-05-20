import { GetUsersListQueryInputDTO } from '../routes/input-dto/get-users-list-query.input-dto';
import { usersQueryRepository } from '../repositories/users.query-repository';
import { mapToPaginatedUsersListOutputDTO } from '../repositories/mappers/map-to-paginated-users-list-output-dto.util';
import { PaginatedUsersListOutputDTO } from '../routes/output-dto/paginated-users-list.output-dto';
import { mapToUserOutputDTO } from '../repositories/mappers/map-to-user-output-dto.util';
import { UserOutputDTO } from '../routes/output-dto/user.output-dto';

/*Query-сервис "usersQueryService" для работы с данными по пользователям.*/
export const usersQueryService = {
  /*Метод "findMany()" для поиска данных по пользователям.*/
  async findMany(queryDTO: GetUsersListQueryInputDTO): Promise<PaginatedUsersListOutputDTO> {
    /*Просим query-репозиторий "usersQueryRepository" найти данные по пользователям в БД.*/
    const { items, totalCount } = await usersQueryRepository.findMany(queryDTO);

    /*Преобразовываем данные по пользователям из БД в подготовленные для пагинации данные.*/
    return mapToPaginatedUsersListOutputDTO(items, {
      pageNumber: queryDTO.pageNumber,
      pageSize: queryDTO.pageSize,
      totalCount,
    });
  },

  /*Метод "findById()" для поиска данных по пользователю по ID.*/
  async findById(userId: string): Promise<UserOutputDTO> {
    /*Просим query-репозиторий "usersQueryRepository" найти данные по пользователю по ID в БД.*/
    const userBD = await usersQueryRepository.findById(userId);
    /*Преобразовываем данные по пользователю из БД в подготовленные для отправки клиенту данные.*/
    return mapToUserOutputDTO(userBD);
  },
};
