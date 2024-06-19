const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const server = require('http').createServer(app);
const { db } = require("./firebase.js");

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// For JSON data format
app.use(express.json()); 

// Store messages
let messages = [];

app.get("/", function(req, res) {
    res.send(`
        <html>
        <head>
            <title>Arduino Messages</title>
        </head>
        <body>
            <h1>Received Messages</h1>
            <ul>
                ${messages.map(msg => `<li>${msg}</li>`).join('')}
            </ul>
        </body>
        </html>
    `);
});

// Endpoint to receive simple messages
app.post("/sendMessage", (req, res) => {
  const { message } = req.body;
  console.log(`Received Message from Arduino: ${message}`);
  messages.push(message); // Store the received message
  res.sendStatus(200); // Send a response back to the Arduino

  // Save the GPS data to Firebase
    try {
        console.log(req.body);
        const userJson = {
            message: req.body.message
        };
        const response = db.collection("locations").add(userJson);
        res.send(response);
    } catch(error) {
        res.send(error);
    }
});

// Start the server
server.listen(3000, () => {
  console.log("Server started on port 3000");
});
