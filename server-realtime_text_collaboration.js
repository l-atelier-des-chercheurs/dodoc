const ShareDB = require('sharedb');
const richText = require('rich-text');

const WebSocket = require('ws');
const WebSocketJSONStream = require('websocket-json-stream');
const http = require('http');

ShareDB.types.register(richText.type);

module.exports = function(app) {
  // Share DB
  const share = new ShareDB();
  const shareconn = share.connect();
  const shareserver = http.createServer();
  const sharewss = new WebSocket.Server({ server: shareserver });
  sharewss.on('connection', client =>
    share.listen(new WebSocketJSONStream(client))
  );
  shareserver.listen(8079);
  console.log(`index.js • init: sharedb listening on 8079`);

  app.use((res, req, next) => {
    console.log(`app • requested page`);

    // Create the document if it hasn't been already
    const req_doc = res.query.doc || 'default';
    const sharedoc = shareconn.get('docs', req_doc);
    //   const sharedoc = shareconn.get('docs', 'default');
    if (sharedoc.data == null) sharedoc.create(req_doc, 'rich-text');

    next();
  });
};
