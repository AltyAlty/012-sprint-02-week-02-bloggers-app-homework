import { WithId } from 'mongodb';
import { UserType } from '../../types/user.type';
import { UserOutputDTO } from '../../routes/output-dto/user.output-dto';

/*Функция "mapToUserOutputDTO()" преобразовывает пользователя из БД в подготовленного для отправки клиенту
пользователя.*/
export const mapToUserOutputDTO = (blog: WithId<UserType>): UserOutputDTO => {
  return {
    id: blog._id.toString(),
    login: blog.login,
    email: blog.email,
    createdAt: blog.createdAt,
  };
};
