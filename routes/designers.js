var mongoose = require('mongoose');
var _ = require('underscore');
/*
 * GET home page.
 */

exports.sqlbuilder = function (req, res) {
    var m = mongoose.model("MetaTable");       //不知道为何不生效
    m.find({ProjectName: req.session.project})./*sort("+TableName").*/exec(function (err, docs) { 
        res.render("designer/sqlbuilder.html", { layout: null, tables: docs});
    });
};


exports.tablefields = function (req, res) {
    var m = mongoose.model("MetaTable");
    m.findOne({ ProjectName: req.session.project, TableName: req.params.table }, function (err, doc) {
        var pk = _.find(doc.Indexes, function (i) { return i.PrimaryKey; });
        if (pk) _.each(pk.Columns.trim().split(';'), function (i) {
            _.find(doc.Columns, function (j) { return j.ColumnName == i; })["PK"] = true;
        });
        res.json(doc);
    });
};

exports.findMetaField = function (req, res) {
    var m = mongoose.model("MetaField");
    m.findOne({ProjectName: req.session.project, FieldName: req.params.fieldName, "$or":[
        {Context: null},
        {Context: ""}
    ]}, function (err, doc) { 
        res.json(doc);
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

exports.uiTemplate = function (req, res) {
    require("simulate").MetaQuery(req.session.project, req.params.queryName, function (data) {

        if (typeof (data) == "string")
            try {
                data = JSON.parse(data);
                data.subTable = _.range(1, data.Schema.length -1);
                var error = null;
            } catch (e) {
                var error = data;
            }
        //console.log(data.Schema[0]);
        res.render("designer/uiTemplate1.html", {
            error: error,
            layout: null, queryName: req.params.queryName, pageType: req.params.pageType, metaData: data
        });

    });

};