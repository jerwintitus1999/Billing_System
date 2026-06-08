import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to extract response body and handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || "An unexpected error occurred";
    const status = error.response?.status;
    const validationErrors = error.response?.data?.errors || null;

    return Promise.reject({
      message,
      status,
      errors: validationErrors,
    });
  }
);
