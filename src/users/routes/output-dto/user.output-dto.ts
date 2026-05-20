/*DTO для исходящих данных по пользователям.*/
export type UserOutputDTO = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};
