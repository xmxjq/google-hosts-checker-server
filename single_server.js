let GoogleIdentifierServer = require('./libs/google_identifier_server');
let later = require('later');
let config = require('config');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let singleServer = new GoogleIdentifierServer();

let sched = {};
later.date.localTime();

let checkSched = later.parse.text(config.get("serverConfig.checkCron"));
sched.checkScanTimer = later.setInterval(function () {
    return singleServer.checkAllAvailableIps();
}, checkSched);

exports = module.exports = singleServer;