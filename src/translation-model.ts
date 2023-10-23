import { Document, Schema, model } from 'mongoose';

interface ITranslation extends Document {
  query: string;
  source_language: string;
  destination_language: string;
  translated_text: string;
}

const translationSchema = new Schema<ITranslation>({
  query: { type: String, required: true },
  source_language: { type: String, required: true },
  destination_language: { type: String, required: true },
  translated_text: { type: String, required: true },
});

export const TranslationModel = model<ITranslation>('Translation', translationSchema);
