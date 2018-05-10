var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');

var index = require('./routes/index');
// var users = require('./routes/users');


var admin = require('./routes/admin/admin');
var site = require('./routes/admin/site');
var wellGroup = require('./routes/admin/wellGroup');
var well = require('./routes/admin/well');

var mysqlorm = require("./common/mysqlorm");

var app = express();

app.use(cors({
  origin:['http://localhost:3001','http://caiyou.uuuf.com','http://cy.uuuf.com'],
  methods:['GET','POST','DELETE'],
  alloweHeaders:['Conten-Type', 'Authorization']
}));

app.use(cookieParser('oilfield'));
app.use(session({
    secret: 'oilfield',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true,
    cookie: {maxAge: 18000000000},
}));

// var oil = express();

// view engine setup

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(mysqlorm());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
// app.use('/users', users);
app.use('/', admin);
app.use('/site', site);
app.use('/wellGroup', wellGroup);
app.use('/well', well);

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
