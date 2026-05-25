import { UserType } from '../types/user.type';
import { usersRepository } from '../repositories/users.repository';
import { CreateUserInputDTO } from '../routes/input-dto/create-user.input-dto';
import { bcryptService } from '../../auth/adapters/bcrypt.service';
import { argon2Service } from '../../auth/adapters/argon2.service';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';
import { WithId } from 'mongodb';
import { UserOutputDTO } from '../routes/output-dto/user.output-dto';
import { mapToUserOutputDTO } from '../repositories/mappers/map-to-user-output-dto.util';

/*Сервис "usersService" для работы с данными по пользователям.*/
export const usersService = {
  /*Метод "create()" для добавления нового пользователя.*/
  async create(dto: CreateUserInputDTO): Promise<Result<{ userId: string }>> {
    /*Создаем переменные на основе параметра "dto" при помощи деструктуризации.*/
    const { login, password, email }: { login: string; password: string; email: string } = dto;
    /*Просим адаптер "bcryptService" сгенерировать хэш для пароля.*/
    // const passwordHash = await bcryptService.generateHash(password);
    /*Просим адаптер "argon2Service" сгенерировать хэш для пароля.*/
    const passwordHash: string = await argon2Service.generateHash(password);

    /*Создаем объект с данными нового пользователя.*/
    const newUser: UserType = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
    };

    /*Просим репозиторий "usersRepository" создать нового пользователя в БД.*/
    const userId: string = await usersRepository.create(newUser);

    /*Возвращаем ResultObject c ID пользователя.*/
    return {
      status: ResultStatuses.Created,
      data: { userId },
      extensions: [],
    };
  },

  /*Метод "deleteById()" для удаления пользователя по ID.*/
  async deleteById(userId: string): Promise<Result<{} | null>> {
    /*Просим репозиторий "usersRepository" удалить пользователя по ID в БД.*/
    const deletedUserResult: number = await usersRepository.deleteById(userId);

    /*Если пользователь не был удален, то возвращаем ResultObject с информацией об этом.*/
    if (deletedUserResult < 1) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'userId', message: 'Not Found' }],
      };
    }

    /*Если пользователь был удален, то возвращаем ResultObject c информацией об этом.*/
    return {
      status: ResultStatuses.NoContent,
      data: {},
      extensions: [],
    };
  },

  /*Метод "findByLoginOrEmail()" для поиска пользователя по логину/email.*/
  async findByLoginOrEmail(loginOrEmail: string): Promise<Result<{ userOutput: UserOutputDTO } | null>> {
    /*Просим query-репозиторий "usersQueryRepository" найти данные по пользователю по логину/email в БД.*/
    const userResult: WithId<UserType> | null = await usersRepository.findByLoginOrEmail(loginOrEmail);

    /*Если пользователь не был найден, то возвращаем ResultObject с информацией об этом.*/
    if (!userResult) {
      return {
        status: ResultStatuses.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };
    }

    /*Если пользователь был найден, то преобразовываем данные по пользователю из БД в подготовленные для отправки
    клиенту данные.*/
    const userOutput: UserOutputDTO = mapToUserOutputDTO(userResult);

    /*Возвращаем ResultObject c преобразованными данными по пользователю.*/
    return {
      status: ResultStatuses.Ok,
      data: { userOutput },
      extensions: [],
    };
  },
};
