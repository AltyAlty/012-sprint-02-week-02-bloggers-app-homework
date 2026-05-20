import { WithId } from 'mongodb';
import { UserType } from '../../types/user.type';
import { UserOutputDTO } from '../../routes/output-dto/user.output-dto';

/*Функция "mapToUserOutputDTO()" преобразовывает данные по пользователю из БД в подготовленные для отправки клиенту
данные.*/
export const mapToUserOutputDTO = (blog: WithId<UserType>): UserOutputDTO => {
  return {
    id: blog._id.toString(),
    login: blog.login,
    email: blog.email,
    createdAt: blog.createdAt,
  };
};
