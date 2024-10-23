const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve static files from the public directory

// MongoDB connection
mongoose
  .connect(process.env.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
// Route to handle URL shortening
app.post("/", async (req, res) => {
  const { url, mainURL, username } = req.body;

  // Validate incoming data
  if (!url || !mainURL || !username) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Check if the URL and username already exist
    const existingEntry = await URLS.findOne({ mainUrl: url, username });

    if (existingEntry) {
      return res.status(400).send("This username already exists for this URL.");
    }

    // Create a new entry for the URL
    const saveData = new URLS({
      mainUrl: url,
      username,
      shortURL: mainURL,
    });

    await saveData.save();

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
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Redirect from short URL to the main URL
app.get("/:shortURL", async (req, res) => {
  const { shortURL } = req.params; // Extract the shortURL from params
  const urlData = await URLS.findOne({ shortURL });
  if (urlData) {
    // Check if urlData is found
    res.redirect(urlData.mainUrl);
  } else {
    res.status(404).send("Short URL not found.");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
