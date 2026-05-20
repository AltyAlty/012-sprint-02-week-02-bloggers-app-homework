/*DTO для разрешенных значений query-параметра "sortBy" для сортировки данных по блогам на странице при пагинации.*/
export enum BlogSortFieldInputDTO {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
}
