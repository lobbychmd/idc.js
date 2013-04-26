var mongoose = require('mongoose');
var http = require('http');

exports.index = function (req, res) {
    var m = mongoose.model("Project");
    m.findById(req.session.project, function (error, doc) {
        var url = "http://localhost:" + doc.SimulateCode + "/simulate/preparequery/" + req.body.QueryName;
        console.log(url);

        var options = { host: "localhost", port: doc.SimulateCode, path: '/simulate/preparequery/' + req.body.QueryName, method: 'GET' };
        var req1 = http.request(options, function (res1) {
            res1.setEncoding('utf8');
            res1.on('data', function (chunk) {
                console.log(chunk);
                res.json({ IsValid: false, Errors: [{ ErrorMessage: chunk}] });
            });
        });
        req1.on('error', function (e) {
            res.json({ IsValid: false, Errors: [{ ErrorMessage: e.message}] });
            console.log('problem with request: ' + e.message);
        });
        req1.end();


    });



}