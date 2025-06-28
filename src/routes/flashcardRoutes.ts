import express from 'express';
import {
  updateFlashcard,
  addFlashcard,
  getFlashcards,
  getFlashcardsMostWrong,
  uploadCSV
} from '../controllers/flashcardController';
import { validateRequest } from '../middleware/errorHandler';
import { flashcardSchemas } from '../validationSchemas';

const router = express.Router();

// Middleware to log route access (optional)
router.use((req, res, next) => {
  console.log(`Flashcard Route: ${req.method} ${req.path}`);
  next();
});

// ============ FLASHCARD ROUTES ============

// Upload CSV file with validation
router.post(
  '/upload_csv',
  validateRequest(flashcardSchemas.csvUpload, 'body'),
  uploadCSV
);

// Get flashcards needing practice by category with validation
router.get(
  '/needpractice/:category',
  validateRequest(flashcardSchemas.category, 'params'),
  getFlashcardsMostWrong
);

// Add a new flashcard with validation
router.post(
  '/add',
  validateRequest(flashcardSchemas.create, 'body'),
  addFlashcard
);

// Get all flashcards with pagination validation
router.get(
  '/all',
  validateRequest(flashcardSchemas.pagination, 'query'),
  getFlashcards
);



// Update flashcard statistics with validation
router.put(
  '/update/:id',
  validateRequest(flashcardSchemas.id, 'params'),
  validateRequest(flashcardSchemas.updateStats, 'body'),
  updateFlashcard
);
export default router;
