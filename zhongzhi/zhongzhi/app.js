var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var apply = require('./routes/apply');
var germplasm = require('./routes/germplasm');
var query = require('./routes/query');
var pic = require('./routes/pic');

var app = express();
var webapi = express();

app.use(cors({
  origin:['http://localhost:8080','http://localhost:3001','http://192.168.2.220:8080','http://zhongzhi.mengotech.com:8080'],
  methods:['GET','POST','DELETE'],
  alloweHeaders:['Conten-Type', 'Authorization']
}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/pic',pic);
app.use('/webapi', webapi);
webapi.use('/query', query);
webapi.use('/users', users);
webapi.use('/apply', apply);
webapi.use('/germplasm', germplasm);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
