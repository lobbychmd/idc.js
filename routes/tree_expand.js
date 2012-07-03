
/*
 * GET home page.
 */

exports.tree_expand = function (req, res) {
    var db = require('mongo');
    var metatree = require('meta_tree');
    metatree.treedata(req.query.type, req.query._id, null, null, req.session.project, function (data) {
        //var str = JSON.stringify();
        //res.render('tree_expand', { layout:false,  tree_data: str });
        res.json(data);
    });
};

