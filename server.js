const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const server = require('http').createServer(app);
const { db } = require("./firebase.js");
const { Timestamp } = require('firebase-admin/firestore'); // added timestamp in db and check for undefined messages

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Store messages//////////////
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

// Endpoint to receive GPS data
app.post("/sendMessage", async (req, res) => {
    try {
        const { message } = req.body;
        
        // Check if message is undefined or null
        if (message === undefined || message === null) {
            console.log("Received undefined or null message. Ignoring.");
            return res.status(400).json({ success: false, error: "Message is undefined or null" });
        }
        
        console.log(`Received Message from Arduino: ${message}`);
        messages.push(message); // Store the received message

        // Extract the vehicle ID from the request headers
        const vehicleId = req.headers['x-vehicle-id'] || 'locations'; // Default to 'locations' if not provided

        // Save the GPS data to Firebase with a timestamp
        const userJson = {
            message: message,
            timestamp: Timestamp.now()
        };
        const response = await db.collection(vehicleId).add(userJson);
        
        res.status(200).json({ success: true, id: response.id });
    } catch(error) {
        console.error("Error processing message:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start the server
server.listen(3000, () => {
    console.log("Server started on port 3000");
});