
/*
 * GET home page.
 */
var mongoose = require('mongoose');

exports.saveLastState = function (req, res) {
    require('account').saveLastState(req.session.user._id, req.session.project, JSON.parse(req.body.lastState), function (rows) {
        res.json({ IsValid: true, rows: rows });
    });
};


exports.login = function (req, res) {
    res.render("login.html", {layout: false, rel: req.query.rel? req.url.substring(req.url.indexOf('rel=') + 4): "/"});
};

exports.signin = function (req, res) {
    var m = mongoose.model("Account");
    if (req.body.UserNO) {
        m.findOne({ UserNO: req.body.UserNO }, function (err, doc) {
            if (err) res.json({ IsValid: false, Errors: [{ ErrorMessage: err }] });
            else if (!doc) res.json({ IsValid: false, Errors: [{ ErrorMessage: "无此用户", MemberNames: ["UserNO"] }] });
            else {
                var hasher = require('crypto').createHash('md5');
                hasher.update(req.body.UserNO + req.body.Password);
                //if (doc.Password != hasher.digest('hex')) {
                //    res.json({ IsValid: false, Errors: [{ ErrorMessage: "密码不正确", MemberNames: ["UserNO", "Password"] }] });
                // } else
                {
                    req.session.user = doc;
                    require('account').getLastPosition(doc._id, function (err, position) {
                        if (!err) req.session.project = position;
                        res.json({ IsValid: true });
                    });
                }
            }
        });
       
    } else res.json({ IsValid: false, Errors: [{ ErrorMessage: "用户名不能为空", MemberNames: ["UserNO"] }] });
};


exports.logout = function (req, res) {
    delete req.session.user;
    delete req.session.project;
    res.redirect("/login");
};
 
exports.register = function (req, res) {
    res.render("register.html", {layout: false});
};

exports.reg = function (req, res) {
    var m = mongoose.model("Account");
    if (req.body.UserNO) {
        m.findOne({ UserNO: req.body.UserNO }, function (err, doc) {
            if (err) res.json({ IsValid: false, Errors: [{ ErrorMessage: err }] });
            else if (doc)   res.json({ IsValid: false, Errors: [{ ErrorMessage:"用户已存在", MemberNames: ["UserNO"] }] });
            else {
                var hasher = require('crypto').createHash('md5');
                hasher.update(req.body.UserNO + req.body.Password);
                req.body.Password = hasher.digest('hex');
                m.update(null, req.body, function (err, rows) {
                    if (err) res.json({ IsValid: false, Errors: [{ ErrorMessage: err }] });
                    else res.json({ IsValid: true });
                });
            }
        });
    } else res.json({ IsValid: false, Errors: [{ ErrorMessage: "用户名不能为空", MemberNames: ["UserNO"] }] });
    
};

exports.updateposition = function (req, res) {
    var account = require('account');
    account.user_projects(req.session.user._id, function (projects) {
        var auth = false;
        for (var j in projects) {
            if (projects[j]._id.toString() == req.params.position){
                req.session.project = req.params.position;
                auth = true;
                account.saveLastPosition(req.session.user._id, req.params.position, function () {
                    res.json({ IsValid: true });
                });
                break;
            }
        }
       if (!auth) res.json({ IsValid: false, Errors: [{Message: "没有这个项目的权限"}] });
    });
};

exports.setting = function (req, res) {
    //console.log(req.global_data);
    var m = mongoose.model("Project");
    m.find({ Account: req.session.user._id }, function (err, docs) {
        var projects = [];
        var Account = mongoose.model("Account");
        Account.find({ Guest: false }, function (err, users) {
            var accs = [];
            for (var u in users) {
                var chk = false;
                for (i = 0 ; i < docs[0].Users.length; i++) {
                    if (docs[0].Users[i].toString() == users[u]._id.toString()) chk = true;
                }
                accs.push({user: users[u], chk:chk});
            }
            res.render("setting.html", { global_data: req.global_data, projects: docs, users: accs });
        });
    });
    
};

exports.savesetting = function (req, res) {
    var users = [];
    for (var i in req.body.Users)
        users.push(i);
    req.body.Users = users;
    var m = mongoose.model("Project");
    m.update({ Account: req.session.user._id }, req.body, function (err, rows) {
        if(err) console.log(err);
        res.json({ IsValid: true , Errors:[]});
    });
    
};

