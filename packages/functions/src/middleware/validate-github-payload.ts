import { MiddlewareObj } from '@middy/core';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createHmac, Hmac, timingSafeEqual } from 'crypto';
import { Config } from 'sst/node/config';

export const validateGitHubPayload: MiddlewareObj<APIGatewayProxyEventV2> = {
  before: async (request) => {
    const hmac = createHmac('sha256', Config.GITHUB_SECRET_TOKEN);
    hmac.update(request.event.body!);
    const calculated = `sha256=${hmac.digest('hex')}`;
    console.log(calculated);
    console.log('--------');
    console.log(request.event.headers['x-hub-signature-256']);
    const encoder = new TextEncoder();
    if (
      !timingSafeEqual(
        encoder.encode(calculated),
        encoder.encode(request.event.headers['x-hub-signature-256'])
      )
    ) {
      throw 'Invalid request';
    }
  },
};
