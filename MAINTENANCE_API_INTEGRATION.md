# Maintenance API Integration - deDuplicate Functionality

## Overview

The standalone `deDuplicate.ts` script has been successfully integrated into the API as a maintenance task endpoint. This allows you to run the deduplication process through HTTP requests instead of running it as a standalone script.

## Integration Summary

### Files Modified/Created

1. **Service Layer** (`src/services/flashcardService.ts`)
   - Added `deDuplicateFlashcards()` method
   - Implements the same logic as the original standalone script
   - Returns detailed statistics about the deduplication process

2. **Controller Layer** (`src/controllers/flashcardController.ts`)
   - Added `deDuplicateFlashcards` controller function
   - Handles HTTP request/response for the maintenance task
   - Uses proper error handling and response formatting

3. **Routes** (`src/routes/flashcardRoutes.ts`)
   - Added new POST endpoint: `/maintenance/deduplicate`
   - No validation middleware required (no request body needed)

4. **Error Messages** (`src/constants/errorMessages.ts`)
   - Added `MAINTENANCE_TASK_COMPLETED` success message
   - Added corresponding `maintenanceTaskCompleted()` function

5. **API Documentation** (`src/API_Doc.yaml`)
   - Updated OpenAPI specification with new maintenance endpoint
   - Includes detailed response schema and examples

6. **Test Script** (`test_deduplicate_api.js`)
   - Created test script to demonstrate API usage
   - Includes both programmatic and curl examples

## API Endpoint Details

### Endpoint
```
POST /api/flashcards/maintenance/deduplicate
```

### Request
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**: None required

### Response
```json
{
  "success": true,
  "message": "Maintenance task completed successfully",
  "task": "deDuplicate",
  "result": {
    "duplicateGroupsFound": 5,
    "recordsDeleted": 12,
    "remainingRecords": 150
  },
  "timestamp": "2025-01-06T21:15:30.000Z"
}
```

## How It Works

The integrated deduplication process:

1. **Finds Duplicates**: Uses MongoDB aggregation to group flashcards by `spanishWord`
2. **Identifies Records to Delete**: Within each duplicate group:
   - Keeps records with meaningful data (`percentageCorrect > 0` or `timesSeen > 0`)
   - Marks empty records for deletion (`percentageCorrect = 0` and `timesSeen = 0`)
   - Always keeps at least one record per group
3. **Performs Cleanup**: Deletes identified duplicate records
4. **Returns Statistics**: Provides detailed information about the cleanup process

## Usage Examples

### Using the Test Script
```bash
node test_deduplicate_api.js
```

### Using curl
```bash
curl -X POST http://localhost:5000/api/flashcards/maintenance/deduplicate \
     -H "Content-Type: application/json"
```

### Using JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:5000/api/flashcards/maintenance/deduplicate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log('Deduplication result:', result);
```

## Benefits of API Integration

1. **Remote Execution**: Can be triggered from any client application
2. **Scheduled Tasks**: Can be integrated with cron jobs or task schedulers
3. **Monitoring**: Returns detailed statistics for logging and monitoring
4. **Error Handling**: Proper HTTP status codes and error responses
5. **Consistency**: Uses the same error handling patterns as other API endpoints
6. **Documentation**: Fully documented in OpenAPI specification

## Migration from Standalone Script

The original `deDuplicate.ts` script can now be replaced with API calls. The logic is identical, but the new implementation:

- Uses the existing database connection from the main application
- Follows the established service/controller pattern
- Includes proper error handling and logging
- Returns structured response data

## Security Considerations

- This is a maintenance endpoint that modifies data
- Consider adding authentication/authorization if needed
- Monitor usage to prevent abuse
- Consider rate limiting for production environments

## Testing

Use the provided `test_deduplicate_api.js` script to verify the integration works correctly. Make sure your API server is running before testing.

## Next Steps

1. Test the endpoint with your actual data
2. Consider adding authentication if needed
3. Integrate into your maintenance workflows
4. Monitor the endpoint usage and performance
