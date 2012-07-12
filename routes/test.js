var mongoose = require('mongoose');
/*
 * GET home page.
 */

exports.test = function (req, res) {
    console.log(req.body);
    res.render("test.html");
    
};

