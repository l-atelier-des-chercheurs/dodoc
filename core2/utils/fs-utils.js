const path = require("path"),
  fs = require("fs-extra"),
  writeFileAtomic = require("write-file-atomic"),
  { IncomingForm } = require("formidable"),
  md5File = require("md5-file"),
  fastFolderSize = require("fast-folder-size"),
  fetch = require("node-fetch");

module.exports = function createFsUtils(API) {
  return {
    async handleForm({
      path_to_folder,
      destination_full_folder_path,
      req,
      upload_max_file_size_in_mo = 10_000,
    }) {
      dev.logfunction({ path_to_folder, destination_full_folder_path });

      if (
        typeof path_to_folder !== "undefined" &&
        !destination_full_folder_path
      )
        destination_full_folder_path = API.getPathToUserContent(path_to_folder);

      await fs.ensureDir(destination_full_folder_path);

      return new Promise((resolve, reject) => {
        let settled = false;
        const makeUploadAbortedError = () => {
          const aborted_err = new Error("Upload aborted");
          aborted_err.code = "upload_aborted";
          return aborted_err;
        };
        const settleReject = (err) => {
          if (settled) return;
          settled = true;
          reject(err);
        };
        const settleResolve = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        const isSizeLimitError = (err) => {
          if (err?.code === 1009) return true;
          const err_msg = err?.message ?? "";
          return (
            err_msg.includes("maxFileSize") ||
            err_msg.includes("maxTotalFileSize")
          );
        };
        const rejectFileSizeLimit = () => {
          dev.error(
            `File size limit exceeded. Maximum file size is ${upload_max_file_size_in_mo} Mo.`
          );
          return settleReject("file_size_limit_exceeded");
        };

        const form = new IncomingForm({
          uploadDir: destination_full_folder_path,
          multiples: false,
          allowEmptyFiles: true,
          minFileSize: 0,
          maxFileSize: upload_max_file_size_in_mo * 1024 * 1024,
        });

        let file = null;
        let user_additional_meta = {};

        form.on("field", (name, value) => {
          dev.logverbose(`Field gotten`, name, value);
          user_additional_meta = JSON.parse(value);
        });

        // every time a file has been uploaded successfully,
        form.on("file", (field, uploadedFile) => {
          dev.logverbose(
            `File uploaded: 
                – field: ${field} 
                – file: ${JSON.stringify(uploadedFile)}.`
          );
          file = uploadedFile;
        });

        form
          .on("error", (err) => {
            if (isSizeLimitError(err)) return rejectFileSizeLimit();
            if (err?.code === "ECONNRESET") {
              return settleReject(makeUploadAbortedError());
            }
            return settleReject(err);
          })
          .on("aborted", () => settleReject(makeUploadAbortedError()));

        form.once("end", async () => {
          dev.logverbose(`File downloaded`);
          dev.logverbose({ file });

          if (!file || !file.filepath) {
            if (req?.aborted) return settleReject(makeUploadAbortedError());
            return settleReject(new Error("No file to parse"));
          }

          return settleResolve({
            originalFilename: file.originalFilename,
            path_to_temp_file: file.filepath,
            user_additional_meta,
          });
        });

        // formidable v3 may also reject parse() promise; catch it to avoid
        // triggering the global unhandledRejection handler.
        Promise.resolve(form.parse(req)).catch((err) => {
          if (isSizeLimitError(err)) return rejectFileSizeLimit();
          if (req?.aborted || err?.code === "ECONNRESET") {
            return settleReject(makeUploadAbortedError());
          }
          return settleReject(err);
        });
      });
    },

    async downloadFileFromUrl({
      url: fileUrl,
      destination_path,
      max_file_size_in_mo = 100,
      timeout_ms = 30000,
      base_url = null,
    }) {
      dev.logfunction({ fileUrl, destination_path });

      // Handle relative URLs by combining with base_url
      if (base_url && !fileUrl.startsWith("http")) {
        fileUrl = new URL(fileUrl, base_url).href;
      } else if (!fileUrl.startsWith("http")) {
        fileUrl = API.addhttp(fileUrl);
      }

      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(fileUrl, {
            timeout: timeout_ms,
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; DodocBot/1.0)",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Check content length
          const contentLength = response.headers.get("content-length");
          if (
            contentLength &&
            parseInt(contentLength, 10) > max_file_size_in_mo * 1024 * 1024
          ) {
            throw new Error("File size limit exceeded");
          }

          // Get filename from URL or use default
          const parsedUrl = new URL(fileUrl);
          let filename = path.basename(parsedUrl.pathname);
          if (!filename || filename === "/") {
            filename = "downloaded-file";
          }

          // Download the file
          const buffer = await response.buffer();

          // Check actual downloaded size
          if (buffer.length > max_file_size_in_mo * 1024 * 1024) {
            throw new Error("File size limit exceeded");
          }

          // Ensure destination directory exists
          await fs.ensureDir(path.dirname(destination_path));

          // Write file
          await fs.writeFile(destination_path, buffer);

          resolve({
            filename,
            size: buffer.length,
            path: destination_path,
          });
        } catch (error) {
          reject(error);
        }
      });
    },

    async md5FromFile({ full_media_path }) {
      return await md5File(full_media_path);
    },

    async testWriteFileInFolder(folder_path) {
      dev.logfunction({ folder_path });
      const path_to_test_file = path.join(folder_path, "__test.txt");
      const created_on_date = API.getCurrentDate();
      await fs.ensureDir(folder_path);
      await writeFileAtomic(
        path_to_test_file,
        `Test file created and immediately deleted by dodoc while starting, on ${created_on_date}.`
      );
      await fs.remove(path_to_test_file);
      return;
    },

    async getFolderSize(...paths) {
      const full_folder_path = API.getPathToUserContent(...paths);

      const getFolderSizeNative = async (folder_path) => {
        let total_size = 0;
        let entries = [];

        try {
          entries = await fs.readdir(folder_path, { withFileTypes: true });
        } catch (err) {
          dev.error(err);
          return 0;
        }

        for (const entry of entries) {
          const entry_path = path.join(folder_path, entry.name);

          try {
            if (entry.isSymbolicLink()) continue;

            if (entry.isDirectory()) {
              total_size += await getFolderSizeNative(entry_path);
            } else if (entry.isFile()) {
              const stat = await fs.stat(entry_path);
              total_size += stat.size;
            }
          } catch (err) {
            // Ignore unreadable entries to keep size requests resilient.
            dev.error(err);
          }
        }

        return total_size;
      };

      if (process.platform === "win32") {
        return await getFolderSizeNative(full_folder_path);
      }

      try {
        const bin_size = await new Promise((resolve, reject) =>
          fastFolderSize(full_folder_path, (err, size) => {
            if (err) return reject(err);
            if (!Number.isFinite(size))
              return reject(new Error("Invalid folder size"));
            resolve(size);
          })
        );
        return bin_size;
      } catch (err) {
        dev.error(err);
        return await getFolderSizeNative(full_folder_path);
      }
    },
  };
};
