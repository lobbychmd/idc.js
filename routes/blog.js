var mongoose = require('mongoose');
/*
 * GET home page.
 */

exports.index = function (req, res) {
    var db = require('mongo');
    //JSON.stringify(data)
    var Blog = mongoose.model('Blog');
    Blog.where().desc('At').run(function (err, blogs) {
        res.render('blogs.html', {
            global_data: req.global_data, blogs: blogs, layout: "blog_layout"
        });
    });
    
};

exports.blog = function (req, res) {
    var db = require('mongo');
    var Blog = mongoose.model('Blog');
    Blog.findOne({ _id: req.params._id }, function (err, blog) {
        res.render('blog.html', {
            global_data: req.global_data, blog: blog, layout: "blog_layout"
        });
    });

};

exports.edit = function (req, res) {
    var db = require('mongo');
    var Blog = mongoose.model('Blog');
    Blog.findOne({ _id: req.params._id }, function (err, blog) {
        res.render('blogedit.html', {
            global_data: req.global_data, blog: blog, layout: "blog_layout"
        });
    });

};

exports.add = function (req, res) {
    var db = require('mongo');
    var Blog = mongoose.model('Blog');
    var blog = new Blog();
    blog._id = null;
    res.render('blogedit.html', {
        global_data: req.global_data, blog: blog, layout: "blog_layout"
    });

};

exports.save = function (req, res) {
    var db = require('mongo');
    var Blog = mongoose.model('Blog');
    //req.params._id = req.body._id;
    var doc = req.body;
    doc.At = new Date();
    doc.Author = req.global_data.user.UserNO;
    //doc.Account = req.global_data.user;
    if (req.params._id != "new") {
        Blog.update({ _id: req.params._id }, doc, function (err, numAffected) {
            res.redirect('/blog/show/' + req.params._id);
        });
    } else {
        doc._id = require('mongodb').BSONPure.ObjectID();
        //r.ReturnValues["_id"] = doc._id;
        //req.params._id = doc._id;
        console.log(doc);
        doc = new Blog(doc);
        doc.save(function (err, numAffected) {
            res.redirect('/blog/show/' + doc._id);
        });
    }
};

