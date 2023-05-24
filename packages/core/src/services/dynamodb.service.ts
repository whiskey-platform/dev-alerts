import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { tracer } from '../utils/tracer';

export class DynamoDBService {
  private docClient: DynamoDBDocumentClient;
  constructor(documentClient: DynamoDBDocumentClient) {
    this.docClient = documentClient;
  }
  public static live(): DynamoDBService {
    const dynamoClient = new DynamoDBClient({});
    tracer.captureAWSv3Client(dynamoClient);
    const docClient = DynamoDBDocumentClient.from(dynamoClient);
    return new DynamoDBService(docClient);
  }

  public async save(Item: any, TableName: string) {
    const request = new PutCommand({
      TableName,
      Item,
    });
    await this.docClient.send(request);
  }
}
