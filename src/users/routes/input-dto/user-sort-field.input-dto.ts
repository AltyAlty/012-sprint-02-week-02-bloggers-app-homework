/*DTO для разрешенных значений query-параметра "sortBy" для сортировки данных по пользователям на странице при
пагинации.*/
export enum UserSortFieldInputDTO {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}
