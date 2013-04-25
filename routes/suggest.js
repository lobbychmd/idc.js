
/*
 * GET home page.
 */

exports.index = function (req, res) {
    require('search_tree').suggest(req.query.term, 20,req.session.project, function (data) {
        res.json(data);

    });
};

