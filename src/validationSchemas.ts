import Joi from 'joi';

// MongoDB ObjectId validation pattern
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Custom Joi extension for MongoDB ObjectId validation
const JoiObjectId = Joi.string().pattern(objectIdPattern).message('Invalid ObjectId format');

// Flashcard validation schemas
export const flashcardSchemas = {
  // Schema for creating a new flashcard
  create: Joi.object({
    spanishWord: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Spanish word cannot be empty',
        'string.max': 'Spanish word cannot exceed 100 characters',
        'any.required': 'Spanish word is required'
      }),
    
    englishWord: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'English word cannot be empty',
        'string.max': 'English word cannot exceed 100 characters',
        'any.required': 'English word is required'
      }),
    
    category: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional()
      .default('General')
      .messages({
        'string.empty': 'Category cannot be empty',
        'string.max': 'Category cannot exceed 50 characters'
      })
  }),

  // Schema for updating flashcard statistics
  updateStats: Joi.object({
    isCorrect: Joi.boolean()
      .required()
      .messages({
        'boolean.base': 'isCorrect must be a boolean value',
        'any.required': 'isCorrect is required'
      })
  }),

  // Schema for pagination parameters
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1',
        'number.integer': 'Page must be an integer'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
        'number.integer': 'Limit must be an integer'
      }),
    
    sortBy: Joi.string()
      .valid('spanishWord', 'englishWord', 'dateLastSeen', 'timesSeen', 'percentageCorrect', 'category', 'createdAt')
      .optional()
      .default('createdAt')
      .messages({
        'any.only': 'Invalid sort field'
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either "asc" or "desc"'
      })
  }),

  // Schema for CSV upload
  csvUpload: Joi.object({
    csvFilePath: Joi.string()
      .required()
      .pattern(/\.csv$/i)
      .messages({
        'string.empty': 'CSV file path cannot be empty',
        'string.pattern.base': 'File must be a CSV file',
        'any.required': 'CSV file path is required'
      })
  }),

  // Schema for category parameter
  category: Joi.object({
    category: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Category cannot be empty',
        'string.max': 'Category cannot exceed 50 characters',
        'any.required': 'Category is required'
      })
  }),

  // Schema for ID parameter
  id: Joi.object({
    id: JoiObjectId.required()
      .messages({
        'any.required': 'ID is required'
      })
  }),

  // Schema for batch operations
  batchIds: Joi.object({
    ids: Joi.array()
      .items(JoiObjectId)
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'At least one ID is required',
        'array.max': 'Cannot process more than 100 items at once',
        'any.required': 'IDs array is required'
      })
  }),

  // Schema for search/filter parameters
  searchFilter: Joi.object({
    search: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'string.empty': 'Search term cannot be empty',
        'string.max': 'Search term cannot exceed 100 characters'
      }),
    
    category: Joi.string()
      .trim()
      .optional(),
    
    minPercentageCorrect: Joi.number()
      .min(0)
      .max(100)
      .optional()
      .messages({
        'number.min': 'Minimum percentage must be at least 0',
        'number.max': 'Maximum percentage cannot exceed 100'
      }),
    
    maxPercentageCorrect: Joi.number()
      .min(0)
      .max(100)
      .optional()
      .messages({
        'number.min': 'Minimum percentage must be at least 0',
        'number.max': 'Maximum percentage cannot exceed 100'
      }),
    
    minTimesSeen: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Minimum times seen must be at least 0',
        'number.integer': 'Times seen must be an integer'
      }),
    
    maxTimesSeen: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Maximum times seen must be at least 0',
        'number.integer': 'Times seen must be an integer'
      }),
    
    dateLastSeenFrom: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.base': 'Invalid date format'
      }),
    
    dateLastSeenTo: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.base': 'Invalid date format'
      })
  }).custom((value, helpers) => {
    // Custom validation to ensure min/max values are logical
    if (value.minPercentageCorrect !== undefined && 
        value.maxPercentageCorrect !== undefined && 
        value.minPercentageCorrect > value.maxPercentageCorrect) {
      return helpers.error('custom.percentageRange', {
        message: 'Minimum percentage cannot be greater than maximum percentage'
      });
    }
    
    if (value.minTimesSeen !== undefined && 
        value.maxTimesSeen !== undefined && 
        value.minTimesSeen > value.maxTimesSeen) {
      return helpers.error('custom.timesSeenRange', {
        message: 'Minimum times seen cannot be greater than maximum times seen'
      });
    }
    
    if (value.dateLastSeenFrom !== undefined && 
        value.dateLastSeenTo !== undefined && 
        value.dateLastSeenFrom > value.dateLastSeenTo) {
      return helpers.error('custom.dateRange', {
        message: 'Start date cannot be after end date'
      });
    }
    
    return value;
  })
};

// Export validation middleware factory
export { validateRequest } from './middleware/errorHandler';
