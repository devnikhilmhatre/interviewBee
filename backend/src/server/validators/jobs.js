const Joi = require("joi");

const jobListRequestSchema = Joi.object({
  q: Joi.string().optional(),
  location: Joi.string().optional(),
  company: Joi.string().optional(),
  sort: Joi.string()
    .valid("title", "company", "location", "posted_at")
    .default("posted_at"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  tags: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),
});

module.exports = { jobListRequestSchema };
