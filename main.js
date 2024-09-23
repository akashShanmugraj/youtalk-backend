import express from "express";
import multer from "multer";
import path from "path";
import bodyParser from "body-parser";
import { SpeechClient } from "@google-cloud/speech";
import fs from "fs";
import { fileURLToPath } from "url";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const prompt = "Write a story about a magic backpack.";
// const result = await model.generateContent(prompt);

console.log(result.response.text());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to avoid name conflicts
  },
});

const upload = multer({ storage });

const speechClient = new SpeechClient();

app.get("/hello", (req, res) => {
  res.send("hello back to you!");
});

app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, "uploads", req.file.filename);
    const audioBytes = fs.readFileSync(filePath).toString("base64");

    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: "LINEAR16", // Adjust based on your audio file format
        sampleRateHertz: 16000, // Adjust based on your audio file sample rate
        languageCode: "en-US",
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    res.json({ transcription });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.get("/summarise", (req, res) => {
  const prompt =
    "Can you get a list of to-dos from the following speech extract?\n\n" +
    req.body.prompt;
  const result = model.generateContent(prompt);
  res.json({ result });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
