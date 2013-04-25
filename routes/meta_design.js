var tree_config = require('tree_config').metaTreeConfig;
var mongoose = require('mongoose');
var metatree = require('meta_tree');
var js_utils = require('js_utils').utils;

exports.index = function (req, res) {
    var db = require('mongo');
    mongoose.model(tree_config[req.params.metaType].table).findById(req.query._id, function (err, doc1) {
        var newMeta = !doc1;
        console.log(req.query);
        require('meta_tree').inherite(req.query, doc1, function (doc) {
            var HashCode = doc.HashCode;
            doc.HashCode = null;
            var docstr = JSON.stringify(doc);
            var hashcode = require('js_utils').hashcode(docstr);
            //console.log(docstr);console.log(HashCode);console.log(hashcode);
            doc.HashCode = HashCode;
            
            require('meta_version').version_info(tree_config[req.params.metaType].table, doc._id, hashcode, function (err, version_info) {
                res.render('design.html', {
                    layout: false, _id: req.query._id, metaType: req.params.metaType,
                    model: docstr, id: req.query._id?req.query._id:Math.random().toString().substring(2),
                    newMeta: newMeta, parent_id: req.query.parent_id, version_info: version_info
                });
            });
        })
       
    });
    
};

exports.designs = function (req, res) {
    var db = require('mongo');
    metatree.treedata(req.params.metaType, req.query._id, null, null, req.session.project, function (data) {
        var docs = [];
        var type = tree_config[tree_config[req.params.metaType].children[0].type].table;
        var m = mongoose.model(type);
        js_utils.each_exec(data,
            function (child, next) {
                m.findOne({ _id: child.data._id }, function (err, doc) {
                    if (!doc) doc = child.data;
                    docs.push(doc);
                    next();
                })
                
            }, function () {

                var docstr = JSON.stringify(docs);
                res.render('designs.html', {
                    layout: false, _id: req.query._id, metaType: type,
                    model: docstr,
                    parent_id: req.query.parent_id
                })
            }, 0);

        
    });

};


exports.AddVersion = function (req, res) {
    var db = require('mongo');

    require('meta_version').add_version(tree_config[req.params.metaType].table, req.query._id, function (msg) {
        res.send(msg);
    });

};
