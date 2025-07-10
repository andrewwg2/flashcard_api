import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Flashcard from '../../src/models/flashcardModel';

export class TestDatabase {
  private static mongoServer: MongoMemoryServer;

  static async connect(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
      // Create an in-memory MongoDB instance
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();
      
      await mongoose.connect(mongoUri);
    }
  }

  static async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    if (this.mongoServer) {
      await this.mongoServer.stop();
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
