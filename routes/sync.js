﻿
/*
 * GET home page.
 */

var getparamvalue = function (req, key) {
    return req.params[key] ? req.params[key].toString() : ( req.query[key]? req.query[key] : req.body[key]);
}

var getQuery = function (req) {
    var mongoose = require('mongoose');
    var query = {};
    var metaKeys = require('tree_config').metaKeys[req.params.metaType];

    for (var i in metaKeys) {
        if (typeof metaKeys[i] == "string")
            query[metaKeys[i]] = getparamvalue(req, metaKeys[i]);
        else {
            if (metaKeys[i].nullable && (!getparamvalue(req, metaKeys[i].name))) {
                var q1 = {}; q1[metaKeys[i].name] = '';
                var q2 = {}; q2[metaKeys[i].name] = null;
                //query[metaKeys[i].name] = { "$or": [q1, q2] };
                query["$or"] = [q1, q2];
            }
            else
                query[metaKeys[i].name] = getparamvalue(req, metaKeys[i].name);
        }
    }
    return query;
}


exports.Export = function (req, res) {
    var mongoose = require('mongoose');
    var query = getQuery(req);
    console.log(query);
    if (req.params.metaType.match(".All$")) {
        //  console.log(req.params.metaType.substring(0, req.params.metaType.length - 4));
        var q = { ProjectName: getparamvalue(req, "ProjectName").toString() };
        mongoose.model(req.params.metaType.substring(0, req.params.metaType.length - 4)).find(q, function (err, docs) {
            console.log(docs.length);
            res.send(JSON.stringify(docs));
        });
    }
    else {
        mongoose.model(req.params.metaType).findOne(query, function (err, doc) {
            res.send(JSON.stringify(doc));
        });
    }
};

exports.Import = function (req, res) {
    console.log(req.body);
    var str = "";
    for (var i in req.body) {
        str = str + i + "=" + req.body[i];
        //console.log(i);
        //console.log('-------------');
        //console.log(req.body[i]);
    }
    //console.log(str);
    req.body = JSON.parse(str);
    

    var mongoose = require('mongoose');
    var query = getQuery(req);
    //console.log(query);
    var m = mongoose.model(req.params.metaType);
    m.findOne(query, function (err, doc) {
        if (doc) {
            //console.log(doc._id);
            m.update({ _id: doc._id }, req.body, function (err, numAffected) {
                if (err) res.send(err);
                res.send('');
            });
        } else {
            doc._id = require('mongodb').BSONPure.ObjectID();
            doc.ProjectName = req.params.ProjectName; //是从 filter 里面取得的
            doc = new m(doc);
            doc.save(function (err, numAffected) {
                if (err) res.send(err);
                res.send('');
            });
        }
    });
    
}