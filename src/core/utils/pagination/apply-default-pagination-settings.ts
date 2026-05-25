import { defaultPaginationSettings } from '../../middlewares/validation/pagination-validation.middleware';
import { defaultPaginationSettingsType } from '../../types/pagination/default-pagination-settings.type';

/*Функция "applyDefaultPaginationSettings ()" на основе объекта с query-параметрами, прошедшими обработку через функцию
"matchedData()", создает новый объект, который соответствует типу "defaultPaginationSettings".

Касательно TS:
1. "<P = string>": можно указать дженерик-параметр, если не указывать, то он будет равен string.
2. "query: Partial<defaultPaginationSettingsType<P>>": параметр "query" может быть содержать поля типа
"defaultPaginationSettingsType", а может быть вообще пустым объектом.
3. ": defaultPaginationSettingsType<P>": на выходе функция возвращает полный объект типа
"defaultPaginationSettingsType".*/
export const applyDefaultPaginationSettings = <P = string>(
  query: Partial<defaultPaginationSettingsType<P>>
): defaultPaginationSettingsType<P> => {
  return {
    ...defaultPaginationSettings,
    ...query,
    sortBy: (query.sortBy ?? defaultPaginationSettings.sortBy) as P,
  };
};
