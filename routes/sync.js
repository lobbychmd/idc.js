var _ = require("underscore");
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
    //console.log(req.url);
    if (req.params.metaType.match(".[Aa]ll$")) {
        var q = { ProjectName: getparamvalue(req, "ProjectName").toString() };
        mongoose.model(req.params.metaType.substring(0, req.params.metaType.length - 4)).find(q, function (err, docs) {
            //console.log(docs.length);
            res.send(JSON.stringify(docs));
        });
    }
    else if (req.params.metaType.match(".category$")) {
        var q = { ProjectName: getparamvalue(req, "ProjectName").toString() };
        mongoose.model(req.params.metaType.substring(0, req.params.metaType.length - 9)).find(q,
            _.map(require('tree_config').metaKeys[req.params.metaType.substring(0, req.params.metaType.length - 9)],
                function (i) { return typeof i == "string" ? i : i.FieldName; }).join(" "),
            function (err, docs) {
                res.send(JSON.stringify(docs));
            });
    }
    else {
        var query = getQuery(req);
        //console.log(query);
        mongoose.model(req.params.metaType).findOne(query, function (err, doc) {
            res.send(JSON.stringify(doc));
        });
    }
};

var body2str = function (body) {
    var str = "";
    for (var i in body) {
        //console.log(i);
        var v = ((typeof body[i]) == "string" ? body[i] :("[" + body2str(body[i])));
        str = str + i + (i[i.length-1] ==":" || !v? "": ":") + v;
    }
    return str;
}
exports.Import = function (req, res) {
    //console.log(req.body);
    //console.log(JSON.stringify( req.body));
    var str =body2str(req.body);
    if (str[str.length - 1] == "=") str = str.substring(0, str.length - 1);
    if (str[str.length - 1] != "}") str = str +"}";
    //console.log(str);
    req.body = JSON.parse(str);
  
    var mongoose = require('mongoose');
    var query = getQuery(req);
    console.log(query);
    var m = mongoose.model(req.params.metaType);
    m.findOne(query, function (err, doc) {
        if (doc) {
            m.update({ _id: doc._id }, req.body, function (err, numAffected) {
                if (err) res.send(err);
                res.send('');
            });
        } else {
            req.body._id = require('mongodb').BSONPure.ObjectID();
            doc = new m(req.body);
            
            doc.ProjectName = req.params.ProjectName; //是从 filter 里面取得的
            console.log(doc);
            doc.save(function (err, numAffected) {
                if (err) res.send(err);
                res.send('');
            });
        }
    });

}

exports.metaDDL = function (req, res) {
    res.send(require("schema").metaDDL());
}