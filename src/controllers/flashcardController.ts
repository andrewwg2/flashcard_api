import { Request, Response } from 'express';
import { flashcardService } from '../services/flashcardService';

// Update a flashcard
export const updateFlashcard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isCorrect } = req.body;

  try {
    const flashcard = await flashcardService.updateFlashcardStats(id, isCorrect);

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    res.status(200).json(flashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
};

// Add a new flashcard
export const addFlashcard = async (req: Request, res: Response) => {
  const { spanishWord, englishWord, category } = req.body;

  try {
    const newFlashcard = await flashcardService.createFlashcard(
      spanishWord,
      englishWord,
      category
    );
    
    res.status(201).json(newFlashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add flashcard' });
  }
};

// Get all flashcards with optional pagination
export const getFlashcards = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };

  try {
    const result = await flashcardService.getFlashcardsWithPagination(options);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get flashcards' });
  }
};

// Get flashcards with percentageCorrect less than 50% in a specific category
export const getFlashcardsMostWrong = async (req: Request, res: Response) => {
  const { category } = req.params;

  try {
    const flashcards = await flashcardService.getFlashcardsNeedingPractice(category);

    if (flashcards.length === 0) {
      return res.status(404).json({ 
        error: 'No flashcards found with the specified category and percentageCorrect' 
      });
    }

    res.status(200).json(flashcards);
  } catch (error) {
    // Handle specific Mongoose errors for better clarity
    if (flashcardService.isMongooseCastError(error)) {
      return res.status(400).json({ error: 'Invalid query parameter format' });
    }

    res.status(500).json({ error: 'Failed to get flashcards' });
  }
};

export const uploadCSV = async (req: Request, res: Response) => {
  const csvFilePath = req.body.csvFilePath; // Assuming the file path is sent in the request body

  try {
    await flashcardService.processCSVUpload(csvFilePath);
    res.status(200).json({ message: 'CSV file processed successfully' });
  } catch (error) {
    console.error('Error processing CSV file:', csvFilePath);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
};
