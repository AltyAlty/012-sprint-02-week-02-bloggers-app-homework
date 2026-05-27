import { ValidationErrorOutputDTO } from './validation-error.output-dto';

/*Output DTO для объектов, содержащих массивы с сообщениями об ошибках валидации, отправляемых клиенту.*/
export type ValidationErrorsListOutputDTO = { errorsMessages: ValidationErrorOutputDTO[] };
