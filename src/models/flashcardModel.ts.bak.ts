import mongoose, { Schema, Document } from 'mongoose';

interface IFlashcard extends Document {
  spanishWord: string;
  englishWord: string;
  dateLastSeen?: Date;
  timesSeen: number;
  percentageCorrect: number;
  category?: string;
  updateStats(isCorrect: boolean): void;
}

const FlashcardSchema: Schema = new Schema({
  spanishWord: { type: String, required: true },
  englishWord: { type: String, required: true },
  dateLastSeen: { type: Date, default: Date.now },
  timesSeen: { type: Number, default: 0 },
  percentageCorrect: { type: Number, default: 0.0 },
  category: { type: String, default: 'General' },
});

FlashcardSchema.methods.updateStats = function (inputCorrect: boolean) {
  let isCorrect: boolean = false; 
  if (inputCorrect.toString() === 'true')
  {
    isCorrect = true;
  }
  
  this.dateLastSeen = new Date();
  var numberCorrect = this.percentageCorrect * this.timesSeen;
  
  this.timesSeen += 1;
  
  this.percentageCorrect = isCorrect
    ? ((numberCorrect + 1) / this.timesSeen).toFixed(2)
    : (numberCorrect / this.timesSeen).toFixed(2);
    
};

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);