import { Request, Response } from 'express';
import Flashcard from '../models/flashcardModel';
import mongoose from 'mongoose';
import { createFlashcardsFromCSV } from '../CSVUpload';

// Update a flashcard
export const updateFlashcard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isCorrect } = req.body;

  try {
    const flashcard = await Flashcard.findById(id);

    if (!flashcard) {
      return res.status(500).json({ error: 'Failed to update flashcard' });
    }

    flashcard.updateStats(isCorrect);
    await flashcard.save();

    res.status(200).json(flashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
};

// Add a new flashcard
export const addFlashcard = async (req: Request, res: Response) => {
  const { spanishWord, englishWord, category } = req.body;

  try {
    const newFlashcard = new Flashcard({
      spanishWord,
      englishWord,
      category,
    });

    await newFlashcard.save();
    res.status(201).json(newFlashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add flashcard' });
  }
};

// Get all flashcards with optional pagination
// Get all flashcards with optional pagination
export const getFlashcards = async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 if not provided

  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };

  try {
    const flashcards = await Flashcard.find()
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    // Optionally, you can also return the total count of flashcards for frontend pagination controls
    const totalFlashcards = await Flashcard.countDocuments();
    const totalPages = Math.ceil(totalFlashcards / options.limit);

    res.status(200).json({
      flashcards,
      pagination: {
        currentPage: options.page,
        totalPages,
        totalFlashcards,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get flashcards' });
  }
};
// Get flashcards with percentageCorrect less than 50% in a specific category
export const getFlashcardsMostWrong = async (req: Request, res: Response) => {
  const { category } = req.params;

  // Explicitly typing the query object
  let query: { percentageCorrect: { $lt: number }; category?: string } = {
    percentageCorrect: { $lt: 0.5 },
  };

  // If category is not "All", add the category to the query
  if (category !== "All") {
    query.category = category;
  }

  try {
    const flashcards = await Flashcard.find(query);

    if (flashcards.length === 0) {
      return res.status(404).json({ error: 'No flashcards found with the specified category and percentageCorrect' });
    }

    res.status(200).json(flashcards);
  } catch (error) {
      // Handle specific Mongoose errors for better clarity
      if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: 'Invalid query parameter format' });
      }
  
    res.status(500).json({ error: 'Failed to get flashcards' });
  }
};


export const uploadCSV = async (req: Request, res: Response) => {
  const csvFilePath = req.body.csvFilePath; // Assuming the file path is sent in the request body
 
  try {
    await createFlashcardsFromCSV(csvFilePath);
    res.status(200).json({ message: 'CSV file processed successfully' });
  } catch (error) {
    console.error('Error processing CSV file:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
};