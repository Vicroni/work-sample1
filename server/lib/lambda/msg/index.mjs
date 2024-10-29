// Import the necessary classes from the AWS SDK for JavaScript v3
import {
  ApiGatewayManagementApiClient, // Client to interact with the API Gateway Management API
  PostToConnectionCommand,         // Command to send a message to a specific connection
} from "@aws-sdk/client-apigatewaymanagementapi";

// Retrieve the API Gateway URL from environment variables
const apiGatewayUrl = process.env.URL_APIGATEWAY;

// Initialize an instance of the ApiGatewayManagementApiClient with the specified endpoint
const apiClient = new ApiGatewayManagementApiClient({
  endpoint: apiGatewayUrl // Set the endpoint for the API Gateway
});

// Export the main Lambda handler function
export const handler = async (event) => {
  // Parse the body of the incoming event to get the message data
  const body = JSON.parse(event.body);

  // Destructure the action and message from the parsed body
  const { action, msg } = body;

  // Log the entire event for debugging purposes
  console.log(event);

  // Create a template for the data to be sent in the message
  const postDataTemplate = {
    Data: JSON.stringify({
      content: msg // Include the message content in the Data field
    }),
  };

  // Construct the final data object by adding the ConnectionId to the template
  const postData = {
    ...postDataTemplate, // Spread the template properties
    ConnectionId: event.requestContext.connectionId // Add the connection ID from the event context
  };

  // Send the message to the specific connection using the API Gateway Management API
  await apiClient.send(new PostToConnectionCommand(postData));

  // Return a success response to the caller
  return { statusCode: 200, body: "Message sent." }; // Indicate that the message was successfully sent
};