import axios from "axios";

// todo update the base url here so that it works in the deployment as well
export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});
