/*DTO для метаданных касательно пагинации.*/
export type PaginationMetaDataOutputDTO = {
  page: number;
  pageSize: number;
  pagesCount: number;
  totalCount: number;
};
