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
        console.log(blog);
        res.render('blog.html', {
            global_data: req.global_data, blog: blog, layout: "blog_layout"
        });
    });

};

