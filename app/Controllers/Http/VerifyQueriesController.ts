import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import VerifyQueryValidator from '../../Validators/VerifyQueryValidator';
import { Fiel, FielRequestBuilder, HttpsWebClient, Service, ServiceEndpoints } from '@nodecfdi/sat-ws-descarga-masiva';
import Drive from '@ioc:Adonis/Core/Drive';
import Env from '@ioc:Adonis/Core/Env';
import { install } from '@nodecfdi/cfdiutils-common';
import { DOMParser, XMLSerializer, DOMImplementation } from '@xmldom/xmldom';
import { endpointEnum } from '../../Enums/endpointEnum';

export default class VerifyQueriesController {
    public async handle({ request, response }: HttpContextContract) {
        const payload = await request.validate(VerifyQueryValidator);
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

        let endPoint: ServiceEndpoints;
        if (payload.endPoint) {
            endPoint =
                payload.endPoint === endpointEnum.CFDI ? ServiceEndpoints.cfdi() : ServiceEndpoints.retenciones();
        } else {
            endPoint = ServiceEndpoints.cfdi();
        }
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
        const webClient = new HttpsWebClient();
        const requestBuilder = new FielRequestBuilder(fiel);
        const service = new Service(requestBuilder, webClient, undefined, endPoint);
        const verify = await service.verify(payload.uuid);
        if (!verify.getStatus().isAccepted()) {
            return response.badRequest({
                message: `Fallo al verificar la consulta ${payload.uuid}: ${verify.getStatus().getMessage()}`,
            });
        }

        // revisar el progreso de la generación de los paquetes
        const statusRequest = verify.getStatusRequest();
        if (
            statusRequest.isTypeOf('Expired') ||
            statusRequest.isTypeOf('Failure') ||
            statusRequest.isTypeOf('Rejected')
        ) {
            return response.badRequest({
                message: `La solicitud ${payload.uuid} no se puede completar`,
            });
        }

        if (statusRequest.isTypeOf('InProgress') || statusRequest.isTypeOf('Accepted')) {
            return response.badRequest({
                message: `La solicitud ${payload.uuid} se está procesando`,
            });
        }
        if (statusRequest.isTypeOf('Finished')) {
            return response.badRequest({
                message: `La solicitud ${payload.uuid} está lista`,
            });
        }
    }
}
