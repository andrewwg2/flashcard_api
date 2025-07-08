import Joi from 'joi';

// Validation schema for Create Flashcard DTO
export const createFlashcardSchema = Joi.object({
  spanishWord: Joi.string().required().min(1).max(100),
  englishWord: Joi.string().required().min(1).max(100),
  category: Joi.string().optional().default('General')
});

// Validation schema for Update Flashcard Stats DTO
export const updateFlashcardStatsSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  isCorrect: Joi.boolean().required()
});


export const updateBodySchema = Joi.object({
  isCorrect: Joi.boolean().optional(),
  favorite: Joi.boolean().optional()
});

export const updateParamsSchema = Joi.object({
  id: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
});

// Validation schema for Flashcard Query DTO
export const flashcardQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  category: Joi.string().optional()
});

// Validation middleware for request body
export const validateDto = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

// Validation middleware for request params
export const validateParamsDto = (schema: Joi.ObjectSchema) => {
  return  (req: any, res: any, next: any)=> {
    const { error } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Request validation failed',
        details: error.details,
      });
    }

    next();
  };
};


// Validation middleware for request query
export const validateQueryDto = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    // Replace req.query with validated value
    req.query = value;
    next();
  };
};
