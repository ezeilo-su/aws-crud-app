import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class AwsCrudAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'RestApi', {});

    const table = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      // sortKey: {
      //   name: 'created_at',
      //   type: dynamodb.AttributeType.NUMBER
      // },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const listUsersLambda = new NodejsFunction(this, 'listUsers', {
      entry: join(__dirname, '../src/handlers/list-users.ts'),
      runtime: Runtime.NODEJS_18_X,
      functionName: 'listUsers',
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    const createUserLambda = new NodejsFunction(this, 'createUser', {
      entry: join(__dirname, '../src/handlers/create-user.ts'),
      runtime: Runtime.NODEJS_18_X,
      functionName: 'createUser',
      environment: {
        TABLE_NAME: table.tableName
      }
    })

    const getUserLambda = new NodejsFunction(this, 'getUser', {
      entry: join(__dirname, '../src/handlers/get-user.ts'),
      runtime: Runtime.NODEJS_18_X,
      functionName: 'getUser',
      environment: {
        TABLE_NAME: table.tableName
      }
    })

    const deleteUserLambda = new NodejsFunction(this, 'deleteUser', {
      entry: join(__dirname, '../src/handlers/delete-user.ts'),
      runtime: Runtime.NODEJS_18_X,
      functionName: 'deleteUser',
      environment: {
        TABLE_NAME: table.tableName
      }
    })

    table.grantReadWriteData(listUsersLambda);
    table.grantReadWriteData(createUserLambda);
    table.grantReadWriteData(getUserLambda);
    table.grantReadWriteData(deleteUserLambda);

    const usersResource = api.root.addResource('users');

    usersResource.addMethod('GET', new LambdaIntegration(listUsersLambda));
    usersResource.addMethod('POST', new LambdaIntegration(createUserLambda));

    const userResource = usersResource.addResource('{id}');
    userResource.addMethod('GET', new LambdaIntegration(getUserLambda));
    userResource.addMethod('DELETE', new LambdaIntegration(deleteUserLambda));
  }
}
