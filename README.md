# Flashcard API

This project provides a RESTful API for managing flashcards used in language learning or other memorization-based study systems. It supports creating, retrieving, updating, and tracking statistics for each flashcard. It also allows uploading flashcards via CSV.

---

## Features

* Add new flashcards with Spanish and English translations
* Track performance statistics:

  * Times seen
  * Percentage correct
  * Last seen date
* Filter flashcards needing more practice (percentage correct < 50%)
* Upload flashcards from a CSV file
* Pagination-ready flashcard retrieval (manually controlled)
* CORS-enabled for integration with a React frontend

---

## Technologies

* Node.js + Express
* TypeScript
* MongoDB + Mongoose
* CSV file handling via `csv-parser`
* dotenv for environment configuration
* CORS support

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<USERNAME>/flashcard_api.git
cd flashcard_api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

In the root of the project, create a file named `.env` with the following contents:

```
MONGO_URI=<YOUR_MONGO_CONNECTION_STRING>
PORT=5000
```

Update the `MONGO_URI` if you're using a remote MongoDB or Atlas instance.

### 4. Start the server

```bash
npm run dev
```

---

## API Endpoints

All endpoints are prefixed with `/api/flashcards`.

| Method | Endpoint                  | Description                                                              |
| ------ | ------------------------- | ------------------------------------------------------------------------ |
| POST   | `/upload_csv`             | Upload and import flashcards from a CSV file (server-side path required) |
| GET    | `/needpractice/:category` | Get flashcards with <50% correct in the given category (`All` for all)   |
| POST   | `/add`                    | Add a new flashcard                                                      |
| GET    | `/all`                    | Get all flashcards                                                       |
| PUT    | `/update/:id`             | Update stats for a flashcard (requires `{ isCorrect: boolean }` in body) |

---

## CSV Upload Format

Your CSV file should contain the following headers (case-sensitive):

```csv
spanishword,englishword
gato,cat
perro,dog
```

Send the file path as JSON:

```json
{
  "csvFilePath": "./path/to/flashcards.csv"
}
```

Example `curl`:

```bash
curl -X POST http://localhost:5000/api/flashcards/upload_csv \
  -H "Content-Type: application/json" \
  -d '{"csvFilePath": "./data/flashcards.csv"}'
```

---

## Flashcard Data Model

Each flashcard tracks performance over time:

```ts
{
  spanishWord: string,
  englishWord: string,
  category: string, // default = "General"
  dateLastSeen: Date,
  timesSeen: number,
  percentageCorrect: number
}
```

---

## Example Usage (cURL)

### Add a flashcard

```bash
curl -X POST http://localhost:5000/api/flashcards/add \
  -H "Content-Type: application/json" \
  -d '{"spanishWord": "casa", "englishWord": "house", "category": "home"}'
```

### Update flashcard stats

```bash
curl -X PUT http://localhost:5000/api/flashcards/update/<id> \
  -H "Content-Type: application/json" \
  -d '{"isCorrect": true}'
```

---

## License

MIT ©

