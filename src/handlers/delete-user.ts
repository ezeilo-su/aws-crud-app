import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
// import 

export const handler = async (event: APIGatewayProxyEvent) => {
  const client = new DynamoDBClient({});
  const dcoClient = DynamoDBDocumentClient.from(client)
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'ID is required'
        })
      };
    }

    const deleteCommand = new DeleteItemCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: { S: id },
      },
    });
  
    const response = await dcoClient.send(deleteCommand);
    console.log('User deleted. response:\n', response);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'user successfully deleted'
      })
    };
  } catch (error) {
    console.error('Error occured in deleteUser handler', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Something went wrong'
      })
    }; 
  }
}