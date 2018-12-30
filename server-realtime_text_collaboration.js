const ShareDB = require('sharedb');
const richText = require('rich-text');

const WebSocket = require('ws');
const WebSocketJSONStream = require('websocket-json-stream');
const http = require('http');

const dev = require('./core/dev-log');

ShareDB.types.register(richText.type);

module.exports = function(app) {
  dev.log(`server-realtime_text_collaboration • init`);

  // Share DB
  const share = new ShareDB();
  const shareconn = share.connect();
  const shareserver = http.createServer();
  const sharewss = new WebSocket.Server({ server: shareserver });
  sharewss.on('connection', client =>
    share.listen(new WebSocketJSONStream(client))
  );
  shareserver.listen(8079);

  app.use((res, req, next) => {
    dev.log(`server-realtime_text_collaboration • loaded document`);

    // Create the document if it hasn't been already
    const req_doc = res.query.doc || 'default';
    const sharedoc = shareconn.get('docs', req_doc);
    //   const sharedoc = shareconn.get('docs', 'default');
    if (sharedoc.data == null) sharedoc.create(req_doc, 'rich-text');

    next();
  });
};
