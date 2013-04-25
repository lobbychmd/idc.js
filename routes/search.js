
/*
 * GET home page.
 */

exports.index = function (req, res) {
    require('search_tree').search(req.params.term, 100, req.session.project, function (data) {
        res.json(data);

    });
};

exports.byid = function (req, res) {
    require('search_tree').searchbyid(req.params.type,req.params.id, req.session.project, function (data) {
        res.json(data);
    });
};

