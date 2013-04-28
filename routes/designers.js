var mongoose = require('mongoose');
var _ = require('underscore');
/*
 * GET home page.
 */

exports.sqlbuilder = function (req, res) {
    var m = mongoose.model("MetaTable");
    m.find({ProjectName: req.session.project}, function (err, docs) { 
        res.render("designer/sqlbuilder.html", { layout: null, tables: docs});
    });

    

};


exports.tablefields = function (req, res) {
    var m = mongoose.model("MetaTable");
    m.findOne({ProjectName: req.session.project, TableName: req.params.table}, function (err, doc) { 
        res.json(   doc);
    });

    

};


exports.queryFields = function (req, res) {
    //var m = mongoose.model("MetaQuery");
    //m.find({ ProjectName: req.session.project }).limit(100).exec(function (err, docs) {
        res.render("designer/queryFields.html", {
            layout: null, queryName: req.params.queryName
           // queries: _.map(docs, function (d) {
            //    return d.QueryName;  })
        });
   // });



};