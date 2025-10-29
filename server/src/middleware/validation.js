const { celebrate, Joi, Segments, isCelebrateError } = require('celebrate');

const validate = (schema) => celebrate(schema, { abortEarly: false, stripUnknown: true });

const validationErrorHandler = (err, req, res, next) => {
  if (!isCelebrateError(err)) {
    return next(err);
  }

  const details = {};
  for (const [segment, joiError] of err.details.entries()) {
    details[segment] = joiError.details.map((detail) => detail.message);
  }

  return res.status(400).json({
    message: 'Validation failed',
    details
  });
};

module.exports = {
  Joi,
  Segments,
  validate,
  validationErrorHandler
};
