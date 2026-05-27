import { SortDirection } from './sort-direction';

/*Тип для объекта с дефолтными настройками пагинации.*/
export type defaultPaginationSettingsType<P> = {
  pageNumber: number;
  pageSize: number;
  sortBy: P;
  sortDirection: SortDirection;
};
