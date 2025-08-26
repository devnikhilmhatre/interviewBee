// JobFilters.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, loadJobs } from "../state/jobs";

export default function JobFilters() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.jobs.filters);

  const [q, setQ] = useState(filters.q);
  const [location, setLocation] = useState(filters.location);
  const [company, setCompany] = useState(filters.company);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ q, location, company, page: 1 }));
    dispatch(loadJobs({ q, location, company, page: 1, limit: filters.limit }));
  };

  return (
    <form onSubmit={handleSubmit} className="job-filters dense">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "0.25rem",
        }}
      >
        <input
          type="text"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="dense-input"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="dense-input"
        />
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="dense-input"
        />
        <button type="submit" className="dense-btn secondary">
          Filter
        </button>
      </div>
    </form>
  );
}
