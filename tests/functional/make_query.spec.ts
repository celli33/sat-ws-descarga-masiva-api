import { test } from '@japa/runner';
import Route from '@ioc:Adonis/Core/Route';
import { RequestTypeEnum } from '../../app/Enums/requestTypeEnum';
import { DownloadTypeEnum } from '../../app/Enums/downloadTypeEnum';

test.group('Make query', () => {
    test('make basic query', async ({ client }) => {
        const response = await client.post(Route.makeUrl('make-query')).json({
            startDate: '2023-01-01T00:00:00',
            endDate: '2023-06-30T00:00:01',
            downloadType: DownloadTypeEnum.RECEIVED,
            requestType: RequestTypeEnum.METADATA,
        });
        response.dumpBody();

        response.assertStatus(201);
    });
});
