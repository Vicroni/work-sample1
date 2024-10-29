const WebSocket = require('ws');
const readline = require('readline');

// Connect to the WebSocket server at a specific URL
const ws = new WebSocket('wss://api-id.execute-api.us-east-1.amazonaws.com/production');
// Setup interactive console for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// When the connection is open
ws.on('open', () => {
  console.log('Connected to the WebSocket server');

  // Prompt the user for input
  rl.setPrompt('Enter value for msg: ');
  rl.prompt();

  // Send the user input as part of the message to the server
  rl.on('line', (input) => {
    const message = { action: "msg", msg: input }; // Set action to 4 and msg to user input
    ws.send(JSON.stringify(message)); // Send the constructed message to the server
    console.log('Sent message to server:', message);
    rl.prompt(); // Prompt again for more input
  });
});

// Listen for messages from the server
ws.on('message', (message) => {
  console.log(`\n Received from server: ${message}`);
});

// Handle WebSocket errors
ws.on('error', (error) => {
  console.log(`WebSocket error: ${error}`);
});

// Handle connection close
ws.on('close', () => {
  console.log('Disconnected from the WebSocket server');
  rl.close(); // Close readline when WebSocket connection is closed
});
