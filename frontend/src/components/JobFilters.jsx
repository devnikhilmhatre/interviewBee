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
    <form onSubmit={handleSubmit}>
      <fieldset role="group">
        <input
          type="text"
          placeholder="Search jobs..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <button type="submit">Filter</button>
      </fieldset>
    </form>
  );
}
