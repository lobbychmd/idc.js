var http = require('http');
var tree_config = require('tree_config').metaTreeConfig;
var mongoose = require('mongoose');
var js_utils = require('js_utils').utils;
/*
 * GET home page.
 */

var getScript = function (metaType, _id, callback) {
    var options = {host: '192.168.1.123',port: 84,path: '/project/getscript?type=' + metaType + "&_id=" + _id, method: 'GET'};
    var req1 = http.request(options, function (res1) {
        res1.on('data', function (chunk) {
            callback(chunk);
        });
    });
    req1.on('error', function (e) {
        callback('');
        console.log('problem with request: ' + e.message);
    });
    req1.end();
}

exports.index = function (req, res) {
    var db = require('mongo');
    //JSON.stringify(data)
    var metatree = require('meta_tree');
    var type = tree_config[req.params.metaType].table;
    var m = mongoose.model(type);
    m.findOne({ ProjectName: req.session.project, _id: req.query._id }, function (err, doc) {
        var str = JSON.stringify([{ type: req.params.metaType, data: doc, children: [] }]);
        getScript(type, req.query._id, function (data) {
            res.render('script.html', {
                tree_data: str, tree_config: require('tree_config').metaTreeTypes, root_script: data,
                layout: null
            });
        });
    });
};

exports.scripts = function (req, res) {
    var script = "";
    js_utils.each_exec(typeof req.body._id == "string"?[req.body._id]: req.body._id,
            function (child, next) {
                var c = child.split('-');
                if (tree_config[c[0]].table && (c.length == 2) && c[1]) {
                    getScript(tree_config[c[0]].table, c[1], function (data) {
                        script = script + "\n" + data;
                        console.log(data);
                        next();
                    });
                }
                else next();
            }, function () {
                res.send(script);
            }, 0);


};


