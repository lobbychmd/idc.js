var js_utils = require('js_utils').utils;
/*
 * GET home page.
 */

exports.index = function (req, res) {
    //console.log(req.body);
    if (!req.body.ProjectName) req.body.ProjectName = req.session.project;
    require('meta_update').save(req.params.metaType, req.query._id, req.body, function (result) {
        res.json(result);
    });
};

exports.saves = function (req, res) {
    //console.log(req.body);
    var Errors = [];
    js_utils.each_exec(req.body.multi,
            function (child, next) {
                if (!child.ProjectName) child.ProjectName = req.session.project;
                require('meta_update').save(req.params.metaType, null, child, function (err, rows) {
                    if (err) Errors.push({ErrorMessage: JSON.stringify(err)});
                    next();
                });
            }, function () {
                res.json({ IsValid: !Errors, Errors: Errors });
            }, 0);
    //if (!req.body.ProjectName) req.body.ProjectName = req.session.project;
    //require('meta_update').save(req.params.metaType, req.query._id, req.body, function (err, rows) {
        
    //});
};

exports.remove = function (req, res) {
    //console.log(req.body);
    require('meta_update').remove(req.params.metaType, req.query._id, req.body, function (err, rows) {
        res.json({ IsValid: true });
    });
};


