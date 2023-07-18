import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';
import { endpointEnum } from '../../app/Enums/endpointEnum';

test.group('Download query', () => {
    const packageIds = ['CD2DCC63-AE7A-447F-804D-86701511AF92_01'];
    test('download query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('download-query')).json({
            ids: packageIds,
            endpoint: endpointEnum.CFDI,
        });

        response.dump();

        response.assertStatus(200);
    });
});
