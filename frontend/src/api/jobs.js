import axios from "axios";

import { API_URL } from "./../constant";

export const fetchJobs = async (params) => {
  const url = `${API_URL}/jobs`;
  const { data } = await axios.get(url, { params });
  return data;
};
