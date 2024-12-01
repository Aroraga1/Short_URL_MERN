const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve static files from the public directory

// MongoDB connection
mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,  // Increase timeout duration (default is 10000 ms)
  socketTimeoutMS: 30000,   // Increase socket timeout (default is 0, meaning it doesn't time out)
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// Mongoose schema and model
const urlsSchema = new mongoose.Schema({
  mainUrl: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  shortURL: {
    type: String,
    required: true, // Make shortURL required
  },
});

const URLS = mongoose.model("URLS", urlsSchema);

// Route to handle URL shortening
app.post("/", async (req, res) => {
  console.log("Received request to shorten URL:", req.body);

  const { url, mainURL, username } = req.body;

  // Validate incoming data
  if (!url || !mainURL || !username) {
    console.warn("Validation failed: Missing required fields");
    return res.status(400).send("Missing required fields");
  }

  try {
    // Check if the URL and username already exist
    const existingEntry = await URLS.findOne({ mainUrl: url, username });

    if (existingEntry) {
      console.warn(`Entry already exists: ${username} for ${url}`);
      return res.status(400).send("This username already exists for this URL.");
    }

    // Create a new entry for the URL
    const saveData = new URLS({
      mainUrl: url,
      username,
      shortURL: mainURL,
    });

    await saveData.save();
    console.log("URL saved successfully:", saveData);

    // Respond with the saved data including the shortURL
    res.status(201).send({
      message: "URL saved successfully!",
      data: saveData,
      shortURL: saveData.shortURL, // Include the short URL in the response
    });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send("Error saving URL.");
  }
});

// Serve the main HTML file
app.get("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Redirect from short URL to the main URL
app.get("/:shortURL", async (req, res) => {
  const { shortURL } = req.params; // Extract the shortURL from params
  console.log(`Redirect request for shortURL: ${shortURL}`);

  try {
    const urlData = await URLS.findOne({ shortURL });
    
    if (urlData) {
      console.log(`Redirecting to main URL: ${urlData.mainUrl}`);
      return res.redirect(urlData.mainUrl);
    } else {
      console.warn("Short URL not found:", shortURL);
      return res.status(404).send("Short URL not found.");
    }
  } catch (error) {
    console.error("Error finding short URL:", error);
    return res.status(500).send("Internal server error");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
