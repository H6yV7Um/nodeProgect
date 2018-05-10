var express = require('express');
var app = express();
var now = new Date();
var config = require("../common/config");


//var schedule = require('node-schedule');
//var Mesg = mongoose.model("Mesg");
// var Contributelist = mongoose.model("Contributelist");

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
    console.log('********'+str)
    console.log(req.body.sign)
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
    arr.sort();
    var re = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] !== re[re.length - 1]) {
            re.push(arr[i]);
        }
    }
    return re;
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
 * 根据code创建总后台左侧导航栏
 * @param code
 */
var createLeftNavByCode = function (code) {
    var leftNav = '<ul class="nav nav-pills nav-stacked custom-nav">';
    for (var i in authority) {//遍历权限数组
        if (authority[i].class.length > 0) {
            if (code.indexOf(authority[i].code + '') > -1) {//第一个
                leftNav = leftNav + '<li class="menu-list nav-active ' + authority[i].code + 'show">';
            } else {
                leftNav = leftNav + '<li class="menu-list ' + authority[i].code + 'show">';
            }
            leftNav = leftNav + '<a ><i class="' + authority[i].icon + '"></i> <span>' + authority[i].name + '</span></a>';
            //遍历子分类
            var cl = authority[i].class;

            leftNav = leftNav + '<ul class="sub-menu-list">';
            for (var j in cl) {
                // if (0 == i) {//第一个
                //     leftNav = leftNav + '<li class="active">';
                // } else {
                //     leftNav = leftNav + '<li>';
                // }
                if (code == cl[j].code) {//如果code一样的话
                    leftNav = leftNav + '<li class="active">';
                } else {
                    leftNav = leftNav + '<li>';
                }
                //leftNav = leftNav + '<a class="leftNavAnchor" href="' + cl[j].url + '"> ' + cl[j].name + '</a></li>';
                leftNav = leftNav + '<a class="leftNavAnchor" href="' + cl[j].url + '"> ' + cl[j].name + '</a></li>';
            }
            leftNav = leftNav + '</ul>';
        } else {
            if (code == authority[i].code) {//第一个
                leftNav = leftNav + '<li class="active">';
            } else {
                leftNav = leftNav + '<li>';
            }
            // if (0 == i) {//第一个
            //     leftNav = leftNav + '<li>';
            // } else {
            //     leftNav = leftNav + '<li>';
            // }
            leftNav = leftNav + '<a class="leftNavAnchor" href="' + authority[i].url + '"><i class="' + authority[i].icon + '"></i> <span>' + authority[i].name + '</span></a>';
        }
        leftNav = leftNav + '</li>';
    }
    leftNav += '</ul>';
    return leftNav;
};

/**
 * 根据code创建总后台左侧导航栏权限
 * @param code
 */
var createLeftNavByCodes = function (code, arr) {
    var leftNav = '<ul class="nav nav-pills nav-stacked custom-nav">';
    for (var i in authority) {//遍历权限数组
        var aa = arr
        for (j in aa) {
            if (authority[i].code == aa[j]) {
                if (authority[i].class.length > 0) {
                    if (code.indexOf(authority[i].code + '') > -1) {//第一个
                        leftNav = leftNav + '<li class="menu-list nav-active">';
                    } else {
                        leftNav = leftNav + '<li class="menu-list">';
                    }
                    leftNav = leftNav + '<a ><i class="' + authority[i].icon + '"></i> <span>' + authority[i].name + '</span></a>';
                    var cl = authority[i].class;
                    leftNav = leftNav + '<ul class="sub-menu-list">';
                    for (var j in cl) {
                        if (code == cl[j].code) {//如果code一样的话
                            leftNav = leftNav + '<li class="active">';
                        } else {
                            leftNav = leftNav + '<li>';
                        }
                        leftNav = leftNav + '<a class="leftNavAnchor" href="' + cl[j].url + '"> ' + cl[j].name + '</a></li>';
                    }
                    leftNav = leftNav + '</ul>';
                } else {
                    if (code == authority[i].code) {//第一个
                        leftNav = leftNav + '<li class="active">';
                    } else {
                        leftNav = leftNav + '<li>';
                    }
                    leftNav = leftNav + '<a class="leftNavAnchor" href="' + authority[i].url + '"><i class="' + authority[i].icon + '"></i> <span>' + authority[i].name + '</span></a>';
                }
            }
        }
        leftNav = leftNav + '</li>';
    }
    leftNav += '</ul>';
    return leftNav;

};
/**
 * 根据code创建总后台左侧导航栏
 * @param code
 */
var createLeftNavByCodeInstitution = function (code) {
    var leftNav = '<ul class="nav nav-pills nav-stacked custom-nav">';
    for (var i in institutionAuthority) {//遍历权限数组
        if (institutionAuthority[i].class.length > 0) {
            if (code.indexOf(institutionAuthority[i].code + '') > -1) {//第一个
                leftNav = leftNav + '<li class="menu-list nav-active">';
            } else {
                leftNav = leftNav + '<li class="menu-list">';
            }
            leftNav = leftNav + '<a ><i class="' + institutionAuthority[i].icon + '"></i> <span>' + institutionAuthority[i].name + '</span></a>';
            //遍历子分类
            var cl = institutionAuthority[i].class;

            leftNav = leftNav + '<ul class="sub-menu-list">';
            for (var j in cl) {
                // if (0 == i) {//第一个
                //     leftNav = leftNav + '<li class="active">';
                // } else {
                //     leftNav = leftNav + '<li>';
                // }
                if (code == cl[j].code) {//如果code一样的话
                    leftNav = leftNav + '<li class="active">';
                } else {
                    leftNav = leftNav + '<li>';
                }
                //leftNav = leftNav + '<a class="leftNavAnchor" href="' + cl[j].url + '"> ' + cl[j].name + '</a></li>';
                leftNav = leftNav + '<a class="leftNavAnchor" href="' + cl[j].url + '"> ' + cl[j].name + '</a></li>';
            }
            leftNav = leftNav + '</ul>';
        } else {
            if (code == institutionAuthority[i].code) {//第一个
                leftNav = leftNav + '<li class="active">';
            } else {
                leftNav = leftNav + '<li>';
            }
            // if (0 == i) {//第一个
            //     leftNav = leftNav + '<li>';
            // } else {
            //     leftNav = leftNav + '<li>';
            // }
            leftNav = leftNav + '<a class="leftNavAnchor" href="' + institutionAuthority[i].url + '"><i class="' + institutionAuthority[i].icon + '"></i> <span>' + institutionAuthority[i].name + '</span></a>';
        }
        leftNav = leftNav + '</li>';
    }
    leftNav += '</ul>';
    return leftNav;
};

/**
 * 根据code生成管理后台页面title
 * @param code
 */
var createAdminPageTitleByCodeInstitution = function (code) {
    var returnStr = config.siteSchoolName + '管理后台';
    for (var i in institutionAuthority) {//遍历权限数组
        if (institutionAuthority[i].class.length > 0) {
            //遍历子分类
            var cl = institutionAuthority[i].class;
            for (var j in cl) {
                if (code == cl[j].code) {
                    returnStr = returnStr + " - " + institutionAuthority[i].name + " - " + cl[j].name;
                }
            }
        } else {
            if (code == institutionAuthority[i].code) {
                returnStr = returnStr + " - " + institutionAuthority[i].name;
            }
        }
    }
    return returnStr;
};
/**
 * 根据code生成管理后台页面title
 * @param code
 */
var createAdminPageTitleByCode = function (code) {
    var returnStr = config.siteName + '管理后台';
    for (var i in authority) {//遍历权限数组
        if (authority[i].class.length > 0) {
            //遍历子分类
            var cl = authority[i].class;
            for (var j in cl) {
                if (code == cl[j].code) {
                    returnStr = returnStr + " - " + authority[i].name + " - " + cl[j].name;
                }
            }
        } else {
            if (code == authority[i].code) {
                returnStr = returnStr + " - " + authority[i].name;
            }
        }
    }
    return returnStr;
};

/**
 * 把时间戳转换成日期格式
 * @param strms时间戳
 * @returns {string}日期格式
 */
var timeFormat = function (strms) {
    var date = new Date(strms);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y + M + D + h + m + s;
}

/**
 * 将文件上传到七牛云
 * @param filePath 所要上传的文件的绝对地址(含文件名)
 * @param key 存储到七牛云的key值(文件名)
 * @param fn 回调函数
 */
var saveToQiniu = function (filePath, key, fn) {

    //上传到七牛云
    var qiniu = require("qiniu");
    //需要填写你的 Access Key 和 Secret Key
    qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
    qiniu.conf.SECRET_KEY = config.qiniu.secretKey;
    //要上传的空间
    var bucket = config.qiniu.bucket;
    //构建上传策略函数
    function uptoken(bucket, key) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
        return putPolicy.token();
    }

    //生成上传 Token
    var token = uptoken(bucket, key);
    //构造上传函数
    function uploadFile(uptoken, key, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
            if (!err) {
                //处理返回值
                fn(null, config.qiniu.url + ret.key);
            } else {
                console.log("上传图片到七牛云出错了");
                fn(err, null);
            }
        });
    }

    //调用uploadFile上传
    uploadFile(token, key, filePath);
};


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
 * 商城后台页生成左侧导航
 */
var createShopLeftNav = function (code) {
    var leftNav = '<ul class="nav nav-pills nav-stacked custom-nav">';
    for (var i in shop) {//遍历权限数组
        if (shop[i].class.length > 0) {
            if (code.indexOf(shop[i].code + '') > -1) {//第一个
                leftNav = leftNav + '<li class="menu-list nav-active">';
            } else {
                leftNav = leftNav + '<li class="menu-list">';
            }
            leftNav = leftNav + '<a><i class="' + shop[i].icon + '"></i> <span>' + shop[i].name + '</span></a>';
            //遍历子分类
            var cl = shop[i].class;

            leftNav = leftNav + '<ul class="sub-menu-list">';
            for (var j in cl) {
                // if (0 == i) {//第一个
                //     leftNav = leftNav + '<li class="active">';
                // } else {
                //     leftNav = leftNav + '<li>';
                // }
                if (code == cl[j].code) {//如果code一样的话

                    leftNav = leftNav + '<li class="active">';
                } else {
                    leftNav = leftNav + '<li>';
                }
                leftNav = leftNav + '<a class="leftNavAnchor" href="' + cl[j].url + '"> ' + cl[j].name + '</a></li>';
            }
            leftNav = leftNav + '</ul>';
        } else {
            if (0 == i) {//第一个
                leftNav = leftNav + '<li>';
            } else {
                leftNav = leftNav + '<li>';
            }
            leftNav = leftNav + '<a class="leftNavAnchor" href="' + shop[i].url + '"><i class="' + shop[i].icon + '"></i> <span>' + shop[i].name + '</span></a>';
        }
        leftNav = leftNav + '</li>';
    }
    leftNav += '</ul>';
    console.log(leftNav)
    return leftNav;

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


/**
 * 根据code创建下侧导航栏
 * @param code
 */
var createBottomNavByCode = function (code) {
    var leftNav = '<div class="index_foot_space"></div><footer><ul>';
    leftNav += '<li class="';
    if (code == 1) {
        leftNav += 'foot_active';
    }
    leftNav += '"><a href="/mp/index"><div><div class="ic-home"></div><p>首页</p></div></a></li><li class="footerborder';
    if (code == 2) {
        leftNav += ' foot_active';
    }
    leftNav += '"><a href="/mp/classes"><div><div class="ic-class"></div><p>微课堂</p></div></a></li><li class="footerborder';
    if (code == 3) {
        leftNav += ' foot_active';
    }
    leftNav += '"><a href="/mp/life"><div><div class="ic-life"></div><p>微生活</p></div></a></li><li class="footerborder';
    if (code == 4) {
        leftNav += ' foot_active';
    }
    leftNav += ' footer_active"><a href="/mp/me"><div><div class="ic-mine"></div><p>本尊</p></div></a></li>';
    leftNav += '</ul></footer>';
    return leftNav;
};
/**
 * 根据code创建上方导航栏
 * @param code
 */
var createBottomNavByCode = function (code) {
    var leftNav = '<div class="index_foot_space"></div><footer><ul>';
    leftNav += '<li class="';
    if (code == 1) {
        leftNav += 'foot_active';
    }
    leftNav += '"><a href="/mp/index"><div><div class="ic-home"></div><p>首页</p></div></a></li><li class="footerborder';
    if (code == 2) {
        leftNav += ' foot_active';
    }
    leftNav += '"><a href="/mp/classes"><div><div class="ic-class"></div><p>微课堂</p></div></a></li><li class="footerborder';
    if (code == 3) {
        leftNav += ' foot_active';
    }
    leftNav += '"><a href="/mp/life"><div><div class="ic-life"></div><p>微生活</p></div></a></li><li class="footerborder';
    if (code == 4) {
        leftNav += ' foot_active';
    }
    leftNav += ' footer_active"><a href="/mp/me"><div><div class="ic-mine"></div><p>本尊</p></div></a></li>';
    leftNav += '</ul></footer>';
    return leftNav;
};


// 获取间隔天数
var getDays = function (day1, day2) {

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

var orderprice = function (orderinfo, dbname, fn) {
    var db = mongoose.model(dbname)
    // orderInfo[i] = {
    //    goodsId:String,
    //    goodsName:String,
    //    goodsPrice:Number,
    //    buyNum:Number
// }
    var goodsids = [];
    for (var i = 0; i < orderinfo.length; i++) {
        goodsids.push(orderinfo[i].goodsId)
    }
    db.find({_id: {$in: goodsids}}, function (err, goods) {
        if (err) {
            fn(err, null)
        } else {
            for (var x = 0; x < orderinfo.length; x++) {
                for (var y = 0; y < goods.length; y++) {

                }
            }
        }
    })
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

/**
 * 获取本月的初始时间和结束时间
 * @returns {{starttime: number, endtime: number}}
 */
var monthTime1 = function(){
    var aa = Date.now()
    var bb = timeFormat(aa)
    var cc = bb.substr(0,8)
    var dd = cc+'01 00:00:00'
    var ee = bb.substr(5,2)
    if((ee < 7) && (ee != 2)){
        if(ee%2 == 0){
            //偶
            var time = 30*24*60*60*1000
        }else{
            var time = 31*24*60*60*1000
        }
    }else if(ee == 2) {
        var time = 24*24*60*60*1000
    }else{
        if(ee%2 == 0){
            //偶
            var time = 31*24*60*60*1000
        }else{
            var time = 30*24*60*60*1000
        }

    }
    var starttime = Date.parse(dd)
    var endtime = starttime + time
    var obj = {
        starttime : starttime,
        endtime:endtime
    }
    return obj
}


var monthTime = function(){
    var aa = Date.now()
    var now = new Date();
    var thismonth = now.getMonth()
    var bb = timeFormat(aa)
    var cc = bb.substr(0,8)
    var dd = cc+'01 00:00:00'
    var ee = bb.substr(5,2)
    if((ee < 7) && (ee != 2)){
        if(ee%2 == 0){
            //偶
            var time = 30*24*60*60*1000
        }else{
            var time = 31*24*60*60*1000
        }
    }else if(ee == 2) {
        var time = 24*24*60*60*1000
    }else{
        if(ee%2 == 0){
            //偶
            var time = 31*24*60*60*1000
        }else{
            var time = 30*24*60*60*1000
        }

    }
    var starttime = Date.parse(dd)
    var endtime = starttime + time
    var obj = {
        starttime : starttime,
        endtime:endtime
    }
    var timearr = new Array
    var startime = obj.starttime
    var  b = thismonth - i
    var  startsub = 0
    var  endtime = 0
    if(thismonth == 4){
        if(b == 3){
            startsub = 30
        }else if(b == 2){
            startsub = 31
        }else if(b == 1){
            startsub = 28
        }else if(b == 0){
            startsub = 31
        }else if(b == -1){
            startsub = 31
        }
        endtime  = startime  -1
        startime = startime - (startsub * 24 * 60 * 60 * 1000)

        timearr.push(timeobj = {
            startime : startime,
            endtime  : endtime
        } )

    }else if(thismonth == 3){
        var  b = thismonth - i
        var  startsub = 0
        var  endtime = 0
        if(b == 2){
            startsub = 31
        }else if(b == 1){
            startsub = 28
        }else if(b == 0){
            startsub = 31
        }else if(b == -1){
            startsub = 31
        }else if(b == -2){
            startsub = 30
        }
        endtime  = startime  -1
        startime = startime - (startsub * 24 * 60 * 60 * 1000)

        timearr.push(timeobj = {
            startime : startime,
            endtime  : endtime
        } )
    }else if(thismonth == 2){
        if(b == 1){
            startsub = 28
        }else if(b == 0){
            startsub = 31
        }else if(b == -1){
            startsub = 31
        }else if(b == -2){
            startsub = 30
        }else if(b == -3){
            startsub = 31
        }
        endtime  = startime  -1
        startime = startime - (startsub * 24 * 60 * 60 * 1000)

        timearr.push(timeobj = {
            startime : startime,
            endtime  : endtime
        } )
    }else if(thismonth == 1){
        var  b = thismonth - i
        var  startsub = 0
        var  endtime = 0
        if(b == 0){
            startsub = 31
        }else if(b == -1){
            startsub = 31
        }else if(b == -2){
            startsub = 30
        }else if(b == -3){
            startsub = 31
        }else if(b == -4){
            startsub = 30
        }
        endtime  = startime  -1
        startime = startime - (startsub * 24 * 60 * 60 * 1000)

        timearr.push(timeobj = {
            startime : startime,
            endtime  : endtime
        } )
    }else if(thismonth == 0){
        if(b == -5){
            startsub = 31
        }else if(b == -4){
            startsub = 30
        }else if(b == -3){
            startsub = 31
        }else if(b == -2){
            startsub = 30
        }else if(b == -1){
            startsub = 31
        }
        endtime  = startime  -1
        startime = startime - (startsub * 24 * 60 * 60 * 1000)

        timearr.push(timeobj = {
            startime : startime,
            endtime  : endtime
        } )
    }else{
        for(var i = 1;i <= 5 ; i++){
            if(b == 0){
                startsub = 31
            }else if(b == 1){
                startsub = 28
            }else if(b == 2){
                startsub = 31
            }else if(b == 3){
                startsub = 30
            }else if(b == 4){
                startsub = 31
            }else if(b == 5){
                startsub = 30
            }else if(b == 6){
                startsub = 31
            }else if(b == 7){
                startsub = 31
            }else if(b == 8){
                startsub = 30
            }else if(b == 9){
                startsub = 31
            }else if(b == 10){
                startsub = 31
            }else if(b == -1){
                startsub = 30
            }
            endtime  = startime  -1
            startime = startime - (startsub * 24 * 60 * 60 * 1000)

            timearr.push(timeobj = {
                startime : startime,
                endtime  : endtime
            } )

        }
    }

    console.log(timearr)
    return obj = {
        timearr : timearr,
        thismon      : obj
    };

}

module.exports = {
    trim: trim,
    signCheck: signCheck,
    recordRequest: recordRequest,
    apiReturn: apiReturn,
    createVercode: createVercode,
    getFlatternDistance: getFlatternDistance,
    arrayUniq: arrayUniq,
    createLeftNavByCode: createLeftNavByCode,
    createLeftNavByCodes: createLeftNavByCodes,
    createAdminPageTitleByCode: createAdminPageTitleByCode,
    createLeftNavByCodeInstitution: createLeftNavByCodeInstitution,
    createAdminPageTitleByCodeInstitution: createAdminPageTitleByCodeInstitution,
    createBottomNavByCode: createBottomNavByCode,
    timeFormat: timeFormat,
    saveToQiniu: saveToQiniu,
    createSign: createSign,
    createShopLeftNav: createShopLeftNav,
    sortByKey: sortByKey,
    getArrayItems: getArrayItems,
    removeByValue: removeByValue,
    getDays: getDays,
    getDaysTotal: getDaysTotal,
    searchList: searchList,
    get_client_ip: get_client_ip,
    createVercodeNumAndLetter: createVercodeNumAndLetter,
    getMonday:getMonday,
    getDate:getDate,
    monthTime:monthTime,
    monthTime1:monthTime1,
}