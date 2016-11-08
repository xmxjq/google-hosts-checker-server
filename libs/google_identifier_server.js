let Promise = require('bluebird');
let co = require('co');
let _ = require('lodash');
let fs = require('mz/fs');
let path = require('path');
let yargs = require('yargs');
let util = require('util');
let request = require('request');
let rp = require('request-promise');
let ip = require('ip');
let cidrRange = require('cidr-range');

let argv = yargs.argv;

class GoogleIdentifierServer {
    constructor() {
        this.mergedAvailableIps = [];
        this.idAvailableIpTable = {};
    }

    addOrUpdateNewAvailableIps(id, ipArray) {
        this.idAvailableIpTable[id] = ipArray;
        this.refreshMergedAvailableIps();
    }
    
    deleteAvailableIps(id) {
        if (_.has(this.idAvailableIpTable, id)) {
            delete this.idAvailableIpTable[id];
        }
        this.refreshMergedAvailableIps();
    }

    refreshMergedAvailableIps() {
        let self = this;
        let tempMergedArray = null;
        _.forEach(this.idAvailableIpTable, function (singleArray, id, table) {
            if (_.isNull(tempMergedArray)) {
                tempMergedArray = singleArray;
            }
            else {
                tempMergedArray = _.intersection(tempMergedArray, singleArray);
            }
        });
        this.mergedAvailableIps = tempMergedArray;
    }    
}

exports = module.exports = GoogleIdentifierServer;