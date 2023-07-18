# SAT WS DESCARGA MASIVA API

Este es un proyecto TS de adonisjs que hace una implementación básica de la librería [@nodecfdi/sat-ws-descarga-masiva](https://github.com/nodecfdi/sat-ws-descarga-masiva).

## Instalación

Para instalar:

```bash
pnpm i
```

Luego copia el `.env.example` a `.env`:

```bash
cp .env.example .env
```

genera el `app key`:

```bash
node ace generate:key
```

Si deseas ejecutar los endpoints usando los tests puedes usar `cp .env .env.test` por el momento los tests no usan ningún tipo de mock
así que si los corres se intentará generar una descarga real usando los valores encontrados en el `.env.tes`.

Configura la ubicación del certificado, llave privada y contraseña a usar en tu archivo `.env` (deben ser relativos a la ruta `storage/`).

## Uso básico

Se implementan tres endpoints básicos:

## /make-query

Que acepta los siguientes parámetros con sus valores especificados en su correspondiente enum:

```ts
import { EndpointEnum } from '../Enums/endpointEnum';
import { DownloadTypeEnum } from '../Enums/downloadTypeEnum';
import { RequestTypeEnum } from '../Enums/requestTypeEnum';
import { DocumentTypeEnum } from '../Enums/documentTypeEnum';
import { DocumentStatusEnum } from '../Enums/documentStatusEnum';
import { ComplementEnum } from '../Enums/complementEnum';
{
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
}
```

Si la `query` fue correcta se recibirá un json del siguiente estilo con el status `201`:

```json
{
  "message": "Se generó la solicitud b3cd7575-8d58-481e-88bc-a33203c01ded",
  "data": { "uuid": "b3cd7575-8d58-481e-88bc-a33203c01ded" }
}
```

Copia el uuid obtenido y procede a verificar

## /verify-query

`verify-query` acepta los parámetros:

```ts
import { EndpointEnum } from '../Enums/endpointEnum';
{
    uuid: schema.string({}, [rules.uuid()]),
    endPoint: schema.enum.nullableAndOptional(Object.values(EndpointEnum)),
}
```

Si la solicitud se pudo verificar correctamente se recibirá un json como el siguiente con un status `200`:

```json
{
  "message": "La solicitud b3cd7575-8d58-481e-88bc-a33203c01ded está lista",
  "data": { "packageIds": [ "b3cd7575-8d58-481e-88bc-a33203c01ded_01" ] }
}
```

Copia los `packageIds` obtenidos en la respuesta y mandalos en la petición `post` hacía `download-query` que acepta:

```ts
import { EndpointEnum } from '../Enums/endpointEnum';
{
    packageIds: schema.array().members(schema.string()),
    endPoint: schema.enum.nullableAndOptional(Object.values(EndpointEnum)),
}
```

Si la descarga se pudo realizar con éxito recibirás un json como el siguiente con un status `200`:

```json
{
    "message": "Resumen de paquetes",
    "data": {
        "packages": [
            {
                "id": "b3cd7575-8d58-481e-88bc-a33203c01ded_01",
                "message": "El paquete b3cd7575-8d58-481e-88bc-a33203c01ded_01 se ha guardado con éxito en storage/b3cd7575-8d58-481e-88bc-a33203c01ded_01.zip",
            }
        ],
    }
}
```

Y tus paquetes estarán guardados en la ruta relativa del root de este proyecto `storage/`
