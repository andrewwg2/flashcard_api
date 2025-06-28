import { createReadStream, existsSync } from 'fs';
import parse from 'csv-parser';
import Flashcard from './models/flashcardModel';
import dotenv from 'dotenv';

dotenv.config();

export async function createFlashcardsFromCSV(csvFilePath: string): Promise<void> {
  if (!csvFilePath || !existsSync(csvFilePath)) {
    console.error(`CSV file does not exist at path: ${csvFilePath}`);
  }

  let count = 0;
  const operations: Promise<void>[] = [];

  return new Promise((resolve, reject) => {
    const stream = createReadStream(csvFilePath)
      .on('error', (err) => {
        console.error('Stream error (file read issue):', err);
        reject(new Error('Unable to open CSV file. Make sure the path is correct.'));
      })
      .pipe(parse({ separator: ',' }))
      .on('data', (row) => {
        try {
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
              .catch(err => {
                console.error('Flashcard DB insert error:', err);
              });

            operations.push(operation);
          } else {
            console.warn('Invalid row (missing fields):', row);
          }
        } catch (err) {
          console.error('Unexpected row error:', err);
        }
      })
      .on('end', async () => {
        try {
          await Promise.all(operations);
          console.log(`${count} flashcards loaded from CSV`);
          resolve();
        } catch (err) {
          console.error('Error completing database operations:', err);
          reject(new Error('CSV processing failed during DB operations.'));
        }
      });
  });
}
