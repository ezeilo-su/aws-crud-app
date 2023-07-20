import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const handler = async (_event: APIGatewayProxyEvent) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  const tableQueryCommand = new ScanCommand({
    TableName:  process.env.TABLE_NAME,
    ConsistentRead: true,
  });

  const response = await docClient.send(tableQueryCommand);
  const items = response.Items;
  if (!items) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'No user found!' })
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      users: items
    })
  };
}
