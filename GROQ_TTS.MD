# Groq STT + TTS + Chatbot Setup Guide

A Node.js + Express chatbot that uses Groq's Whisper for speech-to-text, LLM for chat, and Orpheus for text-to-speech.

---

## Stack

- **Runtime**: Node.js (ESM, `"type": "module"`)
- **Server**: Express
- **File uploads**: multer v2.x
- **Groq SDK**: `groq-sdk` (must be latest — older versions lack `audio.speech`)
- **Models used**:
  - STT: `whisper-large-v3-turbo`
  - Chat: `openai/gpt-oss-120b`
  - TTS: `canopylabs/orpheus-v1-english` (voice: `diana`)

---

## 1. Project structure

```
your-project/
├── public/
│   └── index.html        # Frontend UI
├── uploads/              # Temp folder for audio files (create manually)
├── server.js             # Express backend
├── package.json
└── .env
```

---

## 2. package.json

```json
{
  "name": "your-project",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "groq-sdk": "latest",
    "multer": "latest"
  }
}
```

> ⚠️ Use `groq-sdk@latest` — version `0.7.0` does NOT have `audio.speech`.  
> ⚠️ Use `multer@latest` (v2.x) — v1.x has known vulnerabilities and a different API.

---

## 3. Install dependencies

```bash
npm install
```

---

## 4. .env

```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

Get your key at: https://console.groq.com/keys

---

## 5. server.js

```js
import express from "express";
import { diskStorage } from "multer";
import multer from "multer";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// multer v2.x requires diskStorage — no default export constructor
const storage = diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// POST /api/transcribe — audio blob → transcript
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file received" });

  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-large-v3-turbo",
      response_format: "json",
    });

    fs.unlinkSync(req.file.path);
    res.json({ transcript: transcription.text });
  } catch (err) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat — message history → assistant reply
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are a helpful, friendly assistant. Keep replies concise and conversational." },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/speak — text → WAV audio buffer
app.post("/api/speak", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  try {
    const response = await groq.audio.speech.create({
      model: "canopylabs/orpheus-v1-english",
      voice: "diana", // options: autumn diana hannah austin daniel troy
      input: text,
      response_format: "wav",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.set("Content-Type", "audio/wav");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
```

---

## 6. Create the uploads folder

```bash
mkdir uploads
```

---

## 7. Accept Orpheus model terms (one-time)

Before TTS will work, you must accept the model's terms of service:

👉 https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english

Click **Accept** on that page. Only needs to be done once per Groq org/account.

---

## 8. Run

```bash
npm start
# → Server running at http://localhost:3000
```

---

## Common errors & fixes

| Error | Cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading 'create')` on `audio.speech` | groq-sdk too old (≤0.7.0) | `npm install groq-sdk@latest` |
| `model_decommissioned` on `playai-tts` | Model retired Dec 2025 | Use `canopylabs/orpheus-v1-english` |
| `model_terms_required` on Orpheus | Terms not accepted | Accept at the link in step 7 |
| `voice must be one of...` | Wrong voice name | Use: `autumn diana hannah austin daniel troy` |
| `EADDRINUSE :::3000` | Old server still running | `npx kill-port 3000` then restart |
| multer `upload is not a function` | multer v2.x breaking change | Use `diskStorage` named export (see server.js above) |
| `llama-3.3-70b-versatile` deprecated (Aug 2026) | Model retired | Use `openai/gpt-oss-120b` |

---

## Available Orpheus voices

`autumn` · `diana` · `hannah` · `austin` · `daniel` · `troy`
