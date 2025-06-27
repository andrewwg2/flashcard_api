import { Request, Response } from 'express';
import Flashcard from '../models/flashcardModel';

// Update a flashcard
export const updateFlashcard = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isCorrect } = req.body;
    
  try {
    const flashcard = await Flashcard.findById(id);

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    flashcard.timesSeen += 1;
    var numberCorrect = flashcard.percentageCorrect * flashcard.timesSeen;
    if (isCorrect) 
    {
      flashcard.percentageCorrect = numberCorrect + 1/ flashcard.timesSeen;
    }
    else
    {
      flashcard.percentageCorrect = numberCorrect/ flashcard.timesSeen;
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
  console.log("Created");
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



// Get flashcards with percentageCorrect less than 50% in a specific category
export const getFlashcardsMostWrong = async (req: Request, res: Response) => {
  const { category } = req.params;
  let flashcards = [];
  try {
    if (category !== "All") 
      {
      flashcards = await Flashcard.find({
      category: category,
      percentageCorrect: { $lt: 1.0 }
      });
    }
    else {
        flashcards = await Flashcard.find({
        category: category,
        percentageCorrect: { $lt: 1.0 }
        });
    }

    if (flashcards.length === 0) {
      return res.status(404).json({ error: 'No flashcards found with the specified category and percentageCorrect' });
    }

    res.status(200).json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get flashcards' });
  }
};