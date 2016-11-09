let express = require('express');
let router = express.Router();
let singleServer = require('../single_server');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/submit_ip_array', function (req, res) {
    let id = req.body.id;
    let ipArray = req.body.ip_array;
    singleServer.addOrUpdateNewAvailableIps(id, ipArray);
    res.send(JSON.stringify({
        return_code: 1,
        mesg: 'success'
    }));
});

router.post('/delete_ip_array', function (req, res) {
    let id = req.body.id;
    singleServer.deleteAvailableIps(id);
    res.send(JSON.stringify({
        return_code: 1,
        mesg: 'success'
    }));
});

router.post('/update_ip_whitelist', function (req, res) {
    let ipArray = req.body.ip_array;
    singleServer.updateWhiteList(ipArray);
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.ipWhitelist
    }));
});

router.post('/update_ip_blacklist', function (req, res) {
    let ipArray = req.body.ip_array;
    singleServer.updateBlackList(ipArray);
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.ipBlacklist
    }));
});

router.get('/ip_blacklist', function (req, res) {
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.ipBlacklist
    }));
});

router.get('/ip_whitelist', function (req, res) {
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.ipWhitelist
    }));
});

router.get('/ip_array', function (req, res) {
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.mergedAvailableIps
    }));
});

router.get('/union_ip_array', function (req, res) {
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.unionAvailableIps
    }));
});

router.get('/checked_ip_array', function (req, res) {
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.checkedMergedAvailableIps
    }));
});

router.get('/checked_union_ip_array', function (req, res) {
    res.send(JSON.stringify({
        return_code: 1,
        ip_array: singleServer.checkedUnionAvailableIps
    }));
});

router.get('/full_ip_array', function (req, res) {
    res.send(JSON.stringify({
        return_code: 1,
        full_ip_array: singleServer.idAvailableIpTable
    }));
});

module.exports = router;
