import { createReadStream, existsSync } from 'fs';
import parse from 'csv-parser';
import Flashcard from './models/flashcardModel';
import dotenv from 'dotenv';
import { ConsoleMessages, ErrorMessages, formatErrorMessage } from './constants/errorMessages';

dotenv.config();

export async function createFlashcardsFromCSV(csvFilePath: string): Promise<void> {
  if (!csvFilePath || !existsSync(csvFilePath)) {
    const errorConfig = ErrorMessages.csvFileNotFound(csvFilePath || 'undefined');
    console.error(errorConfig.message);
  }

  let count = 0;
  const operations: Promise<void>[] = [];

  return new Promise((resolve, reject) => {
    const stream = createReadStream(csvFilePath)
      .on('error', (err) => {
        console.error(ConsoleMessages.STREAM_ERROR + ':', err);
        const errorConfig = ErrorMessages.csvReadError();
        reject(new Error(errorConfig.message));
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
                console.error(ConsoleMessages.FLASHCARD_DB_INSERT_ERROR + ':', err);
              });

            operations.push(operation);
          } else {
            console.warn(ConsoleMessages.INVALID_ROW_WARNING + ':', row);
          }
        } catch (err) {
          console.error(ConsoleMessages.UNEXPECTED_ROW_ERROR + ':', err);
        }
      })
      .on('end', async () => {
        try {
          await Promise.all(operations);
          console.log(formatErrorMessage(ConsoleMessages.FLASHCARDS_LOADED_FROM_CSV, { count }));
          resolve();
        } catch (err) {
          console.error(ConsoleMessages.ERROR_COMPLETING_DB_OPERATIONS + ':', err);
          const errorConfig = ErrorMessages.csvDbOperationsFailed();
          reject(new Error(errorConfig.message));
        }
      });
  });
}
