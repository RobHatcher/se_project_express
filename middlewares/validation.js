const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

const validateEmail = (value, helpers) => {
  if (validator.isEmail(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

module.exports.validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled',
    }),

    imageURL: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "imageURL" must be filled',
      "string.uri": 'The "imageURL" field must be a valid URL',
    }),

    weather: Joi.string().valid("hot", "warm", "cold").required().messages({
      "any.required": "The weather field must be filled",
    }),
  }),
});

module.exports.validateInfoBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled',
    }),

    avatar: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "imageURL" must be filled',
      "string.uri": 'The "imageURL" field must be a valid URL',
    }),

    email: Joi.string().required().custom(validateEmail).messages({
      "string.empty": 'The "email" must be filled',
      "string.uri": 'The "email" field must be a valid email',
    }),

    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

module.exports.validateItemId = celebrate({
  params: Joi.object().keys()({
    itemId: Joi.string().alphanum().length(24).required().messages({
      "string.base": "The itemId must be a string",
      "string.alphanum": "The itemId must consist of alphanumeric characters",
      "string.length": "The itemId must be 24 characters long",
      "any.required": "The itemId is required",
    }),
  }),
});

module.exports.validateUserAuth = celebrate({
  body: Joi.object().keys({
    email: Joi.string()
      .required()
      .email()
      .message('The "email" field must be a valid email address')
      .messages({
        "string.required": 'The "email" field must be filled in',
      }),

    password: Joi.string().required().messages({
      "string.empty": 'The "name" field must be filled in',
    }),
  }),
});

module.exports.validateUserId = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field must be at least 2',
      "string.max": 'The maximum length of the "name" field must consist of no more than 30',
      "string.empty": 'The "name" field must be filled in',
    }),

    avatar: Joi.string().required().custom(validateURL).messages({
      "string.empty": 'The "avatar" field must be filled in',
      "string.uri": 'The "avatar" field must be a valid URL',
    }),
  }),
});
