import { SortDirection } from './sort-direction';

/*Тип для объекта с дефолтными настройками для пагинации.*/
export type defaultPaginationSettingsType<P> = {
  pageNumber: number;
  pageSize: number;
  sortBy: P;
  sortDirection: SortDirection;
};
