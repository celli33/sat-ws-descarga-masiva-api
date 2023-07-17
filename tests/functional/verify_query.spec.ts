import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';
import { endpointEnum } from '../../app/Enums/endpointEnum';

test.group('Verify query', () => {
    const uuid = 'e1bc35c6-69e6-43ed-ba45-a9f2a312c650';
    test('verify query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('verify-query')).json({
            uuid: uuid,
            endpoint: endpointEnum.CFDI,
        });
        response.dump();

        response.assertStatus(200);
    });
});
