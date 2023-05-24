import {
  StackContext,
  Api,
  Table,
  Config,
  ApiDomainProps,
} from 'sst/constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { DomainName } from '@aws-cdk/aws-apigatewayv2-alpha';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';

export function API({ stack, app }: StackContext) {
  const powertools = LayerVersion.fromLayerVersionArn(
    stack,
    'PowertoolsLayer',
    `arn:aws:lambda:${stack.region}:094274105915:layer:AWSLambdaPowertoolsTypeScript:11`
  );

  const receivedWebhooksTable = new Table(stack, 'ReceivedWebhooksTable', {
    fields: {
      type: 'string',
      timestamp: 'number',
    },
    primaryIndex: {
      partitionKey: 'type',
      sortKey: 'timestamp',
    },
  });

  const GITHUB_SECRET_TOKEN = new Config.Secret(stack, 'GITHUB_SECRET_TOKEN');
  const SEED_SECRET_TOKEN = new Config.Secret(stack, 'SEED_SECRET_TOKEN');

  let customDomain: ApiDomainProps | undefined;
  if (!app.local && app.stage !== 'local') {
    customDomain = {
      path: 'dev-alerts',
      cdk: {
        domainName: DomainName.fromDomainNameAttributes(stack, 'ApiDomain', {
          name: StringParameter.valueFromLookup(
            stack,
            `/sst-outputs/${app.stage}-api-infra-Infra/domainName`
          ),
          regionalDomainName: StringParameter.valueFromLookup(
            stack,
            `/sst-outputs/${app.stage}-api-infra-Infra/regionalDomainName`
          ),
          regionalHostedZoneId: StringParameter.valueFromLookup(
            stack,
            `/sst-outputs/${app.stage}-api-infra-Infra/regionalHostedZoneId`
          ),
        }),
      },
    };
  }

  const api = new Api(stack, 'api', {
    routes: {
      'POST /github': 'packages/functions/src/webhooks/github/function.handler',
      'POST /seed': 'packages/functions/src/webhooks/seed/function.handler',
    },
    customDomain,
    defaults: {
      function: {
        bind: [receivedWebhooksTable],
        layers: [powertools],
      },
    },
  });
  api.bindToRoute('POST /github', [GITHUB_SECRET_TOKEN]);
  api.bindToRoute('POST /seed', [SEED_SECRET_TOKEN]);
}
