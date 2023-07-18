import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import MakeQueryValidator from '../../Validators/MakeQueryValidator';
import {
    DateTimePeriod,
    DownloadType,
    QueryParameters,
    RequestType,
    RequestTypeTypes,
    DownloadTypeTypes,
    DateTime,
    DocumentStatusTypes,
    DocumentStatus,
    DocumentType,
    DocumentTypeTypes,
    ComplementoCfdi,
    ComplementoCfdiTypes,
    Uuid,
    RfcOnBehalf,
    RfcMatches,
    RfcMatch,
    Fiel,
    HttpsWebClient,
    FielRequestBuilder,
    Service,
    ServiceEndpoints,
} from '@nodecfdi/sat-ws-descarga-masiva';
import { install } from '@nodecfdi/cfdiutils-common';
import Env from '@ioc:Adonis/Core/Env';
import { DOMParser, XMLSerializer, DOMImplementation } from '@xmldom/xmldom';
import Drive from '@ioc:Adonis/Core/Drive';
import { EndpointEnum } from '../../Enums/endpointEnum';

export default class MakeQueriesController {
    public async handle({ request, response }: HttpContextContract) {
        const payload = await request.validate(MakeQueryValidator);

        let fiel: Fiel;
        try {
            fiel = Fiel.create(
                (await Drive.get(Env.get('CERTIFICATE_PATH'))).toString('binary'),
                (await Drive.get(Env.get('PRIVATE_KEY_PATH'))).toString('binary'),
                (await Drive.get(Env.get('PRIVATE_KEY_PASSPHRASE_PATH'))).toString('utf8').trim()
            );
        } catch (error) {
            return response.notFound({
                message: 'FIEL not found.',
            });
        }

        if (!fiel.isValid()) {
            return response.badRequest({
                message: 'Bad FIEL.',
            });
        }
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());

        let endPoint: ServiceEndpoints;
        if (payload.endPoint) {
            endPoint =
                payload.endPoint === EndpointEnum.CFDI ? ServiceEndpoints.cfdi() : ServiceEndpoints.retenciones();
        } else {
            endPoint = ServiceEndpoints.cfdi();
        }
        const downloadType = new DownloadType(payload.downloadType as DownloadTypeTypes);
        const requestType = new RequestType(payload.requestType as RequestTypeTypes);
        const dateTimePeriod = new DateTimePeriod(new DateTime(payload.startDate), new DateTime(payload.endDate));
        let queryParameters = QueryParameters.create()
            .withPeriod(dateTimePeriod)
            .withDownloadType(downloadType)
            .withRequestType(requestType);

        queryParameters = queryParameters.withDocumentType(
            new DocumentType(payload.documentType ? (payload.documentType as DocumentTypeTypes) : 'undefined')
        );
        queryParameters = queryParameters.withDocumentStatus(
            new DocumentStatus(payload.documentStatus ? (payload.documentStatus as DocumentStatusTypes) : 'undefined')
        );
        queryParameters = queryParameters.withComplement(
            new ComplementoCfdi(payload.complement ? (payload.complement as ComplementoCfdiTypes) : 'undefined')
        );
        if (payload.uuid) {
            queryParameters = queryParameters.withUuid(new Uuid(payload.uuid));
        }
        if (payload.rfcOnBehalf) {
            queryParameters = queryParameters.withRfcOnBehalf(RfcOnBehalf.create(payload.rfcOnBehalf));
        }
        if (payload.rfcMatches) {
            const matches: RfcMatch[] = [];
            payload.rfcMatches.forEach((element) => {
                matches.push(RfcMatch.create(element));
            });
            RfcMatches.create();
            queryParameters = queryParameters.withRfcMatches(RfcMatches.create(...matches));
        }

        const webClient = new HttpsWebClient();
        const requestBuilder = new FielRequestBuilder(fiel);
        const service = new Service(requestBuilder, webClient, undefined, endPoint);
        const query = await service.query(queryParameters);
        if (!query.getStatus().isAccepted()) {
            return response.forbidden({
                message: `Fallo al presentar la consulta: ${query.getStatus().getMessage()}`,
            });
        }
        return response.created({
            message: `Se generó la solicitud ${query.getRequestId()}`,
        });
    }
}
