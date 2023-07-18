import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';
import { EndpointEnum } from '../../app/Enums/endpointEnum';

test.group('Download query', () => {
    const packageIds = ['put-ids-from-verify-query-response'];
    test('download query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('download-query')).json({
            ids: packageIds,
            endpoint: EndpointEnum.CFDI,
        });

        response.dump();

        response.assertStatus(200);
    });
});
