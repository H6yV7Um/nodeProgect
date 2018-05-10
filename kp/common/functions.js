var express = require('express');
var app = express();
var mongoose = require("mongoose");
var request = require("request");
var Request = mongoose.model("Request");
var fs = require("fs");
// var COS = require('./cos/sdk/cos');
//var xml2js = require('xml2js');
var errors = require("../common/errors");
// var shouquan = require("../common/shouquan");
var date = require("./date");
var now = new Date();
var config = require("../common/config");

/**
 * 去除字符串左右空格
 * @returns {XML|*|void|{by}|string}
 */
var trim = function (str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}
/**
 * 生成随机数
 * @param codeLength 随机数长度
 * @returns {string} 返回值
 */
var createVercode = function (codeLength) {
    code = "";
    var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);//随机数
    for (var i = 0; i < codeLength; i++) {//循环操作
        var index = Math.floor(Math.random() * 10);
        code += random[index];//根据索引取得随机数加到code上
    }
    return code;
}

/**
 * 生成随机数字母和数字
 * @param codeLength 随机数长度
 * @returns {string} 返回值
 */
var createVercodeNumAndLetter = function (len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
/**
 * 签名校验算法
 * @param req
 * @returns {boolean} 签名是否正确
 */
var signCheck = function (req, res) {

    var array = new Array();
    var str = "", t = "";
    var obj;
    // console.log("传来的数据："+JSON.stringify(req.params)+"   1,   "+JSON.stringify(req.body)+"   2,   "+JSON.stringify(req.query));
    // console.log("前面的"+JSON.stringify(req.body));
    /*如果是get请求*/
    if (req.route.methods.get) {
        obj = req.params;
        // console.log("在这里1");
    }
    /*如果是post/put/patch方法*/
    if ((req.route.methods.post) || (req.route.methods.put) || (req.route.methods.patch)) {
        obj = req.body;
        //console.log("body:   "+obj);

    }
    /*如果是delete方法*/
    if (req.route.methods.delete) {
        obj = req.body;
    }
    /*将参数名剔除_fequestId 和sign后存到数组中，且对数组进行排序*/
    for (var i in obj) {
        if ((i != "_requestId") && (i != "sign")&& (i != "_params")) {
            array.push(i);
        }
    }
    // console.log('%%%%%%%%%%%%%')
    // console.log(array)
    array.sort();
    for (var i = 0; i < array.length; i++) {
        t = array[i];
        str = str + t + "=" + obj[t] + "&";
    }
    str = str.substring(0, str.length - 1);

    // console.log(str)
    // console.log('^^^^^^^^^^^^^^')
    // console.log('^^^^^^^^^^^^^^')
    // console.log('^^^^^^^^^^^^^^')
    // console.log(str)
    /*做校验*/

    var config = require("./config");
    var md5 = require('md5');
    str = md5(md5(str) + "&" + config.salt);
    // console.log('********'+str)
    // console.log(req.route.methods)
    // console.log(req.body)
    // console.log(req.params)
    // console.log(req.params.sign)
    // console.log(res)
    // console.log(req.body.sign)
    /*如果是get请求*/
    if (req.route.methods.get) {
        if (req.params.sign === str) {
            return true;
        } else {
            return false;
        }
    }
    /*如果是post/put/patch方法*/
    if ((req.route.methods.post) || (req.route.methods.put) || (req.route.methods.patch)) {
        if (req.body.sign === str) {
            return true;
        } else {
            return false;
        }
    }
    /*如果是post/put/patch方法*/
    if (req.route.methods.delete) {
        if (req.body.sign === str) {
            return true;
        } else {
            return false;
        }
    }
};

/**
 * 记录requestId
 * @param req
 * @param res
 * @param next
 */
var recordRequest = function (req, res, next) {
    //如果是开发模式，则记录一下requestId
    if (app.get('env') === 'development') {
        var requestId = Date.now() + createVercode(4);
        //如果是get方法
        if (req.route.methods.get) {
            var request = new Request({
                _requestId: requestId,
                request: req.params,
            });
            request.save();
            req.params._requestId = requestId;
        }
        //如果是post/put/patch方法
        if ((req.route.methods.post) || (req.route.methods.put) || (req.route.methods.patch)) {
            var request = new Request({
                _requestId: requestId,
                request: req.body,
            });
            request.save();
            req.body._requestId = requestId;
        }
        //如果是delete方法
        if (req.route.methods.delete) {
            var request = new Request({
                _requestId: requestId,
                request: req.query,
            });
            request.save();
            req.query._requestId = requestId;
        }
    }
    next();
};

/**
 * 自定义的api返回方法
 * @param res 系统Response对象
 * @param data 返回的数据
 * @param requstId 请求ID
 */
var apiReturn = function (res, data, requestId) {
    data._requestId = requestId;
    /*res.json(data);*/
    //如果是开发模式，则将返回结果放到数据库
    if (app.get('env') === 'development') {
        var request = new Request({
            _requestId: requestId,
            response: data,
        });
        request.save();
        //Request.findOneAndUpdate({_requestId:requestId},{$set:{response:data}},{upsert:true, new:true});
    }

    res.status(200).json(data);
};

/**
 * 根据经纬度计算两点之间距离
 * @param lat1 纬度1
 * @param lng1 经度1
 * @param lat2 纬度2
 * @param lng2 经度2
 * @returns {number} 单位米
 */
var getFlatternDistance = function (lat1, lng1, lat2, lng2) {
    var EARTH_RADIUS = 6378137.0;    //单位M
    var PI = Math.PI;

    function getRad(d) {
        return d * PI / 180.0;
    }

    var f = getRad((+lat1 + +lat2) / 2);
    var g = getRad((lat1 - lat2) / 2);
    var l = getRad((lng1 - lng2) / 2);

    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);

    var s, c, w, r, d, h1, h2;
    var a = EARTH_RADIUS;
    var fl = 1 / 298.257;

    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;

    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;

    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;

    return (Math.floor(d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))));
}

/**
 *数组去重
 * @param arr
 */
var arrayUniq = function (arr) {
    // arr.sort();
    // var re = [arr[0]];
    // for (var i = 1; i < arr.length; i++) {
    //     if (arr[i] !== re[re.length - 1]) {
    //         re.push(arr[i]);
    //     }
    // }
    // return re;
    // var arr = this,
      var  result = [], i, j;
        len = arr.length;
    for(i = 0; i < len; i++){
        for(j = i + 1; j < len; j++){
            if(arr[i] === arr[j]){
                j = ++i;
            }
        }
        result.push(arr[i]);
    }
    return result;

};

/**
 *数组删除某个val
 * @param arr
 * @param val
 */
var removeByValue = function (arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
};

/**
 * 把时间戳转换成日期格式
 * @param strms时间戳
 * @returns {string}日期格式
 */
var timeFormat = function (strms) {
    var date = new Date(strms);
    var Y = date.getFullYear();
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = fz(date.getDate());
    var h = fz(date.getHours());
    var m = fz(date.getMinutes());
    var s = fz(date.getSeconds());
    return Y + M + D ;
}


/**
 * 签名校验算法
 * @param req
 * @returns {boolean} 签名是否正确
 */
var createSign = function (obj) {
    var array = new Array();
    var str = "", t = "";

    /*将参数名剔除_fequestId 和sign后存到数组中，且对数组进行排序*/
    for (var i in obj) {
        if ((i != "_requestId") && (i != "sign")) {
            array.push(i);
        }
    }
    array.sort();
    for (var i = 0; i < array.length; i++) {
        t = array[i];
        str = str + t + "=" + obj[t] + "&";
    }
    str = str.substring(0, str.length - 1);

    /*做校验*/
    var config = require("./config");
    var md5 = require('md5');
    str = md5(md5(str) + "&" + config.salt);

    return str;
};


/**
 * 从一个数组取出不重复的几个元素
 * @param arr 数组
 * @param num  元素数量
 * @returns {Array}
 */
var getArrayItems = function (arr, num) {
    //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
    var temp_array = new Array();
    for (var index in arr) {
        temp_array.push(arr[index]);
    }
    //取出的数值项,保存在此数组
    var return_array = new Array();
    for (var i = 0; i < num; i++) {
        //判断如果数组还有可以取出的元素,以防下标越界
        if (temp_array.length > 0) {
            //在数组中产生一个随机索引
            var arrIndex = Math.floor(Math.random() * temp_array.length);
            //将此随机索引的对应的数组元素值复制出来
            return_array[i] = temp_array[arrIndex];
            //然后删掉此索引的数组元素,这时候temp_array变为新的数组
            temp_array.splice(arrIndex, 1);
        } else {
            //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
            break;
        }
    }
    return return_array;
}



// 获取间隔天数
var getDays = function (day1, day2) {

// 给Date对象添加getYMD方法，获取字符串形式的年月日
    Date.prototype.getYMD = function () {

        // 将结果放在数组中，使用数组的join方法返回连接起来的字符串，并给不足两位的天和月十位上补零
        return [this.getFullYear(), fz(this.getMonth() + 1), fz(this.getDate())].join("");
    }

// 给String对象添加getDate方法，使字符串形式的日期返回为Date型的日期
    String.prototype.getDate = function () {
        var strArr = this.split('-');
        return new Date(strArr[0], strArr[1] - 1, strArr[2]);
    }
    // 获取入参字符串形式日期的Date型日期
    var st = day1.getDate();
    var et = day2.getDate();

    var retArr = [];

    // 获取开始日期的年，月，日
    var yyyy = st.getFullYear(),
        mm = st.getMonth(),
        dd = st.getDate();

    // 循环
    while (st.getTime() != et.getTime()) {
        retArr.push(st.getYMD());

        // 使用dd++进行天数的自增
        st = new Date(yyyy, mm, dd++);
    }

    // 将结束日期的天放进数组
    retArr.push(et.getYMD());
    retArr.splice(0, 1);


    return retArr; // 或可换为return ret;
}

// 获取间隔天数
var getDay = function (day1, day2) {

// 给Date对象添加getYMD方法，获取字符串形式的年月日
    Date.prototype.getYMD = function () {

        // 将结果放在数组中，使用数组的join方法返回连接起来的字符串，并给不足两位的天和月十位上补零
        return [this.getFullYear(), fz(this.getMonth() + 1), fz(this.getDate())].join("-");
    }

// 给String对象添加getDate方法，使字符串形式的日期返回为Date型的日期
    String.prototype.getDate = function () {
        var strArr = this.split('-');
        return new Date(strArr[0], strArr[1] - 1, strArr[2]);
    }
    // 获取入参字符串形式日期的Date型日期
    var st = day1.getDate();
    var et = day2.getDate();

    var retArr = [];

    // 获取开始日期的年，月，日
    var yyyy = st.getFullYear(),
        mm = st.getMonth(),
        dd = st.getDate();

    // 循环
    while (st.getTime() != et.getTime()) {
        retArr.push(st.getYMD());

        // 使用dd++进行天数的自增
        st = new Date(yyyy, mm, dd++);
    }

    // 将结束日期的天放进数组
    retArr.push(et.getYMD());
    retArr.splice(0, 1);


    return retArr; // 或可换为return ret;
}


//获取日
function getDate(dates) {
    var dd = new Date();
    var n = dates || 0;
    dd.setDate(dd.getDate() + n);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;
    var d = dd.getDate();
    m = m < 10 ? "0" + m: m;
    d = d < 10 ? "0" + d: d;
    var day = y + "-" + m + "-" + d;
    return day;
};

// 给月和天，不足两位的前面补0
function fz(num) {
    if (num < 10) {
        num = "0" + num;
    }
    return num
}

var getDaysTotal = function (strDateStart, strDateEnd) {
    var strSeparator = "-"; //日期分隔符
    var oDate1;
    var oDate2;
    var iDays;
    oDate1 = strDateStart.split(strSeparator);
    oDate2 = strDateEnd.split(strSeparator);
    var strDateS = new Date(oDate1[0], oDate1[1] - 1, oDate1[2]);
    var strDateE = new Date(oDate2[0], oDate2[1] - 1, oDate2[2]);
    iDays = parseInt((strDateE - strDateS ) / 1000 / 60 / 60 / 24)//把相差的毫秒数转换为天数

    return iDays;
};
var searchList = function (str, container) {
    var newList = [];
    //新的列表
    var startChar = str.charAt(0);
    //开始字符
    var strLen = str.length;
    //查找符串的长度


    for (var i = 0; i < container.length; i++) {
        var obj = container[i];
        var isMatch = false;
        for (var p in obj) {
            if (typeof (obj[p]) == "function") {
                obj[p]();
            } else {
                var curItem = "";
                if (obj[p] != null) {
                    curItem = obj[p];
                }
                for (var j = 0; j < curItem.length; j++) {
                    if (curItem.charAt(j) == startChar)//如果匹配起始字符,开始查找
                    {
                        if (curItem.substring(j).substring(0, strLen) == str)//如果从j开始的字符与str匹配，那ok
                        {
                            isMatch = true;
                            break;
                        }
                    }
                }
            }
        }
        if (isMatch) {
            newList.push(obj);
        }
    }
    return newList;
};

/**
 * 上传图片到万象优图
 * @param filePath 图片在服务器上的路径+名字
 * @param fileid 存储key值
 * @param fn 回调函数
 */
var uploadPicToWxyt = function (filePath, fileid, fn) {

    var params = {
        Bucket: config.wxytConfig.bucket, /* 必须 */
        Region: 'cn-east',  //cn-south、cn-north、cn-east  /* 必须 */
        Key: fileid, /* 必须 */
        Body: filePath, /* 必须 */
        ContentLength: fs.statSync(filePath).size, /* 必须 */
    };
    console.log(fileid)
    // console.log(params)
    COS.putObject(params, function (err, data) {
        if (err) {
            console.log(err)
            fn(errors.error4, null);
        } else {
            console.log(data)
            fn(null, data);
        }
    });

}

var uploadFileToWxyt = function (http,filePath,fileid, fn) {
    var http = require(http)
    http.get(filePath, function(res){
        var imgData = "";
        var  filelength
        for(var i in res.headers){
            if(i = 'content-length'){
                filelength = res.headers[i]
            }
        }
        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


        res.on("data", function(chunk){
            imgData+=chunk;
        });
        res.on("end", function(){
            fs.writeFile("bb.png", imgData, "binary", function(err,file){
                if(err){
                    console.log("down fail");
                }
                var params = {
                    Bucket: config.wxytConfig.bucket, /* 必须 */
                    Region: 'cn-east',  //cn-south、cn-north、cn-east  /* 必须 */
                    Key: fileid, /* 必须 */
                    Body: config.siteUrl+'/bb.png', /* 必须 */
                    ContentLength: fs.statSync(config.siteUrl+'/bb.png').size, /* 必须 */
                };
                COS.putObject(params, function (err, data) {
                    if (err) {
                        fn(errors.error4, null);
                    } else {
                        fs.unlink('bb.png', function () {})

                        fn(null, {
                            url:config.wxytConfig.wxytUrl + '/' + fileid
                        });
                    }
                });
            });
        });


    });

}

var uploadvedioToWxyt = function (filePath,fileid, fn) {
    var http = require('https')
    http.get(filePath, function(res) {
        var imgData = "";
        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


        res.on("data", function (chunk) {
            imgData += chunk;
        });
        res.on("end", function () {
            fs.writeFile("aa.mp4", imgData, "binary", function (err, file) {
                if (err) {
                    console.log("down fail");
                }
                var params = {
                    Bucket: config.wxytConfig.bucket, /* 必须 */
                    Region: 'cn-east',  //cn-south、cn-north、cn-east  /* 必须 */
                    Key: fileid, /* 必须 */
                    Body: config.siteUrl+'/aa.mp4', /* 必须 */
                    ContentLength: fs.statSync(config.siteUrl+'/aa.mp4').size, /* 必须 */
                };
                COS.putObject(params, function (err, data) {
                    if (err) {
                        fn(errors.error4, null);
                    } else {
                        fs.unlink('aa.mp4', function () {})
                        fn(null, {
                            url:config.wxytConfig.wxytUrl + '/' + fileid
                        });
                    }
                });
            })
        })
    })

}

/**
 * json数组排序
 * @param array
 * @param key
 * @param type 1从大到小2从小到大
 * @returns {*}
 */
var sortByKey = function (array, key, type) {
    if (type == 1) {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    } else {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

}

//获取url请求客户端ip
var get_client_ip = function (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    return ip;
};


/**
 * 小程序ext文件
 * @param appid
 * @param shopid
 * @param appsecret
 */
var extJson = function (appid, shopid, appsecret, shoptype) {

    if(shoptype == 4){
        console.log('服务服务服务服务服务服务服务服务服务服务服务服务服务服务服务服务服务')
        var json = {
            "extEnable": true,
            "extAppid": appid,
            "ext": {
                "name": "wechat",
                "attr": {
                    "host": "open.weixin.qq.com",
                    "users": [
                        "user_1",
                        "user_2"
                    ]
                },
                "appid": appid,
                //"appid": 'wx66d4fd30df1774c5',
                "shopid": shopid,

                "appsecret": appsecret
                //"appsecret": 'be76c88b24394aa28bffc0ada866956f'
            },
            "extPages": {
                "pages/logs/logs": {
                    "navigationBarTitleText": "logs"
                }
            },
            "window": {
                "backgroundTextStyle": "light",
                "navigationBarBackgroundColor": "#fff",
                "navigationBarTextStyle": "black"
            },
            "tabBar": {
                "borderStyle": "white",
                "backgroundColor": "#ffffff",
                "color": "#929292",
                "selectedColor": "#fa4e9b",
                "list": [
                    {
                        "pagePath": "pages/index/index",
                        "text": "首页",
                        "iconPath": "pages/images/noselect_home.png",
                        "selectedIconPath": "pages/images/home.png"
                    },
                    {
                        "pagePath": "pages/service/servicehome/servicehome",
                        "text": "服务",
                        "iconPath": "pages/images/noselect_service.png",
                        "selectedIconPath": "pages/images/service.png"
                    },
                    {
                        "pagePath": "pages/mine/minehome/minehome",
                        "text": "我的",
                        "iconPath": "pages/images/noselect_mine.png",
                        "selectedIconPath": "pages/images/mine.png"
                    }
                ]
            },
            "networkTimeout": {
                "request": 10000,
                "downloadFile": 10000
            }
        }
        return json
    }else{
        var json = {
            "extEnable": true,
            "extAppid": appid,
            "ext": {
                "name": "wechat",
                "attr": {
                    "host": "open.weixin.qq.com",
                    "users": [
                        "user_1",
                        "user_2"
                    ]
                },
                "appid": appid,
                //"appid": 'wx66d4fd30df1774c5',
                "shopid": shopid,
                "shoptype": shoptype,
                "appsecret": appsecret
                //"appsecret": 'be76c88b24394aa28bffc0ada866956f'
            },
            "extPages": {
                "pages/logs/logs": {
                    "navigationBarTitleText": "logs"
                }
            },
            "window": {
                "backgroundTextStyle": "light",
                "navigationBarBackgroundColor": "#fff",
                "navigationBarTextStyle": "black"
            },
            "tabBar": {
                "borderStyle": "white",
                "color": "#837f7f",
                "selectedColor": "#f96124",
                "backgroundColor": "#ffffff",
                "list": [
                    {
                        "pagePath": "pages/index/index",
                        "text": "首页",
                        "iconPath": "pages/images/home_noemal@2x.png",
                        "selectedIconPath": "pages/images/home.png"
                    },
                    {
                        "pagePath": "pages/commodity/firstpage/firstpage",
                        "text": "商品",
                        "iconPath": "pages/images/merchandise_normal@2x.png",
                        "selectedIconPath": "pages/images/shopping.png"
                    },
                    {
                        "pagePath": "pages/shoppingcart/scpage/scpage",
                        "text": "购物车",
                        "iconPath": "pages/images/shoppingcart_normal@2x.png",
                        "selectedIconPath": "pages/images/shoppingcart.png"
                    },
                    {
                        "pagePath": "pages/mine/home/home",
                        "text": "我的",
                        "iconPath": "pages/images/me_normal@2x.png",
                        "selectedIconPath": "pages/images/mine.png"
                    }
                ]
            },
            "networkTimeout": {
                "request": 10000,
                "downloadFile": 10000
            }
        }
        return json
    }

}

/**
 * 发送邮件
 * @param address  对方邮箱地址
 * @param subject  主题
 * @param content  内容
 * @param fn 回调，
 */
var sendMail = function (address,subject, content,fn) {
    var nodemailer = require("nodemailer");
    var smtpTransport = require('nodemailer-smtp-transport');
    var wellknown = require("nodemailer-wellknown");
    var config = wellknown("QQ");

    var sysConfig = require("../common/config");

    console.log(111)
    config.auth = {
        user: sysConfig.emailConfig.user,
        //这里密码不是qq密码，是你设置的smtp密码
        pass: sysConfig.emailConfig.password,
    }
    var transporter = nodemailer.createTransport(smtpTransport(config));
    var mailOptions = {
        to: address, // 收件列表
        from: sysConfig.emailConfig.user, // 发件地址
        // to: sysConfig.emailConfig.receivers, // 收件列表
        subject: subject, // 标题
        //text和html两者只支持一种
        //text: 'Hello world ?hahha', // 标题
        // text:content
        html: content // html 内容
    };
    console.log(222)
// send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            fn(null,info)
        }
    });
}


var pagination = function(pageNo, pageSize, array) {
    var offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}

//获取周时间
function getMonday(type, dates) {
    var now = new Date();
    var nowTime = now.getTime();
    var day = now.getDay();
    var longTime = 24 * 60 * 60 * 1000;
    var n = longTime * 7 * (dates || 0);
    if (type == "s") {
        var dd = nowTime - (day - 1) * longTime + n;
    };
    if (type == "e") {
        var dd = nowTime + (7 - day) * longTime + n;
    };
    dd = new Date(dd);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;
    var d = dd.getDate();
    m = m < 10 ? "0" + m: m;
    d = d < 10 ? "0" + d: d;
    var day = y + "-" + m + "-" + d;
    return day;
};
/**
 * 发送模板消息
 * @param userids
 * @param templatedata
 * @param templateid
 * @param page
 * @param fn
 */
var sendTemplateMesg = function(userids,templatedata,templateid,page,fn){
    shouquan.getAccessToken().then(function(data){
        var async = require('async')
        async.each(userids, function(userinfo, callback) {
            setTimeout(function(){

                var url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + data
                var formdata = {
                    "touser": userinfo.userid,
                    "template_id": templateid,
                    "page": page,
                    "form_id": userinfo.formid,
                    "data": templatedata

                }
                console.log(formdata)
                var option = {
                    url: url,
                    method: "POST",
                    json: true,
                    body: formdata
                };
                request(option, function (error, response, body) {

                    console.log(body)

                    if (body.errcode == 0) {
                        callback(null)
                    } else {
                        callback(error)
                    }
                })

            },1000)
        }, function(err) {
            console.log(err)
            fn({
                status:1
            })
        });
    })


}

/**
 * 把时间戳转换成日期格式
 * @param strms时间戳
 * @returns {string}日期格式
 */
var MDTime = function (strms) {
    var date = new Date(strms);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = fz(date.getDate()) + ' ';
    return M + D ;
}

module.exports = {
    trim: trim,
    signCheck: signCheck,
    recordRequest: recordRequest,
    apiReturn: apiReturn,
    createVercode: createVercode,
    getFlatternDistance: getFlatternDistance,
    arrayUniq: arrayUniq,
    timeFormat: timeFormat,
    createSign: createSign,
    sortByKey: sortByKey,
    getArrayItems: getArrayItems,
    removeByValue: removeByValue,
    getDays: getDays,
    getDay: getDay,
    getDaysTotal: getDaysTotal,
    searchList: searchList,
    get_client_ip: get_client_ip,
    extJson: extJson,
    createVercodeNumAndLetter: createVercodeNumAndLetter,
    sendMail: sendMail,
    pagination:pagination,
    uploadPicToWxyt: uploadPicToWxyt,
    uploadFileToWxyt:uploadFileToWxyt,
    uploadvedioToWxyt:uploadvedioToWxyt,
    getMonday:getMonday,
    getDate:getDate,
    MDTime:MDTime,
    sendTemplateMesg:sendTemplateMesg,
}