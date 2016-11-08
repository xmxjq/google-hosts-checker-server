let GoogleIdentifierServer = require('./libs/google_identifier_server');

let singleServer = new GoogleIdentifierServer();

exports = module.exports = singleServer;