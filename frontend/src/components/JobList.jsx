// JobList.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadJobs } from "../state/jobs";
import JobFilters from "./JobFilters";
import Pagination from "./Pagination";

export default function JobList() {
  const dispatch = useDispatch();
  const { jobs, filters } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(loadJobs(filters));
  }, []);

  return (
    <section className="container-fluid">
      <JobFilters />
      <table role="grid" style={{ fontSize: "0.8em" }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>Posted</th>
            <th>Apply</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.company}</td>
              <td>{job.location}</td>
              <td>{job.posted_at}</td>
              <td>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="button"
                  className="secondary small"
                >
                  Apply
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination />
    </section>
  );
}
