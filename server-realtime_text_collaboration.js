var shareDBServer = require('./sharedb-server');

const WebSocket = require('ws');
const WebSocketJSONStream = require('websocket-json-stream');
const http = require('http');
const uuid = require('uuid');
const { URLSearchParams } = require('url');
const quillRender = require('quill-render');

const dev = require('./core/dev-log'),
  file = require('./core/file');

module.exports = function() {
  dev.log(`server-realtime_text_collaboration • init`);

  // Share DB
  // const share = new ShareDB();
  // const shareconn = shareDBServer.connect();

  const shareserver = http.createServer();
  shareserver.listen(8079, () => {});

  dev.log(`server-realtime_text_collaboration • sharedb server init init`);
  const shareconn = shareDBServer.connect();

  dev.log(`server-realtime_text_collaboration • ws init`);

  const sharewss = new WebSocket.Server({ server: shareserver });

  sharewss.on('connection', (ws, req) => {
    dev.logfunction(`server-realtime_text_collaboration • sharewss connection`);

    ws.id = uuid();
    ws.isAlive = true;

    dev.logverbose(
      `server-realtime_text_collaboration • sharewss: a new client ${
        ws.id
      } connected.`
    );

    // "?type=projects&slugFolderName=publi&metaFileName=text-20181228_122605-shl.md.txt"
    const requested_querystring = req.url.substring(1);
    const requested_textmedia_infos = new URLSearchParams(
      requested_querystring
    );
    const textmedia_infos = {
      type: requested_textmedia_infos.get('type'),
      slugFolderName: requested_textmedia_infos.get('slugFolderName'),
      metaFileName: requested_textmedia_infos.get('metaFileName')
    };

    dev.logverbose(
      `—> requested textMedias ${JSON.stringify(textmedia_infos, null, 4)}`
    );

    const sharedoc = shareconn.get('textMedias', requested_querystring);

    if (sharedoc.data == null) {
      // parse requested_resource from search params
      file
        .readMediaList({
          type: textmedia_infos.type,
          medias_list: [
            {
              slugFolderName: textmedia_infos.slugFolderName,
              metaFileName: textmedia_infos.metaFileName
            }
          ]
        })
        .then(mediaData => {
          dev.logverbose(
            `server-realtime_text_collaboration • sharewss: got base text media`
          );

          const text_content = Object.values(
            Object.values(mediaData)[0].medias
          )[0].content;
          let rendered_text = quillRender([{ insert: text_content }]);

          debugger;
          dev.logverbose(
            `server-realtime_text_collaboration • sharewss: now inserting = ${rendered_text}`
          );

          // and add this parsed content to that doc
          sharedoc.create(rendered_text, 'rich-text', function(err) {
            if (err) return dev.error(err);

            dev.logverbose(
              `server-realtime_text_collaboration • sharewss: doc created`
            );

            var stream = new WebSocketJSONStream(ws);
            shareDBServer.listen(stream);

            sharedoc.on('op', ops => {
              dev.logverbose(
                `server-realtime_text_collaboration • sharewss: new op for requested_querystring = ${requested_querystring}`
              );
            });
          });
        });
    }

    ws.on('pong', function(data, flags) {
      dev.logverbose(
        `server-realtime_text_collaboration • sharewss: pong received for ${
          ws.id
        }`
      );
      ws.isAlive = true;
    });

    ws.on('error', function(error) {
      dev.error(
        `server-realtime_text_collaboration • sharewss: client connection errored for ${
          ws.id
        } with error = ${error}`
      );
    });
  });

  setInterval(function() {
    sharewss.clients.forEach(function(ws) {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
      dev.logverbose(
        `server-realtime_text_collaboration • sharewss: ping sent for ${ws.id}`
      );
    });
  }, 5000);

  // app.use((res, req, next) => {
  //   dev.log(`server-realtime_text_collaboration • loaded document`);

  //   // Create the document if it hasn't been already
  //   const req_doc = res.query.doc || 'default';
  //   const sharedoc = shareconn.get('docs', req_doc);
  //   //   const sharedoc = shareconn.get('docs', 'default');
  //   if (sharedoc.data == null) sharedoc.create(req_doc, 'rich-text');

  //   next();
  // });

  // // Sockets Ping, Keep Alive
};
