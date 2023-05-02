import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { verify } from 'jsonwebtoken';
import { Config } from 'sst/node/config';

export const validateSeedPayload: MiddlewareObj<APIGatewayProxyEventV2> = {
  before: async (request) => {
    verify(
      request.event.headers['x-webhook-signature']!,
      Config.SEED_SECRET_TOKEN
    );
  },
};
