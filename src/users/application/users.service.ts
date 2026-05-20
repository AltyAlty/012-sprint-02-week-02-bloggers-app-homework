import { UserType } from '../types/user.type';
import { usersRepository } from '../repositories/users.repository';
import { CreateUserInputDTO } from '../routes/input-dto/create-user.input-dto';
import { bcryptService } from '../../auth/adapters/bcrypt.service';
import { argon2Service } from '../../auth/adapters/argon2.service';

/*Сервис "usersService" для работы с данными по пользователям.*/
export const usersService = {
  /*Метод "create()" для добавления нового пользователя.*/
  async create(dto: CreateUserInputDTO): Promise<string> {
    /*Просим репозиторий "usersRepository" найти пользователя по логину в БД. Если пользователь будет найден, то это
    означает, что логин не уникальный. В таком случае выкидываем ошибку с информацией об этом.*/
    if (await usersRepository.findByLogin(dto.login)) {
      throw { errorsMessages: [{ field: 'login', message: 'login must be unique' }] };
    }

    /*Просим репозиторий "usersRepository" найти пользователя по email в БД. Если пользователь будет найден, то это
    означает, что email не уникальный. В таком случае выкидываем ошибку с информацией об этом.*/
    if (await usersRepository.findByEmail(dto.email)) {
      throw { errorsMessages: [{ field: 'email', message: 'email must be unique' }] };
    }

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
    return usersRepository.create(newUser);
  },

  /*Метод "deleteById()" для удаления пользователя по ID.*/
  async deleteById(userId: string): Promise<void> {
    /*Просим репозиторий "usersRepository" удалить пользователя по ID в БД.*/
    await usersRepository.deleteById(userId);
    return;
  },
};
