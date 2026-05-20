/*Тип для пользователя.*/
export type UserType = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};
