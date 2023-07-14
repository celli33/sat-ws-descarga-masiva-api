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
    ServiceConsumer,
} from '@nodecfdi/sat-ws-descarga-masiva';

export default class MakeQueriesController {
    private endPoint: string;
    private rfcMatches: string[] | null;
    private downloadType: DownloadType;
    private requestType: RequestType;
    private dateTimePeriod: DateTimePeriod;
    private queryParameters: QueryParameters;

    public async handle({ request, response }: HttpContextContract) {
        const payload = await request.validate(MakeQueryValidator);
        this.endPoint = payload.endPoint ? payload.endPoint.toString() : EndpointEnum.CFDI.toString();
        this.downloadType = new DownloadType(payload.downloadType as DownloadTypeTypes);
        this.requestType = new RequestType(payload.requestType as RequestTypeTypes);
        this.rfcMatches = payload.rfcMatches ? payload.rfcMatches : [];
        this.dateTimePeriod = new DateTimePeriod(new DateTime(payload.startDate), new DateTime(payload.endDate));
        this.queryParameters = QueryParameters.create()
            .withPeriod(this.dateTimePeriod)
            .withDownloadType(this.downloadType)
            .withRequestType(this.requestType);
        if (payload.documentStatus) {
            this.queryParameters = this.queryParameters.withDocumentStatus(
                new DocumentStatus(payload.documentStatus as DocumentStatusTypes)
            );
        }
        const satWsServiceHelper = new ServiceConsumer();
    }
}
