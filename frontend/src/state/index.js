import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "./jobs";

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
  },
});
