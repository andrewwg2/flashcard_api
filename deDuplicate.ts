import mongoose, { Connection, Document } from 'mongoose';
import { IFlashcard } from './src/models/flashcardModel';

const uri = 'mongodb+srv://coreDAuser:coreDAuser@cluster0.8ijfxmq.mongodb.net/';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connect = async () => {
  const conn = await mongoose.connect(uri);
  return conn.connection;
};

const cleanDuplicates = async () => {
  const connection: Connection = await connect();

  const FlashcardModel = connection.model<IFlashcard>('Flashcard', new mongoose.Schema({}));

  const duplicates = await FlashcardModel.aggregate([
    {
      $group: {
        _id: '$spanishWord',
        duplicates: { $push: '$$ROOT' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  for (const duplicateGroup of duplicates) {
    const recordsToKeep: Document[] = [];
    const recordsToDelete: Document[] = [];

    for (const record of duplicateGroup.duplicates) {
      if (record.percentageCorrect) {
        recordsToKeep.push(record);
      } else {
        recordsToDelete.push(record);
      }
    }

    for (const record of recordsToDelete) {
      await FlashcardModel.findByIdAndDelete(record._id);
    }
  }

  const allEntries = await FlashcardModel.find();
  console.log(allEntries);

  await connection.close();
};

cleanDuplicates().catch((err) => {
  console.error(err);
  process.exit(1);
});