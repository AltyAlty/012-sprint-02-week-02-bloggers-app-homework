import { query } from 'express-validator';
import { SortDirection } from '../../types/pagination/sort-direction';
import { defaultPaginationSettingsType } from '../../types/pagination/default-pagination-settings.type';

/*Дефолтный номер начальной страницы при пагинации.*/
const DEFAULT_PAGE_NUMBER = 1;
/*Дефолтный размер одной страницы при пагинации.*/
const DEFAULT_PAGE_SIZE = 10;
/*Дефолтный тип сортировки при пагинации.*/
const DEFAULT_SORT_DIRECTION = SortDirection.Desc;
/*Дефолтное свойство, по которому будет осуществлена сортировка при пагинации.*/
const DEFAULT_SORT_BY = 'createdAt';

/*Объект с дефолтными настройками для пагинации.*/
export const defaultPaginationSettings: defaultPaginationSettingsType<string> = {
  pageNumber: DEFAULT_PAGE_NUMBER,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: DEFAULT_SORT_BY,
  sortDirection: DEFAULT_SORT_DIRECTION,
};

/*Middleware "paginationValidationMiddleware" валидирует query-параметры, касающиеся пагинации:
1. "pageNumber": номер страницы должен быть строкой в виде числа, большего 0.
2. "pageSize": размер страницы должен быть строкой в виде числа из диапазона от 1 до 100.
3. "sortBy": поле сортировки данных на странице должно входить в список полей, по которым разрешена сортировка.
4. "sortDirection": тип сортировки данных на странице должен входить в список разрешенных типов сортировки.

Пример query-параметров: ?pageNumber=2&pageSize=10&sortBy=createdAt&sortDirection=asc

Касательно TS:
1. "<T extends string>": объявляется дженерик-параметр типа T, который является строкой или строковым литералом.
2. "sortFieldsEnum: Record<string, T>": указывается, что функция принимает объект, где ключи являются любыми строками,
а значения являются значениями типа T.*/
export const paginationValidationMiddleware = <T extends string>(sortFieldsEnum: Record<string, T>) => {
  /*Берем все значения из объекта "sortFieldsEnum" и формируем из них массив, обозначающий список полей, по которым
  разрешена сортировка.*/
  const allowedSortFields = Object.values(sortFieldsEnum);

  return [
    query('pageNumber')
      /*Подставляем дефолтное значение, если параметр в запросе отсутствует.*/
      .default(DEFAULT_PAGE_NUMBER)
      .isInt({ min: 1 })
      .withMessage('Page number must be a positive integer')
      /*Преобразовываем строку в целое число.*/
      .toInt(),

    query('pageSize')
      .default(DEFAULT_PAGE_SIZE)
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100')
      .toInt(),

    query('sortBy')
      .default(Object.values(sortFieldsEnum)[0])
      /*Проверяем, что указанный query-параметр "sortBy", входит в список полей, по которым разрешена сортировка.*/
      .isIn(allowedSortFields)
      .withMessage(`Invalid sort field. Allowed values: ${allowedSortFields.join(', ')}`),

    query('sortDirection')
      .default(DEFAULT_SORT_DIRECTION)
      .isIn(Object.values(SortDirection))
      .withMessage(`Sort direction must be one of: ${Object.values(SortDirection).join(', ')}`),

    // /api/blogs?pageSize=5&pageNumber=1&searchNameTerm=Tim&sortDirection=asc&sortBy=name
    query('searchNameTerm').optional(),
    query('searchLoginTerm').optional(),
    query('searchEmailTerm').optional(),
  ];
};
