import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { TranslationModel } from './translation-model';

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/translations');

// Parse JSON requests
app.use(express.json());
app.use(express.static("public"))

// Translation API endpoint
app.get('/api/translate', async (req: Request, res: Response) => {
  const { query, source_language, destination_language } = req.query;

  // Check if translation exists in the database
  const existingTranslation = await TranslationModel.findOne({
    query,
    source_language,
    destination_language,
  });

  if (existingTranslation) {
    return res.json({ translation: existingTranslation.translated_text });
  }

  // If not found in the database, use Google Translate API
  try {
    const response = await axios.get('https://google-translate1.p.rapidapi.com/language/translate/v2', {
      params: {
        source: source_language,
        target: destination_language,
        q: query,
      },
      headers: {
        'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_API_KEY',
      },
    });

    const translatedText = response.data.data.translations[0].translatedText;

    // Save the translation in the database for future use
    const newTranslation = new TranslationModel({
      query,
      source_language,
      destination_language,
      translated_text: translatedText,
    });
    await newTranslation.save();

    res.json({ translation: translatedText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
