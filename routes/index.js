
/*
 * GET home page.
 */

exports.index = function (req, res) {
    var db = require('mongo');
    //JSON.stringify(data)
    var metatree = require('meta_tree');
    require('account').getLastState(req.global_data.user._id, req.global_data.project, function (state) {
        metatree.treedata("Root", null, { ProjectName: req.session.project }, state ? state.OpenNodes : null, req.global_data.project,function (data) {
            var str = JSON.stringify(data);
            if ( req.global_data.projects.length == 0)
            res.redirect('/account/setting');
            else
                res.render('index.html', {
                    tree_data: str, tree_config: require('tree_config').metaTreeTypes, lastState: JSON.stringify(state),
                    global_data : req.global_data 
                });
        });
	
    });
};

