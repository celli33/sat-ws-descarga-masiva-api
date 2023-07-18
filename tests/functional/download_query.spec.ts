import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';
import { EndpointEnum } from '../../app/Enums/endpointEnum';

test.group('Download query', () => {
    const packageIds = ['put-ids-from-verify-query-response'];
    test('download query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('download-query')).json({
            packageIds: packageIds,
            endpoint: EndpointEnum.CFDI,
        });

        response.assertBodyContains({
            data: {
                packages: [
                    {
                        id: packageIds[0],
                    },
                ],
            },
        });

        response.assertStatus(200);
    });
});
