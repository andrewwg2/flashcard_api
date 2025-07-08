//flashcardRoutes.ts
import express from 'express';
import * as flashcardController from '../controllers/flashcardController';
import { validateDto, validateQueryDto, validateParamsDto, createFlashcardSchema, updateParamsSchema, updateBodySchema, flashcardQuerySchema } from '../validationSchemas';

const router = express.Router();

// Apply DTO validation middleware
router.post('/add', validateDto(createFlashcardSchema), flashcardController.addFlashcard);
router.put(
  '/update/:id',
  validateParamsDto(updateParamsSchema),  // ✅ validate `req.params`
  validateDto(updateBodySchema),          // ✅ validate `req.body`
  flashcardController.updateFlashcard
);
router.get('/all', validateQueryDto(flashcardQuerySchema), flashcardController.getFlashcards);
router.get('/practice/:category', flashcardController.getFlashcardsMostWrong);
router.post('/upload_csv', flashcardController.uploadCSV);
router.put(
  '/favorite/:id',
  validateParamsDto(updateParamsSchema),  // ✅ validate `req.params`
  validateDto(updateBodySchema),          // ✅ validate `req.body`
  flashcardController.toggleFavorite
);

// Maintenance endpoints
router.post('/maintenance/deduplicate', flashcardController.deDuplicateFlashcards);

export default router;
