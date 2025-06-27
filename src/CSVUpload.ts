import { createReadStream } from 'fs';
import parse from 'csv-parser';

import Flashcard from './models/flashcardModel'; // Import your Flashcard model
import dotenv from 'dotenv';
dotenv.config();


export async function createFlashcardsFromCSV(csvFilePath: string): Promise<void> {
  let count = 0;
  let operations: any[] = []; // Array to hold all async operations

  return new Promise((resolve, reject) => {
    createReadStream(csvFilePath)
      .pipe(parse({ separator: ',' }))
      .on('data', (row) => {
        const { spanishword, englishword } = row;

        if (spanishword && englishword) {
          const operation = Flashcard.findOne({ spanishWord: spanishword.trim() })
            .then(existingFlashcard => {
              if (!existingFlashcard) {
                const newFlashcard = new Flashcard({
                  spanishWord: spanishword.trim(),
                  englishWord: englishword.trim(),
                  category: 'unassigned',
                });
                return newFlashcard.save().then(() => {
                  count++;
                });
              }
            })
            .catch(error => {
              console.error('Error creating flashcard:', error);
            });

          operations.push(operation);
        }
      })
      .on('end', async () => {
        try {
          await Promise.all(operations); // Wait for all operations to complete
          console.log(`${count} words successfully loaded`);
          resolve();
        } catch (error) {
          console.error('Error processing CSV file:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error processing CSV file:', error);
        reject(error);
      });
  });
}

