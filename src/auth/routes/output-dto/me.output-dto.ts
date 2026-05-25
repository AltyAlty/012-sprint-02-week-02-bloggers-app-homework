/*DTO для исходящих данных для объекта с данными о пользователе, получаемых по токену.*/
export type MeOutputDTO = {
  login: string;
  email: string;
  createdAt: Date;
};
