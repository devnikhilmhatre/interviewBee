const Joi = require("joi");

const jobListRequestSchema = Joi.object({
  q: Joi.string().trim().empty("").optional(),
  location: Joi.string().trim().empty("").optional(),
  company: Joi.string().trim().empty("").optional(),
  sort: Joi.string()
    .valid("title", "company", "location", "posted_at")
    .default("posted_at"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  tags: Joi.alternatives()
    .try(
      Joi.string().trim().empty(""),
      Joi.array().items(Joi.string().trim().empty(""))
    )
    .optional()
    .custom((value, helpers) => {
      // If array, remove empty strings
      if (Array.isArray(value)) {
        const filtered = value.filter((v) => v);
        return filtered.length ? filtered : undefined;
      }
      // If string, return undefined if empty
      if (typeof value === "string" && !value) return undefined;
      return value;
    }),
});

module.exports = { jobListRequestSchema };
