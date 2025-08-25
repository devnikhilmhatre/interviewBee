const { Op } = require("sequelize");
const { JobModel } = require("../../database/models/jobs");
const { jobListRequestSchema } = require("./../validators/jobs");

function filterQuery(queryParams) {
  let { q, location, company, tags } = queryParams;

  const where = {};

  // Keyword search in title or company
  if (q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { company: { [Op.like]: `%${q}%` } },
    ];
  }

  if (company) {
    where.company = { [Op.like]: `%${company}%` };
  }

  // Filter by location
  if (location) {
    where.location = { [Op.like]: `%${location}%` };
  }

  // Filter by tags (comma-separated)
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    where.tags = {
      [Op.or]: tagList.map((t) => ({ [Op.like]: `%${t}%` })),
    };
  }

  return where;
}

async function list(req, res) {
  try {
    const { error, value } = jobListRequestSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let { q, location, company, tags, sort, order, page, limit } = value;

    page = parseInt(page);
    limit = parseInt(limit);

    const where = filterQuery({ q, location, company, tags });

    // Fetch jobs with pagination

    const jobs = await JobModel.findAll({
      where,
      order: [[sort, order.toUpperCase()]],
      offset: (page - 1) * limit,
      limit,
    });
    const total = await JobModel.count({ where });

    return res.json({
      data: jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { list };
