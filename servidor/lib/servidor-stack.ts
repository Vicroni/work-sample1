// Import necessary modules from the AWS CDK library
import * as cdk from 'aws-cdk-lib'; // Core CDK library
import { Construct } from 'constructs'; // Base class for constructs
import * as lambda from 'aws-cdk-lib/aws-lambda'; // Lambda service module
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'; // API Gateway v2 module for WebSocket
import { WebSocketLambdaIntegration, WebSocketMockIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'; // Integrations for WebSocket APIs
import path = require('path'); // Node.js path module for resolving file paths

// Define a new CDK stack for the WebSocket server
export class ServidorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props); // Call the parent class constructor

    // Create a Lambda function for handling WebSocket connections
    const connect = new lambda.Function(this, "connect", {
      runtime: lambda.Runtime.NODEJS_20_X, // Specify the Node.js runtime to use
      handler: 'index.handler', // Specify the handler function
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda', 'connect')) // Specify the Lambda code location
    });

    // Create a Lambda function for handling WebSocket disconnections
    const disconnect = new lambda.Function(this, "disconnect", {
      runtime: lambda.Runtime.NODEJS_20_X, // Specify the Node.js runtime to use
      handler: 'index.handler', // Specify the handler function
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda', 'disconnect')) // Specify the Lambda code location
    });

    // Create a mock integration for the default route of the WebSocket API
    const mockIntegration = new WebSocketMockIntegration('default');

    // Create a new WebSocket API
    const webSocketApi = new apigwv2.WebSocketApi(this, 'websocket_test', {
      connectRouteOptions: {
        // Set the integration for the connect route
        integration: new WebSocketLambdaIntegration('disconnect', disconnect)
      },
      disconnectRouteOptions: {
        // Set the integration for the disconnect route
        integration: new WebSocketLambdaIntegration('connect', connect)
      },
      defaultRouteOptions: {
        // Set the mock integration as the default route
        integration: mockIntegration
      },
      // Specify the route selection expression to determine the route based on the action in the request body
      routeSelectionExpression: '$request.body.action'
    });

    const stage_name = 'production'; // Define the stage name for the WebSocket API

    // Create a new WebSocket stage for the API
    const websocketStage = new apigwv2.WebSocketStage(this, stage_name, {
      webSocketApi, // Associate the WebSocket API with the stage
      stageName: stage_name, // Specify the name of the stage
      autoDeploy: true // Automatically deploy the stage when changes are made
    });

    // Create a Lambda function for handling messages
    const msg = new lambda.Function(this, "msg", {
      runtime: lambda.Runtime.NODEJS_20_X, // Specify the Node.js runtime to use
      handler: 'index.handler', // Specify the handler function
      code: lambda.Code.fromAsset(path.resolve(__dirname, 'lambda', 'msg')), // Specify the Lambda code location
      // Set the environment variable for the API Gateway URL
      environment: {
        URL_APIGATEWAY: `https://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${stage_name}`
      }
    });

    // Grant the message Lambda function permissions to manage WebSocket connections
    webSocketApi.grantManageConnections(msg);

    // Add a new route for handling messages in the WebSocket API
    webSocketApi.addRoute('msg', {
      // Set the integration for the 'msg' route to the message Lambda function
      integration: new WebSocketLambdaIntegration('msg', msg),
    });

    // Output the WebSocket API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: `wss://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${stage_name}`, // Construct the WebSocket URL
      description: 'The URL of the API Gateway' // Description of the output
    });
  }
}