var shareDBServer = require('./sharedb-server');

const WebSocket = require('ws');
const WebSocketJSONStream = require('websocket-json-stream');
const http = require('http');
const uuid = require('uuid');

const dev = require('./core/dev-log');

module.exports = function(app) {
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
    ws.id = uuid();
    ws.isAlive = true;

    dev.log('A new client (%s) connected.', ws.id);

    // const req_doc =
    //   res.hasOwnProperty('query') && res.query.doc ? res.query.doc : 'default';
    // const sharedoc = shareconn.get('docs', req_doc);
    const sharedoc = shareconn.get('docs', 'default');
    if (sharedoc.data == null) sharedoc.create('default', 'rich-text');

    var stream = new WebSocketJSONStream(ws);
    shareDBServer.listen(stream);

    ws.on('pong', function(data, flags) {
      dev.log('Pong received. (%s)', ws.id);
      ws.isAlive = true;
    });

    ws.on('error', function(error) {
      dev.log('Client connection errored (%s). (Error: %s)', ws.id, error);
    });
  });

  setInterval(function() {
    sharewss.clients.forEach(function(ws) {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
      dev.log('Ping sent. (%s)', ws.id);
    });
  }, 3000);

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
