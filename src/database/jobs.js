const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./jobs.db");

// Fetch all sites from SQLite
function getAllSites() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM site_selectors", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function saveJob(job) {
  return new Promise((resolve, reject) => {
    const stmt = `
      INSERT INTO jobs (id, title, company, location, tags, url, source, posted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        company=excluded.company,
        location=excluded.location,
        tags=excluded.tags,
        url=excluded.url,
        source=excluded.source,
        posted_at=excluded.posted_at
    `;

    db.run(
      stmt,
      [
        job.id,
        job.title,
        job.company,
        job.location || "",
        JSON.stringify(job.tags || []),
        job.url,
        job.source,
        job.posted_at,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this);
      }
    );
  });
}

module.exports = {
  getAllSites,
  saveJob,
};
