import { SSTConfig } from 'sst';
import { API } from './stacks/MyStack';

export default {
  config(_input) {
    return {
      name: 'whiskey-dev-alerts',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs18.x',
      nodejs: {
        esbuild: {
          external: !app.local
            ? ['@aws-sdk/*', '@aws-lambda-powertools/*']
            : undefined,
        },
      },
      environment: {
        POWERTOOLS_SERVICE_NAME: 'whiskey_dev_alerts_service',
      },
    });
    app.stack(API);
  },
} satisfies SSTConfig;
