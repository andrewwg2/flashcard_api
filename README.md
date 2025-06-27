# Flashcard API

A RESTful API for managing flashcards and study decks. This project provides endpoints to create, read, update, and delete flashcards organized by topic or subject.

---

## Features

* CRUD operations for flashcards and decks
* Deck-based organization of flashcards
* Optional expansion to include:

  * User authentication (e.g., JWT)
  * Deck sharing and tagging
  * Search and filtering
  * Study progress tracking

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/andrewwg2/flashcard_api.git
cd flashcard_api
```

### 2. Install Dependencies

If using Node.js:

```bash
npm install
```

If using Python:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file or adjust `config.js` / `settings.py` as appropriate:

```
DATABASE_URL=your_database_url
PORT=3000
JWT_SECRET=your_secret_key
```

### 4. Run Migrations (if applicable)

```bash
npm run migrate
# or
python manage.py migrate
```

### 5. Start the Server

```bash
npm start
# or
uvicorn app:app --reload
```

---

## API Endpoints

| Endpoint                | Method | Description              |
| ----------------------- | ------ | ------------------------ |
| `/decks`                | GET    | List all flashcard decks |
| `/decks`                | POST   | Create a new deck        |
| `/decks/{deckId}`       | GET    | Get a specific deck      |
| `/decks/{deckId}`       | PUT    | Update deck information  |
| `/decks/{deckId}`       | DELETE | Delete a deck            |
| `/decks/{deckId}/cards` | GET    | List all cards in a deck |
| `/decks/{deckId}/cards` | POST   | Add a card to a deck     |
| `/cards/{cardId}`       | GET    | Get a specific card      |
| `/cards/{cardId}`       | PUT    | Update a card            |
| `/cards/{cardId}`       | DELETE | Delete a card            |

*(Adjust endpoints and parameters to match your implementation)*

---

## Testing

To run tests:

```bash
npm test
# or
pytest
```

You can also test endpoints using Postman, Insomnia, or curl.

---

## Roadmap

* Implement user authentication
* Add spaced repetition algorithm
* Integrate optional multimedia support (images, audio)
* Track study history and usage analytics
* Deploy to a public cloud platform (e.g., Heroku, Vercel)

---

## License

This project is licensed under the MIT License.

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request to propose changes or new features.
