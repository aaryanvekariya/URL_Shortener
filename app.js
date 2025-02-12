// Import required modules
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const ShortUniqueId = require("short-unique-id");
const path = require("path");

// Initialize express app
const app = express();
const uid = new ShortUniqueId({ length: 6 });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const URLSchema = new mongoose.Schema({
  shortId: String,
  longUrl: String,
});

const URL = mongoose.model("URL", URLSchema);

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Home Route
app.get("/", async (req, res) => {
  const urls = await URL.find();
  res.render("index", { urls });
});

// Handle URL Shortening
app.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;
  const shortId = uid();
  await URL.create({ shortId, longUrl });
  res.redirect("/");
});

// Redirect to Original URL
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const entry = await URL.findOne({ shortId });
  if (entry) {
    res.redirect(entry.longUrl);
  } else {
    res.status(404).send("URL not found");
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));