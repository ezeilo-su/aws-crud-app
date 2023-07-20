import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'id is required'
        })
      }
    }

    const getItemCommand = new GetItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: { S: id }
      }
    });

    const user = (await docClient.send(getItemCommand)).Item;
    if(!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          message: 'No user found with this ID'
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'User successfully retrieved',
        user: unmarshall(user)
      })
    }

  } catch (error) {
    console.error('Error occured in getUser handler', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Something went wrong'
      })
    };    
  }
}