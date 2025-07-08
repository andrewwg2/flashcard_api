import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
  spanishWord: string;
  englishWord: string;
  dateLastSeen?: Date;
  timesSeen: number;
  percentageCorrect: number;
  category?: string;
  favorite?: boolean;
  updateStats(isCorrect: boolean): void;
}

const FlashcardSchema: Schema = new Schema({
  spanishWord: { type: String, required: true },
  englishWord: { type: String, required: true },
  dateLastSeen: { type: Date, default: Date.now },
  timesSeen: { type: Number, default: 0 },
  percentageCorrect: { type: Number, default: 0.0 },
  category: { type: String, default: 'General' },
  favorite: { type: Boolean, default: false },
});

FlashcardSchema.methods.updateStats = function (isCorrect: boolean) {
  this.dateLastSeen = new Date();
  const numberCorrect = this.percentageCorrect * this.timesSeen;

  this.timesSeen += 1;

  if (isCorrect) {
    this.percentageCorrect = ((numberCorrect + 1) / this.timesSeen).toFixed(2);
  } else {
    this.percentageCorrect = (numberCorrect / this.timesSeen).toFixed(2);
  }
};

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
