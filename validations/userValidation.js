const Joi = require('joi');

const userValidation = (data) => {
  const schema = Joi.object({
    Name: Joi.string().required(),
    Username: Joi.string().min(6).alphanum().required(),
    Email: Joi.string().min(6).required().email(),
    Password: Joi.string().min(6).required()
  });

  return schema.validate(data);
}

module.exports = userValidation;