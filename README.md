# Flashcard API

A comprehensive RESTful API for managing flashcards used in language learning and memorization-based study systems. Built with Node.js, TypeScript, Express, and MongoDB, featuring advanced functionality like performance tracking, favorites, deduplication, and comprehensive error handling.

---

## Features

### Core Functionality
- **CRUD Operations**: Create, read, update, and delete flashcards
- **Performance Tracking**: Track times seen, percentage correct, and last seen date
- **Category Management**: Organize flashcards by categories
- **Practice Mode**: Filter flashcards needing more practice (< 50% correct)
- **Favorites System**: Mark important flashcards as favorites
- **CSV Import**: Bulk upload flashcards from CSV files

### Advanced Features
- **Deduplication**: Automated removal of duplicate flashcards
- **Pagination**: Efficient data retrieval with pagination support
- **Centralized Error Handling**: Consistent error messages and codes
- **Comprehensive Testing**: Full test suite with in-memory database
- **Type Safety**: Full TypeScript implementation with DTOs
- **API Documentation**: OpenAPI/Swagger specification

---

## Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with CORS support
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi schema validation
- **Testing**: Jest with Supertest and MongoDB Memory Server
- **File Processing**: CSV parsing with csv-parser
- **Environment**: dotenv for configuration

---

##  API Endpoints

The below endpoints are prefixed with `/api/flashcards`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/add` | Add a new flashcard |
| **GET** | `/all` | Get all flashcards (with pagination) |
| **PUT** | `/update/:id` | Update flashcard performance stats |
| **GET** | `/practice/:category` | Get flashcards needing practice in category |
| **PUT** | `/favorite/:id` | Toggle favorite status of a flashcard |
| **POST** | `/upload_csv` | Upload flashcards from CSV file |
| **POST** | `/maintenance/deduplicate` | Remove duplicate flashcards |

---

The below endpoint has no prefexied:

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/health` | Retreive current status of the API |


## Project Structure

```
flashcard_api/
├── src/
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── dto/                # Data Transfer Objects
│   ├── middleware/         # Error handling & validation
│   ├── constants/          # Error messages & constants
│   └── validationSchemas.ts # Joi validation schemas
├── _tests_/                # Test suite
│   ├── factories/          # Test data factories
│   ├── helpers/            # Test utilities
│   └── constants/          # Test error messages
└── docs/                   # Documentation (see below)
```

---

##  Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<username>/flashcard_api.git
   cd flashcard_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/flashcards
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Run tests**
   ```bash
   npm test
   ```

---

## Data Model

### Flashcard Schema
```typescript
{
  spanishWord: string;        // Spanish word/phrase
  englishWord: string;        // English translation
  category: string;           // Category (default: "General")
  dateLastSeen: Date;         // Last practice date
  timesSeen: number;          // Practice count
  percentageCorrect: number;  // Success rate (0-1)
  favorite: boolean;          // Favorite status
}
```

---

## API Usage Examples

### Add a Flashcard
```bash
curl -X POST http://localhost:5000/api/flashcards/add \
  -H "Content-Type: application/json" \
  -d '{
    "spanishWord": "hola",
    "englishWord": "hello",
    "category": "greetings"
  }'
```

### Update Performance Stats
```bash
curl -X PUT http://localhost:5000/api/flashcards/update/{id} \
  -H "Content-Type: application/json" \
  -d '{"isCorrect": true}'
```

### Toggle Favorite Status
```bash
curl -X PUT http://localhost:5000/api/flashcards/favorite/{id} \
  -H "Content-Type: application/json" \
  -d '{"favorite": true}'
```

### Get Flashcards Needing Practice
```bash
curl http://localhost:5000/api/flashcards/practice/verbs
```

### CSV Upload
```bash
curl -X POST http://localhost:5000/api/flashcards/upload_csv \
  -H "Content-Type: application/json" \
  -d '{"csvFilePath": "./FlashCard_Load.csv"}'
```

**CSV Format:**
```csv
spanishword,englishword
gato,cat
perro,dog
casa,house
```

---

## Testing

The project includes a comprehensive test suite with:

- **Unit Tests**: Service and controller testing
- **Integration Tests**: Full API endpoint testing
- **In-Memory Database**: Fast, isolated test execution
- **Test Factories**: Consistent test data generation
- **Error Testing**: Comprehensive error scenario coverage

```bash
# Run all tests
npm test

# Run specific test file
npx jest flashcardController.test.ts

# Run tests with coverage
npm test -- --coverage
```

---

## Documentation

Detailed documentation is available in the `docs/` directory:

- **[Error Handling System](docs/ERROR_HANDLING.md)** - Centralized error management
- **[Testing Guide](docs/TESTING.md)** - Test setup and best practices  
- **[Maintenance Tasks](docs/MAINTENANCE.md)** - Deduplication and other maintenance
- **[API Reference](src/API_Doc.yaml)** - OpenAPI specification

---

## Maintenance Features

### Deduplication
Remove duplicate flashcards while preserving data integrity:

```bash
curl -X POST http://localhost:5000/api/flashcards/maintenance/deduplicate
```

The system intelligently:
- Identifies duplicates by `spanishWord`
- Preserves records with performance data
- Removes empty duplicates
- Returns detailed statistics

---

## 🚦 Error Handling

The API features a centralized error handling system with:

- **Consistent Error Codes**: Unique codes for each error type
- **Structured Responses**: Standardized error response format
- **Detailed Messages**: Clear, actionable error descriptions
- **HTTP Status Codes**: Proper status code usage
- **Validation Errors**: Comprehensive input validation

Example error response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_001",
    "message": "englishWord is required",
    "statusCode": 400
  }
}
```

---

## Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Testing**: Write tests for new functionality
3. **Validation**: Ensure all tests pass
4. **Documentation**: Update relevant documentation
5. **Code Review**: Submit pull requests for review

---

## Performance Features

- **Pagination**: Efficient data retrieval for large datasets
- **Indexing**: Optimized database queries
- **In-Memory Testing**: Fast test execution
- **Connection Pooling**: Efficient database connections
- **Error Caching**: Centralized error message management

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Links

- **Repository**: [https://github.com/andrewwg2/flashcard_api](https://github.com/andrewwg2/flashcard_api)
- **API Documentation**: [src/API_Doc.yaml](src/API_Doc.yaml)
- **Issues**: [GitHub Issues](https://github.com/andrewwg2/flashcard_api/issues)

---
