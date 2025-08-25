const request = require("supertest");
const { Sequelize } = require("sequelize");
const path = require("path");
const { JobModel } = require("../src/database/models/jobs");
const { SiteModel } = require("../src/database/models/sites");
const express = require("express");
const listRouter = require("../src/server/routes/jobs");

const DB_PATH = path.join(__dirname, "test_jobs.db");

// Setup test DB
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DB_PATH,
  logging: false,
});

beforeAll(async () => {
  // Re-initialize models to use test DB
  JobModel.init(JobModel.getAttributes(), {
    sequelize,
    modelName: "Job",
    tableName: "jobs",
    timestamps: false,
  });

  SiteModel.init(SiteModel.getAttributes(), {
    sequelize,
    modelName: "Site",
    tableName: "sites",
    timestamps: false,
  });

  await sequelize.sync({ force: true });

  // Seed 10 jobs
  const jobs = [];
  for (let i = 1; i <= 10; i++) {
    jobs.push({
      id: `${i}`,
      title: `Job Title ${i}`,
      company: `Company ${i % 3}`,
      location: i % 2 === 0 ? "Remote" : "Onsite",
      tags: JSON.stringify(["tag1", "tag2"]),
      url: `https://example.com/job/${i}`,
      source: "test",
      posted_at: new Date().toISOString(),
    });
  }
  await JobModel.bulkCreate(jobs);
});

afterAll(async () => {
  await sequelize.close();
});

const app = express();
app.use("/", listRouter);

describe("Jobs API", () => {
  test("GET /jobs returns paginated results", async () => {
    const res = await request(app).get("/jobs?page=1&limit=5");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.pagination.total).toBe(10);
  });

  test("GET /jobs returns correct sorting", async () => {
    const res = await request(app).get("/jobs?sort=title&order=desc");
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].title).toBe("Job Title 9" || "Job Title 10");
  });

  test("GET /jobs search by keyword", async () => {
    const res = await request(app).get("/jobs?q=Title 1");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toContain("Title 1");
  });

  test("GET /jobs filter by location", async () => {
    const res = await request(app).get("/jobs?location=Remote");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((j) => j.location === "Remote")).toBe(true);
  });

  test("GET /jobs filter by company", async () => {
    const res = await request(app).get("/jobs?company=Company 1");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((j) => j.company === "Company 1")).toBe(true);
  });

  test("GET /jobs invalid page returns empty", async () => {
    const res = await request(app).get("/jobs?page=100&limit=5");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  test("GET /jobs invalid sort field defaults", async () => {
    const res = await request(app).get("/jobs?sort=invalid");
    expect(res.statusCode).toBe(400);
  });

  test("GET /jobs invalid limit defaults to 10", async () => {
    const res = await request(app).get("/jobs?limit=abc");
    expect(res.statusCode).toBe(400);
  });
});
