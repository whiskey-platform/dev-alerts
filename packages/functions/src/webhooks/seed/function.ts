import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBService } from '@whiskeylerts-ingest/core/services/dynamodb.service';
import { ReceivedWebhook } from '@whiskeylerts-ingest/core/models/ReceivedWebhooks';
import middy from '@middy/core';
import cloudwatchMetrics from '@middy/cloudwatch-metrics';
import inputOutputLogger from '@middy/input-output-logger';
import errorLogger from '@middy/error-logger';
import httpCors from '@middy/http-cors';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpSecurityHeaders from '@middy/http-security-headers';
import httpErrorHandler from '@middy/http-error-handler';
import { Table } from 'sst/node/table';
import { validateSeedPayload } from 'src/middleware/validate-seed-payload';

const dynamo = DynamoDBService.live();
const seedWebhookHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body!);
  // validate event somehow
  const toSave: ReceivedWebhook = {
    payload: body,
    type: 'seed',
    timestamp: body.ts,
  };
  await dynamo.save(toSave, Table.ReceivedWebhooksTable.tableName);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success!' }),
  };
};
export const handler = middy(seedWebhookHandler)
  .use(httpSecurityHeaders())
  .use(cloudwatchMetrics())
  .use(inputOutputLogger())
  .use(validateSeedPayload)
  .use(httpCors())
  .use(errorLogger())
  .use(httpErrorHandler());
