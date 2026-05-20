/*DTO для разрешенных значений query-параметра "sortBy" для сортировки данных по постам на странице при пагинации.*/
export enum PostSortFieldInputDTO {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogId = 'blogId',
  BlogName = 'blogName',
}
