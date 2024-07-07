const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const server = require('http').createServer(app);
const { db } = require("./firebase.js");

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// Endpoint to receive GPS data
app.post("/sendMessage", async (req, res) => {
    try {
        const { message } = req.body;
        console.log(`Received Message from Arduino: ${message}`);
        messages.push(message); // Store the received message

        // Save the GPS data to Firebase
        const userJson = {
            message: message
        };
        const response = await db.collection("locations").add(userJson);
        
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