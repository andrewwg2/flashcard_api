
import express from 'express';
import { updateFlashcard, addFlashcard, getFlashcards, getFlashcardsMostWrong, uploadCSV } from '../controllers/flashcardController';





const router = express.Router();


router.post('/upload_csv', uploadCSV);

router.get('/needpractice/:category', getFlashcardsMostWrong);
// Route to add a new flashcard
router.post('/add', addFlashcard);

// Route to get all flashcards
router.get('/all', getFlashcards);

router.put('/update/:id', updateFlashcard);


export default router;
