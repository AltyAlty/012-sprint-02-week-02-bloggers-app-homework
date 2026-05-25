/*DTO для разрешенных значений query-параметра "sortBy" для сортировки данных по комментариям на странице при
пагинации.*/
export enum CommentSortFieldInputDTO {
  CreatedAt = 'createdAt',
  PostId = 'postId',
  Content = 'content',
  CommentatorInfo = 'commentatorInfo',
}
