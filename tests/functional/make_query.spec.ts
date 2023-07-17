import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';

test.group('Make query', () => {
    test('make basic query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('make-query')).json({
            startDate: '2023-07-01T00:00:00',
            endDate: '2023-07-31T00:00:00',
            downloadType: 'received',
            requestType: 'metadata',
        });
        response.dump();

        response.assertStatus(201);
    });
});
