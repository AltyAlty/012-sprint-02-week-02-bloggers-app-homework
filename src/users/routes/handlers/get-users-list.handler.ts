import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { GetUsersListQueryInputDTO } from '../input-dto/get-users-list-query.input-dto';
import { usersQueryService } from '../../application/users.query-service';
import { mapResultCodeToHttpStatus } from '../../../core/utils/result/map-result-code-to-http-status';
import { PaginatedUsersListOutputDTO } from '../output-dto/paginated-users-list.output-dto';
import { Result } from '../../../core/types/result/result.type';
import { HttpStatuses } from '../../../core/types/http-statuses';
import { getSanitizedQueryInputWithDefaultPaginationSettings } from '../../../core/utils/pagination/get-sanitized-query-input-with-default-pagination-settings';
import { UserSortFieldInputDTO } from '../input-dto/user-sort-field.input-dto';

/*Функция-обработчик "getUsersListHandler()" для GET-запросов по получению пользователей с пагинацией, используя
query-параметры.*/
export const getUsersListHandler = async (
  req: Request<{}, {}, {}, GetUsersListQueryInputDTO>,
  res: Response<PaginatedUsersListOutputDTO>
) => {
  try {
    /*Санитизируем query-параметры и добавляем к ним дефолтные настройки пагинации.*/
    const sanitizedQueryInputWithDefaultPaginationSettings = getSanitizedQueryInputWithDefaultPaginationSettings<
      GetUsersListQueryInputDTO,
      UserSortFieldInputDTO
    >(req);

    /*Просим query-сервис "usersQueryService" найти пользователей.*/
    const paginatedUsersListResult: Result<{ paginatedUsersListOutput: PaginatedUsersListOutputDTO }> =
      await usersQueryService.findMany(sanitizedQueryInputWithDefaultPaginationSettings);

    /*Получаем HTTP-статус операции по поиску пользователей.*/
    const paginatedUsersListResultHttpStatus: HttpStatuses = mapResultCodeToHttpStatus(paginatedUsersListResult.status);
    /*Отправляем пользователей клиенту.*/
    res.status(paginatedUsersListResultHttpStatus).send(paginatedUsersListResult.data.paginatedUsersListOutput);
  } catch (error: unknown) {
    /*Если была перехвачена ошибка, то обрабатываем ее.*/
    errorsHandler(error, res);
  }
};
