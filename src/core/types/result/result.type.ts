import { ResultStatuses } from './result-statuses';

/*Тип для поля "ExtensionType" в ResultObject.*/
type ExtensionType = {
  field: string | null;
  message: string;
};

/*Тип для ResultObject.*/
export type Result<T = null> = {
  status: ResultStatuses;
  errorMessage?: string;
  extensions: ExtensionType[];
  data: T;
};
