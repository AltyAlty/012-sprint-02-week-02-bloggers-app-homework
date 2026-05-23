import { UserType } from '../types/user.type';
import { usersRepository } from '../repositories/users.repository';
import { CreateUserInputDTO } from '../routes/input-dto/create-user.input-dto';
import { bcryptService } from '../../auth/adapters/bcrypt.service';
import { argon2Service } from '../../auth/adapters/argon2.service';
import { ResultStatuses } from '../../core/types/result/result-statuses';
import { Result } from '../../core/types/result/result.type';

/*Сервис "usersService" для работы с данными по пользователям.*/
export const usersService = {
  /*Метод "create()" для добавления нового пользователя.*/
  async create(dto: CreateUserInputDTO): Promise<Result<{ userId: string }>> {
    /*Создаем переменные на основе параметра "dto" при помощи деструктуризации.*/
    const { login, password, email } = dto;
    /*Просим адаптер "bcryptService" сгенерировать хэш для пароля.*/
    // const passwordHash = await bcryptService.generateHash(password);
    /*Просим адаптер "argon2Service" сгенерировать хэш для пароля.*/
    const passwordHash = await argon2Service.generateHash(password);

    /*Создаем объект с данными нового пользователя.*/
    const newUser: UserType = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
    };

    /*Просим репозиторий "usersRepository" создать нового пользователя в БД.*/
    const userId = await usersRepository.create(newUser);

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
    const deletedUserResult = await usersRepository.deleteById(userId);

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
};
