// Pagination.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPage, loadJobs } from "../state/jobs";

export default function Pagination() {
  const dispatch = useDispatch();
  const { filters, total } = useSelector((state) => state.jobs);
  const totalPages = Math.ceil(total / filters.limit);

  const handlePage = (page) => {
    dispatch(setPage(page));
    dispatch(loadJobs({ ...filters, page }));
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Job pages"
      style={{ textAlign: "center", marginTop: "0.5rem" }}
    >
      <ul
        className="pagination"
        style={{
          display: "inline-flex",
          gap: "0.25rem",
          listStyle: "none",
          padding: 0,
        }}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i + 1}>
            <button
              onClick={() => handlePage(i + 1)}
              aria-current={filters.page === i + 1 ? "page" : undefined}
              className={
                filters.page === i + 1
                  ? "contrast compact-btn"
                  : "secondary compact-btn"
              }
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
