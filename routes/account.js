
var mongoose = require('mongoose');
var _ = require("underscore");

exports.saveLastState = function (req, res) {
    require('account').saveLastState(req.session.user._id, req.session.project, JSON.parse(req.body.lastState), function (rows) {
        res.json({ IsValid: true, rows: rows });
    });
};


exports.login = function (req, res) {
    res.render("account/login.html", {layout: false, rel: req.query.rel? req.url.substring(req.url.indexOf('rel=') + 4): "/"});
};

exports.signin = function (req, res) {
    var m = mongoose.model("Account");
    if (req.body.UserNO) {
        m.findOne({ UserNO: req.body.UserNO }, function (err, doc) {
            if (err) res.json({ IsValid: false, Errors: [{ ErrorMessage: err}] });
            else if (!doc) res.json({ IsValid: false, Errors: [{ ErrorMessage: "无此用户", MemberNames: ["UserNO"]}] });
            else {
                var hasher = require('crypto').createHash('sha1');
                hasher.update(req.body.UserNO + req.body.Password);
                var p = hasher.digest('hex');
                if (doc.Password != p) {
                    console.log("密码：" + p);
                    res.json({ IsValid: false, Errors: [{ ErrorMessage: "密码不正确", MemberNames: ["UserNO", "Password"]}] });
                } else {
                    req.session.user = doc;
                    require('account').getLastPosition(doc._id, function (err, position) {
                        if (!err) req.session.project = position;
                        res.json({ IsValid: true });
                    });
                }
            }
        });

    } else res.json({ IsValid: false, Errors: [{ ErrorMessage: "用户名不能为空", MemberNames: ["UserNO"]}] });
};


exports.logout = function (req, res) {
    delete req.session.user;
    delete req.session.project;
    res.redirect("/login");
};
 
exports.register = function (req, res) {
    res.render("account/register.html", {layout: false});
};

exports.reg = function (req, res) {
    var m = mongoose.model("Account");
    if (!req.body.UserNO)
        res.json({ IsValid: false, Errors: [{ ErrorMessage: "用户名不能为空", MemberNames: ["UserNO"]}] });
    else if (!req.body.Password)
        res.json({ IsValid: false, Errors: [{ ErrorMessage: "用户密码不能为空", MemberNames: ["Passsword"]}] });
    else if (!req.body.InviteCode)
        res.json({ IsValid: false, Errors: [{ ErrorMessage: "邀请码不能为空", MemberNames: ["Passsword"]}] });
    else {
        var m1 = mongoose.model("InviteCode");
        m1.findOne({ Code: req.body.InviteCode, UseTime: null }, function (err1, doc1) {
            if (err1) res.json({ IsValid: false, Errors: [{ ErrorMessage: JSON.stringify(err1)}] });
            else if (!doc1)
                res.json({ IsValid: false, Errors: [{ ErrorMessage: "邀请码不存在或者已被使用", MemberNames: ["InviteCode"]}] });
            else {
                m.findOne({ UserNO: req.body.UserNO }, function (err, doc) {
                    if (err) res.json({ IsValid: false, Errors: [{ ErrorMessage: JSON.stringify(err)}] });
                    else if (doc) res.json({ IsValid: false, Errors: [{ ErrorMessage: "用户已存在", MemberNames: ["UserNO"]}] });
                    else {
                        var hasher = require('crypto').createHash('sha1');
                        hasher.update(req.body.UserNO + req.body.Password);
                        var newUser = new m({ UserNO: req.body.UserNO, Password: hasher.digest('hex'), Guest: false });
                        newUser._id = require('mongodb').BSONPure.ObjectID();
                        newUser.save(function (err, numAffected) {
                            if (err) res.json({ IsValid: false, Errors: [{ ErrorMessage: JSON.stringify(err)}] });
                            else {
                                doc1.UseTime = new Date();
                                doc1.AccountID = newUser._id;
                                doc1.save();
                                res.json({ IsValid: true });
                            }
                        });

                    }
                });
            }
        });


    }

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
        var newPrj = {   };
        docs.push(newPrj);
        var project_idx = 0;
        if (req.params.project_id) {
            for (var p in docs)
                if (docs[p]._id == req.params.project_id) {
                    break;
                } else project_idx++;
        }
        else {
            project_idx = docs.length - 1;

        }
        var project = docs[project_idx];

        var accs = [];
        var Account = mongoose.model("Account");
        Account.find({ Guest: false }, function (err, users) {
            var accs = _.map(project.Users, function (u) {
                return { user: _.find(users, function (u1) { 
                    return u.toString() == u1._id.toString();
                }), chk: true };
            });

             
            res.render("setting.html", { global_data: req.global_data, projects: docs, users: accs, project: project, project_idx: project_idx });
        });

        //res.render("setting.html", { global_data: req.global_data, projects: docs, users: accs, project: project, project_idx: project_idx });
    });
};

exports.savesetting = function (req, res) {
    var users = [];
    for (var i in req.body.Users)
        users.push(i);
    req.body.Users = users;

    var id = req.body._id;
    delete req.body._id;

    var m = mongoose.model("Account");
    m.findOne({ _id: req.global_data.user._id }, function (err2, doc) {
        m.update({ _id: req.global_data.user._id }, { UserName: req.body.UserName }, function (err1, numAffected) {
            if (err1) console.log(err1);
            else {
                req.global_data.user.UserName = req.body.UserName;
                req.session.user = req.global_data.user;
                m = mongoose.model("Project");
                if (id) {
                    m.update({ _id: id }, req.body, function (err, rows) {
                        if (err) {
                            console.log(err);
                            res.json({ IsValid: false, Errors: { ErrorMessage: JSON.stringify(err)} });
                        }
                        res.json({ IsValid: !err, Errors: err1 });
                    });
                }
                else {
                    var newPrj = new m(req.body);
                    newPrj.Account = req.global_data.user._id;
                    newPrj.save(function (err, rows) { 
                        if (err) {
                            console.log(err);
                            res.json({ IsValid: false, Errors: { ErrorMessage: JSON.stringify(err)} });
                        }
                        res.json({ IsValid: !err, Errors: err1 });
                    })
                }
            }
        });

    });

};

exports.findUser = function (req, res) {
    var m = mongoose.model("Account");
    m.findOne({ UserNO: req.params.UserNO }, function (err, doc) {
        res.json(doc);
    })

};

exports.changepwd = function (req, res) {
    res.render("changepwd.html", { global_data: req.global_data });

};

exports.updatepwd = function (req, res) {
    var Errors = [];
    if (!req.body.password) Errors.push({ ErrorMessage: "密码不能为空", MemberNames:["password"] });
    if (req.body.password != req.body.new_password) Errors.push({ ErrorMessage: "新密码两次输入不匹配", MemberNames: ["password", "new_password"] });

    if (Errors.length != 0) res.json({ IsValid: false, Errors: Errors });
    else {
        var m = mongoose.model("Account");
        
        m.findOne({ _id: req.global_data.user._id }, function (err, doc) {
            //  if (err) res.json({ IsValid: false, Errors: [{ ErrorMessage: err }] });
           // console.log("修改 " + doc.UserNO + " 密码");
            var hasher = require('crypto').createHash('sha1');
            hasher.update(doc.UserNO + req.body.old_password);
            if (hasher.digest('hex') != doc.Password) {
                Errors.push({ ErrorMessage: "旧密码错误", MemberNames: ["old_password"] });
                res.json({ IsValid: false, Errors: Errors });
            }
            else {
                hasher = require('crypto').createHash('sha1');
                hasher.update(doc.UserNO + req.body.password);
                m.update({ _id: doc._id }, { Password: hasher.digest('hex') }, function (err, numAffected) {
                    if (err) r.Errors.push({ ErrorMessage: JSON.stringify(err) });
                    res.json({ IsValid: Errors.length == 0, Errors: Errors });
                });
            }
        });
    }
    
};
