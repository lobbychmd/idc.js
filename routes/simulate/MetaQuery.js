var mongoose = require('mongoose');
var http = require('http');

exports.index = function (req, res) {
    require("simulate").MetaQuery( req.session.project, req.body.QueryName, function(data){
        res.json(data);
    });
      

}