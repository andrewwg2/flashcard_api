# Maintenance Tasks

The Flashcard API includes several maintenance features designed to keep your data clean and optimized. This guide covers the available maintenance tasks and how to use them.

## Overview

Maintenance tasks help ensure data integrity and optimal performance by:
- **Removing Duplicates**: Eliminate duplicate flashcards while preserving valuable data
- **Data Cleanup**: Maintain database consistency and performance
- **Automated Processing**: Run maintenance tasks via API endpoints
- **Detailed Reporting**: Get comprehensive statistics about maintenance operations

## Available Maintenance Tasks

### 1. Deduplication

The deduplication feature removes duplicate flashcards based on the `spanishWord` field while intelligently preserving data with meaningful statistics.

#### How It Works

The deduplication process:

1. **Identifies Duplicates**: Groups flashcards by `spanishWord` using MongoDB aggregation
2. **Prioritizes Data**: Within each duplicate group:
   - Keeps records with performance data (`percentageCorrect > 0` or `timesSeen > 0`)
   - Marks empty records for deletion (`percentageCorrect = 0` and `timesSeen = 0`)
   - Always preserves at least one record per group
3. **Performs Cleanup**: Deletes identified duplicate records
4. **Returns Statistics**: Provides detailed information about the cleanup process

#### API Endpoint

**POST** `/api/flashcards/maintenance/deduplicate`

```bash
curl -X POST http://localhost:5000/api/flashcards/maintenance/deduplicate \
     -H "Content-Type: application/json"
```

#### Response Format

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
  "timestamp": "2025-01-10T21:30:00.000Z"
}
```

#### Response Fields

- **duplicateGroupsFound**: Number of groups with duplicate `spanishWord` values
- **recordsDeleted**: Total number of duplicate records removed
- **remainingRecords**: Total flashcards remaining after deduplication
- **timestamp**: When the maintenance task was completed

## Usage Examples

### Basic Deduplication

```bash
# Run deduplication maintenance task
curl -X POST http://localhost:5000/api/flashcards/maintenance/deduplicate \
     -H "Content-Type: application/json"
```

### Using Node.js/JavaScript

```javascript
async function runDeduplication() {
  try {
    const response = await fetch('http://localhost:5000/api/flashcards/maintenance/deduplicate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Deduplication completed:`);
      console.log(`- Duplicate groups found: ${result.result.duplicateGroupsFound}`);
      console.log(`- Records deleted: ${result.result.recordsDeleted}`);
      console.log(`- Records remaining: ${result.result.remainingRecords}`);
    } else {
      console.error('Deduplication failed:', result.message);
    }
  } catch (error) {
    console.error('Error running deduplication:', error);
  }
}

runDeduplication();
```

### Using Python

```python
import requests
import json

def run_deduplication():
    url = 'http://localhost:5000/api/flashcards/maintenance/deduplicate'
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, headers=headers)
        result = response.json()
        
        if result['success']:
            print(f"Deduplication completed:")
            print(f"- Duplicate groups found: {result['result']['duplicateGroupsFound']}")
            print(f"- Records deleted: {result['result']['recordsDeleted']}")
            print(f"- Records remaining: {result['result']['remainingRecords']}")
        else:
            print(f"Deduplication failed: {result['message']}")
    except Exception as e:
        print(f"Error running deduplication: {e}")

run_deduplication()
```

## Deduplication Logic Details

### Data Preservation Strategy

The deduplication algorithm uses the following priority system:

1. **High Priority**: Records with `percentageCorrect > 0` OR `timesSeen > 0`
   - These contain valuable learning progress data
   - Always preserved over empty records

2. **Low Priority**: Records with `percentageCorrect = 0` AND `timesSeen = 0`
   - These are typically newly created or unused flashcards
   - Candidates for deletion when duplicates exist

3. **Fallback**: If all duplicates have the same priority level
   - Keeps the first record found
   - Ensures at least one record always remains

### Example Scenarios

#### Scenario 1: Mixed Data Quality
```
Duplicates for "hola":
- Record A: percentageCorrect = 0.8, timesSeen = 10 ✅ KEEP
- Record B: percentageCorrect = 0, timesSeen = 0   ❌ DELETE
- Record C: percentageCorrect = 0.6, timesSeen = 5 ✅ KEEP

Result: Records A and C preserved, Record B deleted
```

#### Scenario 2: All Empty Records
```
Duplicates for "casa":
- Record A: percentageCorrect = 0, timesSeen = 0 ✅ KEEP (first found)
- Record B: percentageCorrect = 0, timesSeen = 0 ❌ DELETE
- Record C: percentageCorrect = 0, timesSeen = 0 ❌ DELETE

Result: Record A preserved, Records B and C deleted
```

#### Scenario 3: All Have Data
```
Duplicates for "perro":
- Record A: percentageCorrect = 0.7, timesSeen = 8 ✅ KEEP
- Record B: percentageCorrect = 0.5, timesSeen = 3 ✅ KEEP
- Record C: percentageCorrect = 0.9, timesSeen = 12 ✅ KEEP

Result: All records preserved (no deletion when all have valuable data)
```

## Best Practices

### When to Run Deduplication

1. **After CSV Imports**: Large CSV uploads may introduce duplicates
2. **Regular Maintenance**: Monthly or quarterly cleanup
3. **Before Backups**: Clean data before creating backups
4. **Performance Issues**: When database queries become slow

### Monitoring and Logging

The deduplication endpoint provides detailed statistics that should be:
- **Logged**: Keep records of maintenance operations
- **Monitored**: Track trends in duplicate creation
- **Reported**: Include in regular system health reports

### Safety Considerations

1. **Backup First**: Always backup your database before running maintenance
2. **Test Environment**: Run deduplication in a test environment first
3. **Monitor Results**: Review the statistics to ensure expected behavior
4. **Gradual Rollout**: For large datasets, consider running during low-traffic periods

## Scheduling Maintenance Tasks

### Using Cron Jobs (Linux/Mac)

```bash
# Run deduplication every Sunday at 2 AM
0 2 * * 0 curl -X POST http://localhost:5000/api/flashcards/maintenance/deduplicate

# Add to crontab
crontab -e
```

### Using Windows Task Scheduler

Create a batch file `deduplicate.bat`:
```batch
@echo off
curl -X POST http://localhost:5000/api/flashcards/maintenance/deduplicate -H "Content-Type: application/json"
```

Schedule it to run weekly using Windows Task Scheduler.

### Using Node.js Cron

```javascript
const cron = require('node-cron');
const fetch = require('node-fetch');

// Run deduplication every Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  console.log('Running scheduled deduplication...');
  
  try {
    const response = await fetch('http://localhost:5000/api/flashcards/maintenance/deduplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('Deduplication completed:', result);
  } catch (error) {
    console.error('Scheduled deduplication failed:', error);
  }
});
```

## Error Handling

The maintenance endpoints include comprehensive error handling:

### Common Error Responses

```json
{
  "success": false,
  "error": {
    "code": "SERVER_002",
    "message": "Database operation failed",
    "statusCode": 500
  },
  "timestamp": "2025-01-10T21:30:00.000Z"
}
```

### Error Scenarios

1. **Database Connection Issues**: Server returns 500 with connection error details
2. **Permission Problems**: Authentication/authorization errors if security is enabled
3. **Resource Constraints**: Memory or processing limitations during large operations

## Performance Considerations

### Large Datasets

For databases with many flashcards:
- **Memory Usage**: Deduplication processes data in memory
- **Processing Time**: Larger datasets take longer to process
- **Database Load**: Operations may impact concurrent requests

### Optimization Tips

1. **Off-Peak Hours**: Run maintenance during low-traffic periods
2. **Resource Monitoring**: Monitor CPU and memory usage during operations
3. **Batch Processing**: For very large datasets, consider implementing batch processing

## Future Enhancements

Planned maintenance features:
- **Selective Deduplication**: Target specific categories or date ranges
- **Dry Run Mode**: Preview changes before applying them
- **Rollback Capability**: Undo maintenance operations if needed
- **Advanced Statistics**: More detailed reporting and analytics
- **Automated Scheduling**: Built-in cron-like scheduling within the API

## Integration with Monitoring

### Health Checks

Monitor maintenance task health:
```bash
# Check if maintenance endpoints are responsive
curl -X POST http://localhost:5000/api/flashcards/maintenance/deduplicate \
     --max-time 30 \
     --fail
```

### Logging Integration

Maintenance operations generate structured logs that can be integrated with:
- **ELK Stack**: Elasticsearch, Logstash, and Kibana
- **Splunk**: Enterprise log management
- **CloudWatch**: AWS logging and monitoring
- **Custom Dashboards**: Application-specific monitoring

For more information about the technical implementation, see the [API documentation](../src/API_Doc.yaml) and [error handling system](ERROR_HANDLING.md).
