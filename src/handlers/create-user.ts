import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if(!event.body) {
      return {
        statusCode: 400,
        body: {
          success: false,
          message: 'Invalid request body'
        }
      }
    };

    const { fName, lName } = JSON.parse(event.body);

    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const user = {
      id: crypto.randomUUID(),
      fName,
      lName
    };

    const tablePutCommand = new PutCommand({
      TableName:  process.env.TABLE_NAME,
      Item: user
    });
  
    const res = await docClient.send(tablePutCommand);
    console.debug('New user created\n', res);
  
    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        message: 'User created successfully',
        user
      })
    };
  } catch (error) {
    console.error('Error occured in createUser handler', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Something went wrong'
      })
    };
  }
}