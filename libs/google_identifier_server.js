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
let config = require('config');

let argv = yargs.argv;

let GoogleIdentifier = require('../client/libs/google_identifier');

class GoogleIdentifierServer {
    constructor() {
        this.mergedAvailableIps = [];
        this.unionAvailableIps = [];

        this.idAvailableIpTable = {};

        this.ipWhitelist = config.get("defaultIpWhiteList");
        this.ipBlacklist = config.get("defaultIpBlackList");

        this.checkedMergedAvailableIps = [];
        this.checkedUnionAvailableIps = [];
        this.checkFlag = false;
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
        let tempUnionArray = [];

        _.forEach(this.idAvailableIpTable, function (singleArray, id, table) {
            if (_.isNull(tempMergedArray)) {
                tempMergedArray = singleArray;
            }
            else {
                tempMergedArray = _.intersection(tempMergedArray, singleArray);
            }
            tempUnionArray = _.union(tempUnionArray, singleArray);
        });

        tempMergedArray = _.difference(tempMergedArray, this.ipBlacklist);
        tempUnionArray = _.difference(tempUnionArray, this.ipBlacklist);

        tempMergedArray = _.union(tempMergedArray, this.ipWhitelist);
        tempUnionArray = _.difference(tempUnionArray, this.ipWhitelist);

        if (!_.isNull(tempMergedArray) && !_.isEmpty(tempMergedArray)) {
            this.mergedAvailableIps = tempMergedArray;
        }
        else {
            this.mergedAvailableIps = [];
        }
        this.unionAvailableIps = tempUnionArray;
    }

    checkAllAvailableIps() {
        if (!this.checkFlag) {
            this.checkFlag = true;
            let identifier = new GoogleIdentifier();
            let self = this;

            return co(function *(){
                let tempCheckedMergedAvailableIps = [];
                let tempCheckedUnionAvailableIps = [];

                console.log("Start to check all mergedAvailableIps");
                // check merged available ips
                yield Promise.map(
                    self.mergedAvailableIps,
                    function (singleIp, key, length) {
                        return co(function *() {
                            let checkResult = yield identifier.checkGoogleIpAvailability(singleIp);
                            if (checkResult) {
                                tempCheckedMergedAvailableIps.push(singleIp);
                            }
                        });
                    },
                    {
                        concurrency: config.get('serverConfig.scanConcurrency')
                    }
                );

                console.log("Start to check all unionAvailableIps");
                // check union available ips
                yield Promise.map(
                    self.unionAvailableIps,
                    function (singleIp, key, length) {
                        return co(function *() {
                            let checkResult = yield identifier.checkGoogleIpAvailability(singleIp);
                            if (checkResult) {
                                tempCheckedUnionAvailableIps.push(singleIp);
                            }
                        });
                    },
                    {
                        concurrency: config.get('serverConfig.scanConcurrency')
                    }
                );

                self.checkedMergedAvailableIps = tempCheckedMergedAvailableIps;
                self.checkedUnionAvailableIps = tempCheckedUnionAvailableIps;
                self.checkFlag = false;
            });
        }
    }

    updateWhiteList(whitelist) {
        if (_.isArray(whitelist)) {
            this.ipWhitelist = whitelist;
        }
    }

    updateBlackList(blacklist) {
        if (_.isArray(blacklist)) {
            this.ipBlacklist = blacklist;
        }
    }
}

exports = module.exports = GoogleIdentifierServer;