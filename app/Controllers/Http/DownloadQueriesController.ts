import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import DownloadQueryValidator from '../../Validators/DownloadQueryValidator';
import { Fiel, FielRequestBuilder, HttpsWebClient, Service, ServiceEndpoints } from '@nodecfdi/sat-ws-descarga-masiva';
import Drive from '@ioc:Adonis/Core/Drive';
import Env from '@ioc:Adonis/Core/Env';
import { DOMParser, XMLSerializer, DOMImplementation } from '@xmldom/xmldom';
import { install } from '@nodecfdi/cfdiutils-common';
import { EndpointEnum } from '../../Enums/endpointEnum';

export default class DownloadQueriesController {
    public async handle({ request, response }: HttpContextContract) {
        const payload = await request.validate(DownloadQueryValidator);

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

        const webClient = new HttpsWebClient();
        const requestBuilder = new FielRequestBuilder(fiel);
        const service = new Service(requestBuilder, webClient, undefined, endPoint);

        const messageForPackage: string[] = [];

        for await (const packageId of payload.ids) {
            const download = await service.download(packageId);
            if (!download.getStatus().isAccepted()) {
                messageForPackage.push(
                    `El paquete ${packageId} no se ha podido descargar: ${download.getStatus().getMessage()}`
                );
                continue;
            }
            await Drive.put(`${packageId}.zip`, Buffer.from(download.getPackageContent(), 'base64'));
            messageForPackage.push(`el paquete ${packageId} se ha almacenado`);
        }
        return response.ok({
            message: 'Resument de paquetes',
            data: {
                messageForPackage,
            },
        });
    }
}
