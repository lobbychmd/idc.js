
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
db.connect();
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
      //������ disconnect,��Ҫ��������
      //store: new MongoStore({
      //    host:'222.73.240.112', username:'MIS', password:'MISSOLUTION', db: 'idc', collection: 'sessions', reapInterval: 60000 * 5 // 5 minute
      //})
  }));
  app.use(express.static(__dirname + '/public'));
  //app.use(require('filter').login);

  app.use(app.router); //���ò��Ҫ�ź��棬����action ȡ���� session
  
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
app.get('/register', require('./routes/account').register);
app.post('/register', require('./routes/account').reg);
app.get('/account/setting', login, require('./routes/account').setting);
app.post('/account/savesetting', login, require('./routes/account').savesetting);

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
app.get('/suggest', require('./routes/suggest').index);
app.post('/search/:term', require('./routes/search').index);
app.post('/save/:metaType', require('./routes/save').index);
app.post('/saves/:metaType', require('./routes/save').saves);
app.post('/remove/:metaType', require('./routes/save').remove);

app.get('/blog', require('./routes/blog').index);
app.get('/blog/show/:_id', require('./routes/blog').blog);

app.get('/sync/export/:metaType', sync_auth, require('./routes/sync').Export);
app.get('/script/:metaType', login, require('./routes/script').index);
app.post('/scripts', login, require('./routes/script').scripts);

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