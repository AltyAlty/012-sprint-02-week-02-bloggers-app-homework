import { ValidationErrorOutputDTO } from './validation-error.output-dto';

/*DTO для объектов, содержащих массивы с сообщениями об ошибках валидации, отправляемых клиенту.*/
export type ValidationErrorsListOutputDTO = { errorsMessages: ValidationErrorOutputDTO[] };
