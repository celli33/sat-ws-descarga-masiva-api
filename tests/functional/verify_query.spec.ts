import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';
import { endpointEnum } from '../../app/Enums/endpointEnum';

test.group('Verify query', () => {
    const uuid = 'cd2dcc63-ae7a-447f-804d-86701511af92';
    test('verify query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('verify-query')).json({
            uuid: uuid,
            endpoint: endpointEnum.CFDI,
        });

        response.dump();

        response.assertStatus(200);
    });
});
