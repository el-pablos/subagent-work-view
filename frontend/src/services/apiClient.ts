import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Request retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Request cancellation map
const pendingRequests = new Map<string, AbortController>();

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Request interceptor for adding auth tokens and request cancellation
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request cancellation support
    const requestKey = `${config.method}-${config.url}`;

    // Cancel previous pending request if exists
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey);
      controller?.abort();
      pendingRequests.delete(requestKey);
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);

    // Add retry count to config
    if (!config.headers["x-retry-count"]) {
      config.headers["x-retry-count"] = "0";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling and retry logic
apiClient.interceptors.response.use(
  (response) => {
    // Remove request from pending map on success
    const requestKey = `${response.config.method}-${response.config.url}`;
    pendingRequests.delete(requestKey);

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      headers: { "x-retry-count": string };
    };

    // Remove request from pending map
    if (config) {
      const requestKey = `${config.method}-${config.url}`;
      pendingRequests.delete(requestKey);
    }

    // Handle cancellation
    if (axios.isCancel(error)) {
      console.log("Request cancelled:", error.message);
      return Promise.reject(error);
    }

    // Handle network errors and retryable status codes
    const shouldRetry =
      config &&
      (!error.response || RETRY_STATUS_CODES.includes(error.response.status)) &&
      parseInt(config.headers["x-retry-count"]) < MAX_RETRIES;

    if (shouldRetry) {
      const retryCount = parseInt(config.headers["x-retry-count"]);
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff

      console.log(
        `Retrying request (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms:`,
        config.url,
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increment retry count
      config.headers["x-retry-count"] = String(retryCount + 1);

      // Retry the request
      return apiClient(config);
    }

    // Handle specific error responses
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and potentially redirect
          console.error("Unauthorized request - clearing auth token");
          localStorage.removeItem("auth_token");
          // Emit event for app to handle redirect
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
          break;

        case 403:
          console.error("Forbidden request:", config.url);
          break;

        case 404:
          console.error("Resource not found:", config.url);
          break;

        case 422:
          // Validation error
          console.error("Validation error:", data);
          break;

        case 429:
          // Rate limit exceeded
          console.error("Rate limit exceeded");
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          console.error("Server error:", status);
          break;

        default:
          console.error("API error:", status, data);
      }

      // Create structured error
      const apiError = new ApiError(
        (data as { message?: string })?.message ||
          error.message ||
          `Request failed with status ${status}`,
        status,
        data,
      );

      return Promise.reject(apiError);
    }

    // Network error or timeout
    if (error.code === "ECONNABORTED") {
      const timeoutError = new ApiError(
        "Request timeout - please check your connection",
        408,
      );
      return Promise.reject(timeoutError);
    }

    // Generic network error
    const networkError = new ApiError(
      "Network error - please check your connection",
      0,
    );
    return Promise.reject(networkError);
  },
);

// Function to cancel all pending requests
export function cancelAllRequests() {
  pendingRequests.forEach((controller) => {
    controller.abort();
  });
  pendingRequests.clear();
}

// Function to cancel specific request
export function cancelRequest(method: string, url: string) {
  const requestKey = `${method}-${url}`;
  const controller = pendingRequests.get(requestKey);

  if (controller) {
    controller.abort();
    pendingRequests.delete(requestKey);
  }
}

export default apiClient;
