const fs = require("fs-extra"),
  path = require("path");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvParser = require("csv-parser");

module.exports = (function () {
  const path_to_changelog_file = path.join(global.appRoot, "changelog.csv");
  const headers = ["timestamp", "author", "action", "detail"];
  // const stream = fs.createWriteStream(path_to_changelog_file, {
  //   flags: "a+",
  //   encoding: "utf8",
  // });

  const csvWriter = createCsvWriter({
    path: path_to_changelog_file,
    header: headers,
    // header: [
    //   { id: "timestamp", title: "TIMESTAMP" },
    //   { id: "author", title: "AUTHOR" },
    //   { id: "action", title: "ACTION" },
    //   { id: "detail", title: "DETAIL" },
    // ],
    append: true,
  });

  const API = {
    append: ({ author, action, detail }) => {
      const timestamp = +new Date();
      if (!author) author = "anonymous";
      if (detail) {
        if (detail.data)
          for (var i in detail.data) {
            if (
              typeof detail.data[i] === "string" &&
              detail.data[i].length > 20
            ) {
              detail.data[i] = detail.data[i].substring(0, 20) + "…";
            } else if (
              Array.isArray(detail.data[i]) &&
              detail.data[i].length > 3
            ) {
              detail.data[i] = detail.data[i].slice(0, 2).concat({ "…": "…" });
            }
          }

        detail = JSON.stringify(detail);
      }

      // const string = JSON.stringify({ timestamp, author, action, detail });
      // const string = [timestamp, author, action, detail]
      //   .map((p) => `"${p}"`)
      //   // .map((p) => (typeof p === "string" ? p.replace(/,/g, "\\,") : p))
      //   .join(",");

      // stream.cork();
      // stream.write(string + "\r\n");
      // // stream.write([timestamp, author, action, JSON.stringify(detail)].join(','));
      // process.nextTick(() => stream.uncork());

      const records = [{ timestamp, author, action, detail }];
      csvWriter
        .writeRecords(records) // returns a promise
        .then(() => {});
    },
    read: () => {
      return new Promise(function (resolve, reject) {
        // let content = fs.readFileSync(path_to_changelog_file, "utf8");
        // content = content.split("\r\n");
        // turn into array before sending

        let results = [];
        fs.createReadStream(path_to_changelog_file)
          .pipe(csvParser(headers))
          .on("data", (data) => results.push(data))
          .on("end", () => {
            return resolve(results);
          })
          .on("error", (err) => {
            return reject(err);
          });
      });
    },
    empty: () => {
      return new Promise(function (resolve, reject) {
        fs.writeFile(path_to_changelog_file, "", () => {
          return resolve();
        });
      });
    },
  };

  return API;
})();
