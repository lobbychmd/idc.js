
/*
 * GET home page.
 */

var getparamvalue = function (req, key) {
    return req.params[key] ? req.params[key] : req.query[key];
}

exports.Export = function (req, res) {
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
                query[metaKeys[i].name] = { "$or": [q1, q2] };
                
            }
            else 
		query[metaKeys[i].name] = getparamvalue(req, metaKeys[i].name);
		
            
        }
    }
    if (req.params.metaType == "MetaModule.All") {
        mongoose.model("MetaModule").find({ ProjectName: getparamvalue(req, "ProjectName")}, function (err, docs) {
            res.send(JSON.stringify(docs));
        });
    }
    else {
       console.log(query);
        mongoose.model(req.params.metaType).findOne(query, function (err, doc) {
            res.send(JSON.stringify(doc));
        });
    }
};

