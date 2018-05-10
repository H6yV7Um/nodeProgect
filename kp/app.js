var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');

var mongoose = require("./common/mongoose.js");
var db = mongoose();


var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

var app = express();


app.use(cors({
    origin:['http://localhost:3001','http://115.159.161.183:4001','http://kp.mengotech.com'],
    methods:['GET','POST','DELETE'],
    alloweHeaders:['Conten-Type', 'Authorization']
}));

app.use(cookieParser('kangpei'));
app.use(session({
    secret: 'kangpei',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true,
    cookie: {maxAge: 18000000000},
}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render)

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{maxAge:1000*60*60}));

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);

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
