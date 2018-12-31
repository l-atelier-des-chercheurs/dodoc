var ShareDB = require('sharedb');
ShareDB.types.register(require('rich-text').type);

module.exports = new ShareDB();
