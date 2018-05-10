var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require("./common/config");
var mongoose = require("./common/mongoose.js");
var db = mongoose();

var index = require('./routes/index');
var users = require('./routes/users');
var adminuser = require('./routes/adminuser');
var advertisement = require('./routes/advertisement');
var advertise = require('./routes/advertise');
var pic = require('./routes/pic');
var goodsclass = require('./routes/goodsclass');
var teacher = require('./routes/teacher');
var track = require('./routes/track');
var circle = require('./routes/circle');
var service = require('./routes/service');
var course = require('./routes/course');
var goodsadmin = require('./routes/goodsadmin');
var system = require('./routes/system');
var appteacher = require('./routes/appteacher');
var appcourse = require('./routes/appcourse');
var admincompany = require('./routes/admincompany');
var appindex = require('./routes/appindex');
var ctypeadmin = require('./routes/ctypeadmin');
var cshopadmin = require('./routes/cshopadmin');
var cgoodsadmin = require('./routes/cgoodsadmin');
var activityadmin = require('./routes/activityadmin');
var officeadmin = require('./routes/officeadmin');
var stationadmin = require('./routes/stationadmin');
var boardadmin = require('./routes/boardadmin');
var roadshowadmin = require('./routes/roadshowadmin');
var check = require('./routes/check');
var office = require('./routes/office');
var lock = require('./routes/lock');
var mediaadmin = require('./routes/mediaadmin');
var lockadmin = require('./routes/lockadmin');
var orderadmin = require('./routes/orderadmin');
var integraladmin = require('./routes/integraladmin');
var pay = require('./routes/pay');
var login = require('./routes/login');
var adminuseradmin = require('./routes/adminuseradmin');
var printadmin = require('./routes/printadmin');
var interspaceadmin = require('./routes/interspaceadmin');
var enterpriseadmin = require('./routes/enterpriseadmin');
var financeadmin = require('./routes/financeadmin');
var meetreception = require('./routes/meetreception');
var interspacefinance = require('./routes/interspacefinance');
var gymadmin = require('./routes/gymadmin');
var gymcoachadmin = require('./routes/gymcoachadmin');
var policyadmin = require('./routes/policyadmin');
var policy = require('./routes/policy');
var messageadmin = require('./routes/messageadmin');
var integralconf = require('./routes/integralconf');
var visitadmin = require('./routes/visitadmin');
var timetask = require('./routes/timetask');
var serviceadmin = require('./routes/serviceadmin');

var Visit = db.model("Visit");

var app = express();
var api = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//
// app.use(function(req, res, next){
//   console.log(req.headers)
//   next()
// });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use();




app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({
//   secret: 'htdc2017',
//   name: 'htdc',
//   cookie: {maxAge: 18000000000},
//   resave: false,
//   saveUninitialized: true,
//
// }));



// //对所有POST API 进行操作记录
app.use(function (req, res, next) {
    // console.log('这是一个中间件:', Date.now());
    //判断方法是否为POST请求
    //取Url链接，然后进行/拆分
    let string = req.originalUrl    //   /1.0/users/getuser/123/123/456/789
    let data  = string.split("/")   // ["","1.0","users","getuser","123","24124","513251"]
    //判断是否为App接口
    if(data[1] == "1.0"){
        //存储基本信息
        var obj = {
            functionClass : data[2] ,  // 模块
            functionName : data[3] ,   // 方法名
            Method       : req.method ,   // 方法类型
            type       : 1 ,   // 方法类型
            createTime : Date.now() ,    //创建时间
            paramsList :[],
        }
        //将方法附带参数信息存入body 或 paramsList中
        if(req.method == "POST"){
            console.log("中间件处理POST请求")
            obj.body = req.body
        }else if(req.method == "GET"){
            console.log("中间件处理Get请求")
            obj.paramsList   = data.splice(4,data.length-1)
        }else if(req.method == "PATCH"){
            console.log("中间件处理PATCH请求")
            obj.paramsList   = data.splice(4,data.length-1)
            obj.body  = req.body
        }
        //单独存储userId （GET请求在此方法中无法获取到对应到键的params，因此只存储body中含有userid的方法）
        if(req.body.userid != null && req.body.userid != undefined){
            obj.userId   =   req.body.userid
        }
        //记录此次操作
        console.log("存储信息结果集:")
        console.log(obj)

        let visit = new Visit(obj)

        visit.save({},function(err,visit_save){
            console.log('正在存储')
            console.log(visit)
            if(err){
                console.log('失败')
                console.log(err)
                next();
            }else{
                console.log('成功')
                next();
            }
        })
    }else{
        next();
    }
});



app.use(session({
  saveUninitialized: true,
  resave: false,
  cookie:{maxAge: 1800000},
  store:new RedisStore({
    host: config.redisConfig.host,
    port: config.redisConfig.port,
    pass: config.redisConfig.password,
    logErrors:true,
    'db':2,
  }),
  secret: 'xiaochengyun2017',

}));

app.use('/', index);
app.use('/1.0', api);
api.use('/users', users);
app.use('/adminuser', adminuser);
app.use('/advertisement', advertisement);
app.use('/advertise', advertise);
api.use('/pic', pic);
api.use('/policy', policy);
app.use('/goodsclass', goodsclass);
app.use('/teacher', teacher);
app.use('/track', track);
api.use('/circle', circle);
api.use('/service', service);
app.use('/course',course);
app.use('/goodsadmin',goodsadmin);
app.use('/system',system);
api.use('/appteacher', appteacher);
api.use('/appcourse', appcourse);
app.use('/admincompany',admincompany);
api.use('/appindex',appindex);
app.use('/ctypeadmin',ctypeadmin);
app.use('/cshopadmin',cshopadmin);
app.use('/cgoodsadmin',cgoodsadmin);
app.use('/activityadmin',activityadmin);
app.use('/officeadmin',officeadmin);
app.use('/stationadmin',stationadmin);
app.use('/boardadmin',boardadmin);
app.use('/roadshowadmin',roadshowadmin);
app.use('/check',check);
api.use('/office',office);
api.use('/lock',lock);
app.use('/mediaadmin',mediaadmin);
app.use('/lockadmin',lockadmin);
app.use('/orderadmin',orderadmin);
app.use('/integraladmin',integraladmin);
api.use('/pay',pay);
app.use('/login',login);
app.use('/adminuseradmin',adminuseradmin);
app.use('/printadmin',printadmin);
app.use('/interspaceadmin',interspaceadmin);
app.use('/enterpriseadmin',enterpriseadmin);
app.use('/financeadmin',financeadmin);
app.use('/meetreception',meetreception);
app.use('/interspacefinance',interspacefinance);
app.use('/gymadmin',gymadmin);
app.use('/gymcoachadmin',gymcoachadmin);
app.use('/policyadmin',policyadmin);
app.use('/messageadmin',messageadmin);
app.use('/integralconf',integralconf);
app.use('/visitadmin',visitadmin);
app.use('/serviceadmin',serviceadmin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(req.params)
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
