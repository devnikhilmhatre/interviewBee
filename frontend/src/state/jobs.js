import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchJobs } from "../api/jobs";

export const loadJobs = createAsyncThunk(
  "jobs/loadJobs",
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchJobs(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  jobs: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    q: "",
    location: "",
    company: "",
    page: 1,
    limit: 5,
  },
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data;
        state.total = action.payload.pagination.total;
      })
      .addCase(loadJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load jobs";
      });
  },
});

export const { setFilters, setPage } = jobsSlice.actions;
export default jobsSlice.reducer;
