const WebSocket = require("ws"),
  WebSocketJSONStream = require("websocket-json-stream"),
  Backend = require("sharedb"),
  ShareDB_logger = require("sharedb-logger"),
  { v4: uuidv4 } = require("uuid"),
  url = require("url"),
  { URLSearchParams } = require("url");

Backend.types.register(require("rich-text").type);

const dev = require("./dev-log"),
  file = require("./file");

module.exports = function (server) {
  dev.log(`init`);
  const backend = new Backend();
  const connection = backend.connect();
  // const sharedb_logger = new ShareDB_logger(backend);
  dev.log(`ws init`);

  backend.use("op", (context, next) => {
    dev.logverbose(`sharedb: op received`);
    // const snapshot_as_delta = backend.db.docs[req.collection][req.id];
    // dev.logverbose(`-> snapshot = ${JSON.stringify(snapshot_as_delta)}`);
    // getSnapshot(context);
    next();
  });
  backend.use("connect", (context, next) => {
    dev.logfunction(`connect`);
    // const req_doc = res.query.doc || "default";
    // const sharedoc = shareconn.get("docs", req_doc);
    // if (sharedoc.data == null) sharedoc.create(req_doc, "rich-text");
    next();
  });
  backend.use("readSnapshots", (context, next) => {
    dev.logfunction(`readSnapshots`);
    // const req_doc = res.query.doc || "default";
    // const sharedoc = shareconn.get("docs", req_doc);
    // if (sharedoc.data == null) sharedoc.create(req_doc, "rich-text");
    next();
  });

  const sharewss = new WebSocket.Server({ noServer: true });
  sharewss.on("connection", async (client, req) => {
    client.id = uuidv4();
    client.isAlive = true;
    dev.logverbose(`sharewss: a new client ${client.id} connected.`);

    await loadDocFromFile({ url: req.url });

    var stream = new WebSocketJSONStream(client);
    backend.listen(stream);

    client.on("message", function (data, flags) {
      dev.logverbose(`sharewss: message from ${client.id}`);
    });
    client.on("pong", function (data, flags) {
      // dev.logverbose(`sharewss: pong received from ${client.id}`);
      client.isAlive = true;
    });
    client.on("message", function () {});
    client.on("error", function (error) {
      dev.error(
        `sharewss: client connection errored for ${client.id} with error = ${error}`
      );
    });
  });

  server.on("upgrade", function upgrade(req, socket, head) {
    const pathname = url.parse(req.url).pathname;

    if (pathname.includes("/isSharedb"))
      sharewss.handleUpgrade(req, socket, head, (ws) =>
        sharewss.emit("connection", ws, req)
      );
  });

  setInterval(function () {
    sharewss.clients.forEach(function (client) {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
      // dev.logverbose(`sharewss: ping sent for ${client.id}`);
    });
  }, 5000);

  async function loadDocFromFile({ url }) {
    // "?type=projects&slugFolderName=publi&metaFileName=text-20181228_122605-shl.md.txt"
    // const requested_querystring = url.substring(1);
    // const requested_textmedia_infos = new URLSearchParams(requested_querystring);
    // const textmedia_infos = {
    //   type: requested_textmedia_infos.get("type"),
    //   slugFolderName: requested_textmedia_infos.get("slugFolderName"),
    //   metaFileName: requested_textmedia_infos.get("metaFileName"),
    // };

    dev.logfunction({ url });

    /* works, but loading server-side would require using puppeteer or something else
    to load quill with custom modules (like ql-mediacard), which seems overkill… */

    // const q = new URLSearchParams(url.substring(11));
    // const path_to_meta = q.get("path_to_meta");

    // const sharedoc = connection.get("collaborative_texts", path_to_meta);
    // const ops = [{ insert: "Text", attributes: { bold: true } }];

    // dev.logverbose(`Connecting to doc ${path_to_meta}`);
    // try {
    //   if (sharedoc.data == null) {
    //     dev.logverbose(`Doc doesnt exist, creating it with ${ops}`);
    //     await sharedoc.create(ops, "rich-text");
    //     // await new Promise((r) => setTimeout(r, 2000));
    //   } else {
    //     dev.logverbose(`Doc already exists`);
    //   }
    // } catch (err) {
    //   throw err;
    // }
  }

  async function getSnapshot(context) {
    backend.fetch(
      context.agent,
      context.collection,
      context.id,
      {},
      function (error, snapshot) {
        console.log(snapshot);
      }
    );
  }
};

// "?type=projects&slugFolderName=publi&metaFileName=text-20181228_122605-shl.md.txt"
// const requested_querystring = req.url.substring(1);
// const requested_textmedia_infos = new URLSearchParams(
//   requested_querystring
// );
// const textmedia_infos = {
//   type: requested_textmedia_infos.get("type"),
//   slugFolderName: requested_textmedia_infos.get("slugFolderName"),
//   metaFileName: requested_textmedia_infos.get("metaFileName"),
// };

// dev.logverbose(
//   `—> requested textMedias ${JSON.stringify(textmedia_infos, null, 4)}`
// );

// if (sharedoc.data == null) {
//   const rendered_text = "<p>Plop</p>";
//   sharedoc.create(rendered_text, "rich-text", (err) => {
//     if (err) return dev.error(err);
//     dev.logverbose(`sharewss: doc created`);
//     var stream = new WebSocketJSONStream(ws);
//     share.listen(stream);
//     sharedoc.on("op", (ops) => {
//       dev.logverbose(
//         `sharewss: new op for requested_querystring = ${requested_querystring}`
//       );
//     });
//   });
// }

//   // parse requested_resource from search params
//   file
//     .readMediaList({
//       type: textmedia_infos.type,
//       medias_list: [
//         {
//           slugFolderName: textmedia_infos.slugFolderName,
//           metaFileName: textmedia_infos.metaFileName
//         }
//       ]
//     })
//     .then(mediaData => {
//       dev.logverbose(
//         `sharewss: got base text media`
//       );

//       const text_content = Object.values(
//         Object.values(mediaData)[0].medias
//       )[0].content;
//       let rendered_text = quillRender([{ insert: text_content }]);

//       dev.logverbose(
//         `sharewss: now inserting = ${rendered_text}`
//       );

//       // and add this parsed content to that doc
//       sharedoc.create(rendered_text, 'rich-text', function(err) {
//         if (err) return dev.error(err);

//         dev.logverbose(
//           `sharewss: doc created`
//         );

//         var stream = new WebSocketJSONStream(ws);
//         share.listen(stream);

//         sharedoc.on('op', ops => {
//           dev.logverbose(
//             `sharewss: new op for requested_querystring = ${requested_querystring}`
//           );
//         });
//       });
//     });
// }
