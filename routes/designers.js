var mongoose = require('mongoose');
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
