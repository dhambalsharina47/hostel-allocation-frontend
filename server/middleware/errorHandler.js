class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Central error handler: maps Sequelize errors to proper HTTP status codes
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) return res.status(err.status).json({ message: err.message });

  if (err.name === 'SequelizeValidationError')
    return res.status(400).json({ message: 'Validation failed', errors: err.errors.map((e) => e.message) });

  if (err.name === 'SequelizeUniqueConstraintError')
    return res.status(409).json({ message: 'Duplicate value', errors: err.errors.map((e) => e.message) });

  if (err.name === 'SequelizeForeignKeyConstraintError')
    return res.status(400).json({ message: 'Invalid reference (related record does not exist or is in use)' });

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = { AppError, asyncHandler, errorHandler };
