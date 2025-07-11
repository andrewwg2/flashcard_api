# Documentation Index

Welcome to the Flashcard API documentation. This directory contains comprehensive guides covering all aspects of the API, from basic usage to advanced maintenance and testing.

## Available Documentation

### Core Documentation
- **[Main README](../README.md)** - Project overview, setup, and basic usage
- **[API Reference](../src/API_Doc.yaml)** - Complete OpenAPI specification

### Feature Guides
- **[Error Handling System](ERROR_HANDLING.md)** - Centralized error management and best practices
- **[Testing Guide](TESTING.md)** - Test architecture, running tests, and writing new tests
- **[Maintenance Tasks](MAINTENANCE.md)** - Deduplication and data cleanup operations

### Technical References
- **[Test Factories](../_tests_/factories/README.md)** - Test data generation and utilities
- **[Error Messages Reference](../src/constants/README.md)** - Centralized error messages system
- **[Database Testing Setup](../_tests_/IN_MEMORY_DATABASE_SETUP.md)** - In-memory database configuration

## Quick Start

1. **New to the project?** Start with the [Main README](../README.md)
2. **Setting up development?** Check the [Testing Guide](TESTING.md)
3. **Need to handle errors?** See the [Error Handling System](ERROR_HANDLING.md)
4. **Running maintenance?** Read the [Maintenance Tasks](MAINTENANCE.md)

## Documentation Structure

```
docs/
├── README.md              # This index file
├── ERROR_HANDLING.md      # Error system documentation
├── TESTING.md            # Testing guide and best practices
└── MAINTENANCE.md        # Maintenance tasks and operations

Related Documentation:
├── src/API_Doc.yaml      # OpenAPI specification
├── src/constants/README.md # Error messages reference
└── _tests_/factories/README.md # Test utilities
```

## API Overview

The Flashcard API provides the following core functionality:

### Endpoints Summary
| Category | Endpoints | Documentation |
|----------|-----------|---------------|
| **CRUD Operations** | `POST /add`, `GET /all`, `PUT /update/:id` | [Main README](../README.md#api-endpoints) |
| **Learning Features** | `GET /practice/:category`, `PUT /favorite/:id` | [Main README](../README.md#api-usage-examples) |
| **Data Management** | `POST /upload_csv` | [Main README](../README.md#csv-upload-format) |
| **Maintenance** | `POST /maintenance/deduplicate` | [Maintenance Tasks](MAINTENANCE.md) |

### Key Features
- **Performance Tracking**: Monitor learning progress with statistics
- **Favorites System**: Mark important flashcards for easy access
- **Category Organization**: Group flashcards by topic or difficulty
- **CSV Import/Export**: Bulk data operations
- **Deduplication**: Automated cleanup of duplicate entries
- **Comprehensive Testing**: Full test coverage with factories and helpers

## Development Workflow

### For New Developers
1. Read the [Main README](../README.md) for project setup
2. Review the [Testing Guide](TESTING.md) for development practices
3. Understand the [Error Handling System](ERROR_HANDLING.md) for consistent error management
4. Check the [API Reference](../src/API_Doc.yaml) for endpoint specifications

### For Maintenance Operations
1. Review [Maintenance Tasks](MAINTENANCE.md) for available operations
2. Understand deduplication logic and best practices
3. Set up monitoring and scheduling as needed

### For Testing
1. Follow the [Testing Guide](TESTING.md) for writing and running tests
2. Use [Test Factories](../_tests_/factories/README.md) for consistent test data
3. Reference [Error Messages](../src/constants/README.md) for test assertions

## Finding Information

### By Topic
- **Setup & Installation**: [Main README](../README.md#getting-started)
- **API Usage**: [Main README](../README.md#api-usage-examples)
- **Error Handling**: [Error Handling System](ERROR_HANDLING.md)
- **Testing**: [Testing Guide](TESTING.md)
- **Maintenance**: [Maintenance Tasks](MAINTENANCE.md)
- **Data Models**: [Main README](../README.md#data-model)

### By File Type
- **Markdown Documentation**: This `docs/` directory
- **API Specification**: `src/API_Doc.yaml`
- **Code Documentation**: Inline comments in `src/` files
- **Test Documentation**: `_tests_/` directory READMEs

## Advanced Topics

### Architecture
The API follows a layered architecture:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Models**: Define data structures and database schemas
- **DTOs**: Manage data transfer between layers
- **Middleware**: Handle cross-cutting concerns (errors, validation)

### Error Management
The centralized error system provides:
- Consistent error codes and messages
- Type-safe error handling
- Test integration
- Detailed error responses

### Testing Strategy
The test suite includes:
- Integration tests for API endpoints
- Unit tests for business logic
- Error scenario testing
- Performance and load testing capabilities

## Contributing

When contributing to the project:

1. **Read the Documentation**: Understand the existing architecture and patterns
2. **Follow Testing Practices**: Write tests for new functionality
3. **Use Error System**: Leverage centralized error handling
4. **Update Documentation**: Keep documentation current with changes
5. **Review Guidelines**: Follow the established coding standards

## Documentation Updates

This documentation is maintained alongside the codebase. When making changes:

- Update relevant documentation files
- Keep examples current with API changes
- Maintain consistency across all documentation
- Test documentation examples to ensure accuracy

---

*Last updated: July 2025*
*For the most current information, always refer to the latest version in the repository.*
