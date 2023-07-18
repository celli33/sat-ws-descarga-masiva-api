import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { EndpointEnum } from '../Enums/endpointEnum';
import { DownloadTypeEnum } from '../Enums/downloadTypeEnum';
import { RequestTypeEnum } from '../Enums/requestTypeEnum';
import { DocumentTypeEnum } from '../Enums/documentTypeEnum';
import { DocumentStatusEnum } from '../Enums/documentStatusEnum';
import { ComplementEnum } from '../Enums/complementEnum';

export default class MakeQueryValidator {
    constructor(protected ctx: HttpContextContract) {}

    /*
     * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
     *
     * For example:
     * 1. The username must be of data type string. But then also, it should
     *    not contain special characters or numbers.
     *    ```
     *     schema.string({}, [ rules.alpha() ])
     *    ```
     *
     * 2. The email must be of data type string, formatted as a valid
     *    email. But also, not used by any other user.
     *    ```
     *     schema.string({}, [
     *       rules.email(),
     *       rules.unique({ table: 'users', column: 'email' }),
     *     ])
     *    ```
     */
    public schema = schema.create({
        startDate: schema.date(),
        endDate: schema.date(),
        endPoint: schema.enum.nullableAndOptional(Object.values(EndpointEnum)),
        downloadType: schema.enum(Object.values(DownloadTypeEnum)),
        requestType: schema.enum(Object.values(RequestTypeEnum)),
        documentType: schema.enum.nullableAndOptional(Object.values(DocumentTypeEnum)),
        documentStatus: schema.enum.nullableAndOptional(Object.values(DocumentStatusEnum)),
        complement: schema.enum.nullableAndOptional(Object.values(ComplementEnum)),
        rfcMatches: schema.array.nullableAndOptional().members(schema.string({}, [rules.uuid()])),
        uuid: schema.string.nullableAndOptional({}, [rules.uuid()]),
        rfcOnBehalf: schema.string.nullableAndOptional(),
    });

    /**
     * Custom messages for validation failures. You can make use of dot notation `(.)`
     * for targeting nested fields and array expressions `(*)` for targeting all
     * children of an array. For example:
     *
     * {
     *   'profile.username.required': 'Username is required',
     *   'scores.*.number': 'Define scores as valid numbers'
     * }
     *
     */
    public messages: CustomMessages = {};
}
