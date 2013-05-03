
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , MongoStore = require('connect-mongo')(express);

var app = module.exports = express.createServer();
var linq = require('linq');
// Configuration

var login = require('filter').login;
var sync_auth = require('filter').sync_auth;
var db = require('mongo');
//db.connect();
db.connect();

app.configure(function(){
  app.set('views', __dirname + '/views');
//  app.set('view engine', 'jade');
  app.set('view engine', 'jqtpl');
  app.register(".html", require("jqtpl").express);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  app.use(express.cookieParser());
  app.use(express.session({
      secret: "keyboard cat",
      //经常会 disconnect,需要重启服务
      //store: new MongoStore({
      //    host:'222.73.240.112', username:'MIS', password:'MISSOLUTION', db: 'idc', collection: 'sessions', reapInterval: 60000 * 5 // 5 minute
      //})
  }));
  app.use(express.static(__dirname + '/public'));
  //app.use(require('filter').login);
  app.use(app.router); //这个貌似要放后面，否则action 取不到 session
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/login', require('./routes/account').login);
app.get('/logout', require('./routes/account').logout);
app.post('/login', require('./routes/account').signin);
app.post('/account/signin', require('./routes/account').signin);
app.get('/register', require('./routes/account').register);
app.post('/register', require('./routes/account').reg);
app.get('/account/setting', login, require('./routes/account').setting);
app.get('/account/changepwd', login, require('./routes/account').changepwd);
app.get('/account/setting/:project_id', login, require('./routes/account').setting);
app.post('/account/savesetting', login, require('./routes/account').savesetting);
app.post('/account/findUser/:UserNO', login, require('./routes/account').findUser);
app.post('/account/updatepwd', login, require('./routes/account').updatepwd);

app.post('/updateposition/:position', require('./routes/account').updateposition);

app.get('/', login, routes.index);

app.get('/tree_config.js', function (req,res) {
    res.send("metaTreeConfig=" + JSON.stringify( require('tree_config').metaTreeConfig));
});
app.post('/saveLastState', require('./routes/account').saveLastState);
app.get('/tree', require('./routes/tree_expand').tree_expand);
app.get('/design/:metaType', require('./routes/meta_design').index);
app.get('/designs/:metaType', require('./routes/meta_design').designs);
app.post('/addversion/:metaType', require('./routes/meta_design').AddVersion);
app.get('/suggest/:metaType', require('./routes/suggest').index);
app.get('/suggest', require('./routes/suggest').index);
app.post('/search/:term', require('./routes/search').index);
app.post('/searchbyid/:type/:id', require('./routes/search').byid);
app.post('/save/:metaType', require('./routes/save').index);
app.post('/saves/:metaType', require('./routes/save').saves);
app.post('/remove/:metaType', require('./routes/save').remove);

app.get('/blog', login, require('./routes/blog').index);
app.get('/blog/edit/:_id', login, require('./routes/blog').edit);
app.get('/blog/add', login, require('./routes/blog').add);
app.get('/blog/show/:_id', login, require('./routes/blog').blog);
app.post('/blog/save/:_id', login, require('./routes/blog').save);

app.get('/sync/export/:metaType', sync_auth, require('./routes/sync').Export);
app.post('/sync/import/:metaType', sync_auth, require('./routes/sync').Import);
app.get('/sync/metaDDL', require('./routes/sync').metaDDL);

app.get('/script/:metaType', login, require('./routes/script').index);
app.post('/scripts', login, require('./routes/script').scripts);

app.get('/test', require('./routes/test').test);
app.post('/test', require('./routes/test').test);

app.get('/sqlbuilder', require('./routes/designers').sqlbuilder);
app.get('/queryFields/:queryName', require('./routes/designers').queryFields);
app.get('/findMetaField/:fieldName', require('./routes/designers').findMetaField);

app.post('/tablefields/:table', require('./routes/designers').tablefields);

app.post('/simulate/:metaType', require('./routes/simulate').index);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});


app.on('close', function(errno){
  db.disconnect(function(err){
    //
  });
});

//console.log(jslinq );
//Enumerable.Range(1, 3).Select(function (value, index) { return index + ':' + value }).WriteLine();
