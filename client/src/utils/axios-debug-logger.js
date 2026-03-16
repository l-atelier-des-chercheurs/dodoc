/**
 * Axios Debug Logger
 *
 * Sets up debug logging for axios requests and responses.
 * This module is only loaded when debug_mode is enabled.
 * No external dependencies required.
 *
 * @param {Object} axiosInstance - The axios instance to add logging to
 */

export function setupAxiosDebugLogger(axiosInstance) {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (request) => {
      const startTime = Date.now();
      request._startTime = startTime;

      const fullUrl = (() => {
        const requestUrl = request.url || "";
        if (requestUrl.startsWith("http")) return requestUrl;

        const baseUrl = request.baseURL || window.location.origin;
        try {
          return new URL(
            requestUrl,
            `${baseUrl.replace(/\/+$/, "")}/`
          ).toString();
        } catch (e) {
          // Fallback: normalize duplicated/missing slash between base and path
          const normalizedBase = baseUrl.replace(/\/+$/, "");
          const normalizedPath = requestUrl.replace(/^\/+/, "");
          return `${normalizedBase}/${normalizedPath}`;
        }
      })();

      // Log request details
      console.groupCollapsed(
        `🔵 Axios Request: ${request.method?.toUpperCase() || "GET"} ${
          request.url
        }`
      );

      console.log("URL:", request.url);
      console.log("Method:", request.method?.toUpperCase() || "GET");
      if (request.baseURL) {
        console.log("Base URL:", request.baseURL);
      }
      console.log("Full URL:", fullUrl);

      if (request.params && Object.keys(request.params).length > 0) {
        console.log("Query Params:", request.params);
      }

      if (request.headers) {
        // Redact sensitive headers
        const headersToLog = { ...request.headers };
        if (headersToLog.Authorization) {
          try {
            const authData = JSON.parse(headersToLog.Authorization);
            headersToLog.Authorization = {
              ...authData,
              token: authData.token
                ? `${authData.token.substring(0, 10)}...`
                : null,
            };
          } catch (e) {
            headersToLog.Authorization = "[Redacted]";
          }
        }
        console.log("Headers:", headersToLog);
      }

      if (request.data) {
        if (typeof request.data === "string") {
          const truncated =
            request.data.length > 200
              ? request.data.substring(0, 200) + "..."
              : request.data;
          console.log("Data (string):", truncated);
        } else if (request.data instanceof FormData) {
          const entries = [];
          if (request.data.entries) {
            for (const [key, value] of request.data.entries()) {
              entries.push({
                key,
                value: value instanceof File ? `[File: ${value.name}]` : value,
              });
            }
          }
          console.log("Data (FormData):", {
            type: "FormData",
            entries: entries.length,
            data: entries,
          });
        } else if (request.data instanceof Blob) {
          console.log("Data (Blob):", {
            type: request.data.type,
            size: request.data.size,
          });
        } else {
          try {
            const dataStr = JSON.stringify(request.data);
            if (dataStr.length > 1000) {
              console.log("Data (object, truncated):", {
                ...JSON.parse(dataStr.substring(0, 1000)),
                _truncated: true,
              });
            } else {
              console.log("Data:", request.data);
            }
          } catch (e) {
            console.log("Data:", request.data);
          }
        }
      }

      const timestamp = new Date().toLocaleTimeString();
      console.log("Time:", timestamp);
      console.groupEnd();

      return request;
    },
    (error) => {
      console.groupCollapsed("❌ Axios Request Error");
      console.error("Error:", error);
      console.error("Message:", error.message);
      console.groupEnd();
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      const duration = response.config._startTime
        ? Date.now() - response.config._startTime
        : null;

      console.groupCollapsed(
        `✅ Axios Response: ${response.config.method?.toUpperCase() || "GET"} ${
          response.config.url
        } ${response.status}${duration ? ` (${duration}ms)` : ""}`
      );

      console.log("Status:", response.status, response.statusText);
      console.log("URL:", response.config.url);

      if (response.headers) {
        console.log("Response Headers:", response.headers);
      }

      if (response.data) {
        if (typeof response.data === "string") {
          if (response.data.length > 500) {
            console.log(
              "Data (string, truncated):",
              response.data.substring(0, 500) + "..."
            );
          } else {
            console.log("Data (string):", response.data);
          }
        } else if (response.data instanceof Blob) {
          console.log("Data (Blob):", {
            type: response.data.type,
            size: response.data.size,
          });
        } else {
          try {
            const dataStr = JSON.stringify(response.data);
            if (dataStr.length > 1000) {
              const truncated = JSON.parse(dataStr.substring(0, 1000));
              console.log("Data (object, truncated):", {
                ...truncated,
                _truncated: true,
                _originalSize: dataStr.length,
              });
            } else {
              console.log("Data:", response.data);
            }
          } catch (e) {
            console.log("Data:", response.data);
          }
        }
      }

      if (duration !== null) {
        console.log("Duration:", `${duration}ms`);
      }

      const timestamp = new Date().toLocaleTimeString();
      console.log("Time:", timestamp);
      console.groupEnd();

      return response;
    },
    (error) => {
      const duration = error.config?._startTime
        ? Date.now() - error.config._startTime
        : null;

      console.groupCollapsed(
        `❌ Axios Error: ${error.config?.method?.toUpperCase() || "GET"} ${
          error.config?.url || "Unknown"
        }${duration ? ` (${duration}ms)` : ""}`
      );

      if (error.config) {
        console.log("URL:", error.config.url);
        console.log("Method:", error.config.method?.toUpperCase() || "GET");
      }

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(
          "Status:",
          error.response.status,
          error.response.statusText
        );
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.log("No response received");
        console.log("Request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error Message:", error.message);
      }

      console.log("Full Error:", error);
      if (error.stack) {
        console.log("Stack:", error.stack);
      }

      if (duration !== null) {
        console.log("Duration:", `${duration}ms`);
      }

      const timestamp = new Date().toLocaleTimeString();
      console.log("Time:", timestamp);
      console.groupEnd();

      return Promise.reject(error);
    }
  );

  console.log("✅ Axios debug logger enabled");
}
