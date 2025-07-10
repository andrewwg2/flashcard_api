import mongoose from 'mongoose';
import Flashcard from '../../src/models/flashcardModel';

export class TestDatabase {
  static async connect(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }
  }

  static async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }

  static async clearDatabase(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await Flashcard.deleteMany({});
    }
  }

  static async dropDatabase(): Promise<void> {
    if (mongoose.connection.readyState !== 0 && mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  }

  static getConnectionState(): number {
    return mongoose.connection.readyState;
  }
}
