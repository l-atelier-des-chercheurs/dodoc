const fs = require("fs-extra"),
  path = require("path"),
  anonymize = require("ip-anonymize");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvParser = require("csv-parser");

module.exports = (function () {
  const path_to_access_file = path.join(global.appRoot, "access.csv");
  const headers = ["timestamp", "ip", "user_agent"];
  // const stream = fs.createWriteStream(path_to_access_file, {
  //   flags: "a+",
  //   encoding: "utf8",
  // });

  const csvWriter = createCsvWriter({
    path: path_to_access_file,
    header: headers,
    append: true,
  });

  const API = {
    append: ({ ip, user_agent }) => {
      const timestamp = +new Date();
      const _ip = anonymize(ip);
      const records = [{ timestamp, ip: _ip, user_agent }];
      csvWriter
        .writeRecords(records) // returns a promise
        .then(() => {});
    },
    read: () => {
      return new Promise(function (resolve, reject) {
        // let content = fs.readFileSync(path_to_access_file, "utf8");
        // content = content.split("\r\n");
        // turn into array before sending

        let results = [];
        fs.createReadStream(path_to_access_file)
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
        fs.writeFile(path_to_access_file, "", () => {
          return resolve();
        });
      });
    },
  };

  return API;
})();
