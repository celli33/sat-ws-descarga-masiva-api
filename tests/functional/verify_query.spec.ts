import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';
import { EndpointEnum } from '../../app/Enums/endpointEnum';

test.group('Verify query', () => {
    const uuid = 'put-uuid-from-make-query-test-response';
    test('verify query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('verify-query')).json({
            uuid: uuid,
            endpoint: EndpointEnum.CFDI,
        });

        response.dumpBody();

        response.assertStatus(200);
    });
});
