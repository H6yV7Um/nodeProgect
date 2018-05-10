var express = require('express');
var app = express();
var mongoose = require("mongoose");
var authority = require("../common/authorty");
var sms = require("../common/sms");
var orderstatus = require("../common/orderstatus");
var errors = require("./errors");
var Request = mongoose.model("Request");
var Group = mongoose.model("Group");
var Goodsclass = mongoose.model("Goodsclass");
var Lockauthority = mongoose.model("Lockauthority");
var Lock = mongoose.model("Lock");
var Goods = mongoose.model("Goods");
var Finance = mongoose.model("Finance");
var Officeorder = mongoose.model("Officeorder");
var Enterprise = mongoose.model("Enterprise");
var Staffapplyfor = mongoose.model("Staffapplyfor");
var Media = mongoose.model("Media");
var Mediaserver = mongoose.model("Mediaserver");
var Integralconf = mongoose.model("Integralconf");
var Integraldetail = mongoose.model("Integraldetail");
var User = mongoose.model("User");

var config = require("./config");
var TimRestAPI = require("imsdk/lib/TimRestApi.js");
var conf = {
    sdkAppid:config.tengxunim.sdkappId,
    identifier:config.tengxunim.adminName,
    accountType:config.tengxunim.accountType,
    privateKey:'/ec_key.pem',
};
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
        obj = req.query;
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
        if (req.query.sign === str) {
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
 * 根据code创建总后台左侧导航栏
 * @param code
 */
var createLeftNavByCode = function (code) {
    var leftNav = '<ul class="nav nav-pills nav-stacked custom-nav">';
    for (var i in authority) {//遍历权限数组

        if (authority[i].class.length > 0) {
            if (code.indexOf(authority[i].code+'') > -1) {//第一个
                leftNav = leftNav + '<li class="menu-list nav-active">';
            } else {
                leftNav = leftNav + '<li class="menu-list">';
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

var createLeftNavByCodes = function (code,arr) {
    var leftNav = '<ul class="nav nav-pills nav-stacked custom-nav">';
    for (var i in authority) {//遍历权限数组
        var aa=arr
        for(j in aa){
            if(authority[i].code==aa[j]){
                if (authority[i].class.length > 0) {
                    if (code.indexOf(authority[i].code+'') > -1) {//第一个
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
 * 把时间戳转换成日期格式
 * @param strms时间戳
 * @returns {string}日期格式
 */
var timeFormat = function (strms){
    console.log(strms)
    var date = new Date(strms);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y+M+D+h+m+s;
}

/**
 * 将文件上传到七牛云
 * @param filePath 所要上传的文件的绝对地址(含文件名)
 * @param key 存储到七牛云的key值(文件名)
 * @param fn 回调函数
 */
var saveToQiniu = function (filePath,key,fn){

    //上传到七牛云
    var qiniu = require("qiniu");
    //需要填写你的 Access Key 和 Secret Key
    qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
    qiniu.conf.SECRET_KEY = config.qiniu.secretKey;
    //要上传的空间
    var bucket = config.qiniu.bucket;
    //构建上传策略函数
    function uptoken(bucket, key) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
        return putPolicy.token();
    }
    //生成上传 Token
    var token = uptoken(bucket, key);
    //构造上传函数
    function uploadFile(uptoken, key, localFile) {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if(!err) {
                //处理返回值
                fn (null, config.qiniu.url + ret.key);
            } else {
                console.log("上传图片到七牛云出错了");
                fn (err, null);
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
            if (code.indexOf(shop[i].code+'') > -1) {//第一个
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
                    console.log('11111')
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
 * Jpush给固定人群推送消息
 * @param str 推送人标签
 * @param content  显示内容
 * @param obj  自定义消息
 * @param fn
 */
var sendJpush = function(str,content,obj,fn){
    var client = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);
    client.push().setPlatform('ios', 'android')
        .setAudience(JPush.alias(str))
        .setNotification('Hi, JPush', JPush.ios(content,JSON.stringify(obj),0), JPush.android(content, null, 0,obj))
        .setMessage(JSON.stringify(obj))
        // true: 推送生产环境；false: 推送开发环境。
        .setOptions(null, 60,null,false,null)
        .send(function (err, res2) {
            if (err) {
                console.log(err)
                if (err instanceof JPush.APIConnectionError) {
                    fn(err.message, null);
                } else if (err instanceof JPush.APIRequestError) {
                    fn(err.message,null);
                }
            } else {
                fn(null, 1);
            }
        })
}
/**
 * 判断商品的库存量
 * @param shopid
 * @param goods
 * @param fn
 */
var judgeGoodsInventory = function(shopid,goods,fn){
    var goodsids = new Array();
    for(var i=0;i<goods.length;i++){
        goodsids.push(goods[i].goodsid)
    }
    Goods.find({_id:{$in:goodsids}},function(err,goodsinfos){
        if(err){
            fn(err, null);
        }else{
            //判断库存
            var data = new Array()
            for(var x=0;x<goods.length;x++){
                for(var y=0;y<goodsinfos.length;y++){
                    if(goods[x].goodsid == goodsinfos[y]._id){
                        if(goods[x].buynum > goodsinfos[y].goodsInventory){
                            var obj = {
                                goodsname:goodsinfos[y].goodsName,
                                goodsinventory:goodsinfos[y].goodsInventory
                            }
                            data.push(obj)
                        }
                    }
                }
            }
            if(data.length > 0){
                var newdata = {
                    status:1,
                    data:data
                }
                fn(null,newdata);
            }else{
                //库存数量更新
                for(var x=0;x<goods.length;x++){
                    for(var y=0;y<goodsinfos.length;y++){
                        if(goods[x].goodsid == goodsinfos[y]._id){
                            goodsinfos[y].goodsInventory -= goods[x].buynum
                            Goods.update({_id:goodsinfos[y]._id},goodsinfos[y],function(err,docs){

                            })
                        }
                    }
                }
                var newdata = {
                    status:2,
                }
                fn(null,newdata);
            }
        }
    })

}

/**
 * 修改订单状态及增加商品销售量
 * @param orderno 订单号
 * @param fn
 */
var orderstatusChange = function(orderno,paytype,fn){
    Officeorder.find({orderNo:orderno},function(err,docs){
        if(err){
            fn(err,null);
        }else{
            for(var i=0;i<docs.length;i++){
                Officeorder.update({_id:docs[i]._id},{'orderStatus':orderstatus.statusB10001,'paytype':paytype},function(err,data){

                })
                Goods.update({_id:docs[i].orderInfo[0].goodsId},{'$inc':{'monthSaleNum':(docs[i].orderInfo[0].buyNum)*1,'allSaleNum':(docs[i].orderInfo[0].buyNum)*1}},function(err,goods){

                })
            }
            var obj={
                data:1
            }
            fn(null,obj)
        }
    })
}

/**
 * 从一个数组取出不重复的几个元素
 * @param arr 数组
 * @param num  元素数量
 * @returns {Array}
 */
var getArrayItems = function(arr, num) {
    //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
    var temp_array = new Array();
    for (var index in arr) {
        temp_array.push(arr[index]);
    }
    //取出的数值项,保存在此数组
    var return_array = new Array();
    for (var i = 0; i<num; i++) {
        //判断如果数组还有可以取出的元素,以防下标越界
        if (temp_array.length>0) {
            //在数组中产生一个随机索引
            var arrIndex = Math.floor(Math.random()*temp_array.length);
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
 * 添加通知消息
 * @param useraccount
 * @param content
 * @param fn
 */
var addMesg = function(useraccount,content,type,fn){
    var mesg = new Mesg({
        userAccount:useraccount,        //用户账号
        mesginfo:content,           //消息内容
        createTime:Date.now(),         //时间
        status:0,             //已读状态0未读1已读
        type:type
    })
    mesg.save(function(err,docs){
        if(err){
            fn(err,null)
        }else{
            fn(null,docs)
        }
    })
}




/**
 * 验证订单价格
 * @param goods
 * @param fn
 */
var countOrder = function(type,goods,fn){
    var goodsids = new Array();
    for(var i=0;i<goods.length;i++){
        goodsids.push(goods[i].goodsId)
    }
    var allgoodsprice = 0
    switch(type){
        case '1':
            //工位

            break;
        case '2':
            //会议室
            break;
        case '3':
            //路演厅
            break;
        default:
            Goods.find({_id:{$in:goodsids}},function(err,docs){
                if(err){
                    fn(err,null)
                }else{
                    for(var x=0;x<docs.length;x++){
                        for(var y=0;y<goods.length;y++){
                            if(docs[x]._id == goods[y].goodsId){
                                if(parseFloat(docs[x].goodsPrice) == parseFloat(goods[y].goodsPrice)){
                                    allgoodsprice = parseFloat(allgoodsprice) + parseFloat(docs[x].goodsPrice) * parseFloat(goods[y].buyNum)
                                }
                            }
                        }
                    }
                    fn(null,allgoodsprice)
                }
            })
            break
    }


}

/**
 * 添加到财务表
 * @param goods
 * @param interspaceid
 * @param channel
 * @param userid
 * @param fn
 */
var addFinance = function(orderno,interspaceid,channel,userid,amount,type,goodsId,goodsName,fn){
    var obj = new Finance({
        userId:userid,         //userid
        interspaceId:interspaceid,    //空间id
        type:type,           //
        orderNo:orderno,
        amount:amount*100,        //金额
        channel:channel,                //充值方式
        goodsId:goodsId,
        goodsName:goodsName,
        createTime:Date.now(),             //时间
    })
    obj.save(function(err,docs){
        if(err){
            console.log(err)
            fn(err,null)
        }else{
            console.log(docs)
            fn(null,'ok')
        }
    })
}

/**
 * json数组排序
 * @param array
 * @param key
 * @param type 1从大到小2从小到大
 * @returns {*}
 */
var sortByKey = function(array, key,type) {
    if(type == 1){
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    }else{
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

}

/**
 * json数组排序
 * @param array
 * @param key
 * @param type 1从大到小2从小到大
 * @returns {*}
 */
var sortNumberByKey = function(array, key,type) {
    if(type == 1){
        return array.sort(function(a, b) {
            var x = parseInt(a[key]); var y = parseInt(b[key]);
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    }else{
        return array.sort(function(a, b) {
            var x = parseInt(a[key]); var y = parseInt(b[key]);
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

}

/**
 * 添加公共商品一级分类
 * @param interspaceid  空间id
 * @returns {boolean}
 */
var addGoodsClass = function(interspaceid){
    var classes = [
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:11,             //分类编号
            className:'饮用水',            //分类内容
            type:1,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:1,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:12,             //分类编号
            className:'办公家具',            //分类内容
            type:1,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:2,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:13,             //分类编号
            className:'办公耗材',            //分类内容
            type:1,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:3,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:14,             //分类编号
            className:'办公保洁',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:4,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:15,             //分类编号
            className:'法务',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:5,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:16,             //分类编号
            className:'财税',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:6,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:17,             //分类编号
            className:'人力咨询',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:7,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:18,             //分类编号
            className:'知识产权',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:8,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:19,             //分类编号
            className:'网络运维',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:9,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:20,             //分类编号
            className:'翻译',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:10,                  //公共分类排序
        },
        {
            interspaceId:interspaceid,               //店铺id
            classOrder:21,             //分类编号
            className:'投融资服务',            //分类内容
            type:2,
            createTime:Date.now(),          //添加分类时间
            iscommon:1,              //是否是公共分类0不是1是
            index:11,                  //公共分类排序
        },

    ]
    for(var i=0;i<classes.length;i++){
        var obj = new Goodsclass(classes[i]);
        obj.save()
    }
    return true;

}

/**
 * 创建群组
 * @param groupname
 * @param fn
 */
var createGroup = function(groupname,fn){
    var api = new TimRestAPI(conf);
    api.init(function (err, data) {
        if (err) {
            fn(errors.error20003,null)
        }
        var reqBody = {
            "Type": "ChatRoom", // 群组类型：Private/Public/ChatRoom/AVChatRoom/BChatRoom（必填）
            "Name": groupname    // 群名称（必填）
        }
        api.request("group_open_http_svc", "create_group", reqBody,
            function (err, data) {
                console.log(data)
                if (err) {
                    fn(errors.error20000,null)
                } else {
                    var group = new Group({
                        groupId:data.GroupId,           //群组id
                        memberNumber:0,      //群成员人数
                        groupName:groupname,
                        createTime:Date.now(),        //建群时间
                    })
                    group.save(function(err,docs){
                        if(err){
                            fn(errors.error3,null)
                        }else{
                            fn(null,docs)
                        }
                    })
                }
            })
    })
}

/**
 * 群组加入成员
 * @param txyid
 * @param fn
 */
var addGroupMember = function(groupid,txyid,fn){
    var api = new TimRestAPI(conf);
    api.init(function (err, data) {
        if (err) {
            fn(errors.error20003,null)
        }
        var reqBody = {
            "GroupId": groupid,   // 要操作的群组（必填）
            "Silence": 1,
            "MemberList": [  // 一次最多添加500个成员
                {
                    "Member_Account": txyid  // 要添加的群成员ID（必填）
                }]
        }
        api.request("group_open_http_svc", "add_group_member", reqBody,
            function (err, data) {
                if (err) {
                    fn(errors.error20000,null)
                } else {
                    Group.update({groupId:groupid},{"$inc":{'memberNumber':1}},function(err,docs){
                        if(err){
                            fn(err,null)
                        }else{
                            fn(null,data)
                        }
                    })


                }
            })
    })


}
/**
 * 发送消息
 * @param mesg
 * @param fn
 */
var sendMesgToGroup = function(txyid,type,username,otherdata,mesg,fn){
    var obj = {
        type:type,
        mesg:mesg,
        username:username
    }
    if(otherdata){
       obj.goodsid = otherdata.goodsid;
        obj.classorder = otherdata.classorder;
    }
    Group.find({},function(err,docs){
        if(err){
            fn(errors.error3,null)
        }else{
            console.log(docs)
            var api = new TimRestAPI(conf);
            for(var i=0;i<docs.length;i++){
                var reqBody = {
                    "GroupId": docs[i].groupId,
                    "From_Account": txyid,
                    "Random": Date.now()+createVercode(4), // 随机数字，五分钟数字相同认为是重复消息
                    "MsgBody": [  // 消息体，由一个element数组组成，详见字段说明
                        {
                            "MsgType": "TIMCustomElem", // 自定义消息
                            "MsgContent": {
                                "Data": JSON.stringify(obj),
                            }
                        },
                    ],
                }
                api.init(function (err, data) {
                    if (err) {
                        fn(errors.error20003,null)
                    }
                    api.request("group_open_http_svc", "send_group_msg", reqBody,
                        function (err, data) {

                            if (err) {
                                fn(errors.error20000,null)
                            } else {
                                console.log('3333333333333333')
                                console.log(data)
                                fn(null,'ok')
                            }
                        })
                })
            }

        }
    })
}

/**
 * 添加开锁权限表
 * @param roomid
 * @param userid
 * @param starttime
 * @param endtime
 * @param fn
 */
var addLockAuthority = function(roomid,userid,starttime,endtime,orderinfo,fn){
    console.log(orderinfo)
    var arr = []
    for(var i=0;i<orderinfo.length;i++){
        arr.push(orderinfo[i].goodsId)
    }
    console.log(arr)
    Lock.find({roomId:roomid},function(err,docs){
        if(err){
            fn(err,null)
        }else{
            if(docs.length > 0){
                var json = {
                    mac:docs[0].mac,           //设备mac地址（唯一）
                    roomId:roomid,       //房间id
                    userId:userid,       //用户id
                    type:2,         //1永久性的2非永久性的
                    stationids:arr,
                    startTime:parseInt(starttime),    //非永久性的开始时间
                    endTime:parseInt(endtime),      //非永久性的到期时间
                    createTime:Date.now(),    //发布时间
                }

            }else{
                var json = {
                    //mac:docs[0].mac,           //设备mac地址（唯一）
                    roomId:roomid,       //房间id
                    userId:userid,       //用户id
                    type:2,         //1永久性的2非永久性的
                    stationids:arr,
                    startTime:parseInt(starttime),    //非永久性的开始时间
                    endTime:parseInt(endtime),      //非永久性的到期时间
                    createTime:Date.now(),    //发布时间
                }
            }
            var obj = new Lockauthority(json)
            obj.save(function(err,data){
                if(err){

                    fn(err,null)
                }else{
                    console.log(data)
                    fn(null,data)
                }
            })
        }
    })

}
/**
 * 办公室时间段的时间戳
 * @param type
 * @returns {number}
 */
var officeTime = function(type){
    switch(type){
        case '0': //9:00
            return 9*60*60*1000;
            break;
        case '1': //9:30
            return 9*60*60*1000+30*60*1000;
            break;
        case '2':  //10:00
            return 10*60*60*1000;
            break;
        case '3':
            return 10*60*60*1000+30*60*1000;
            break;
        case '4':
            return 11*60*60*1000;
            break;
        case '5':
            return 11*60*60*1000+30*60*1000;
            break;
        case '6':
            return 12*60*60*1000;
            break;
        case '7':
            return 12*60*60*1000+30*60*1000;
            break;
        case '8':
            return 13*60*60*1000;
            break;
        case '9':
            return 13*60*60*1000+30*60*1000;
            break;
        case '10':
            return 14*60*60*1000;
            break;
        case '11':
            return 14*60*60*1000+30*60*1000;
            break;
        case '12':
            return 15*60*60*1000;
            break;
        case '13':
            return 15*60*60*1000+30*60*1000;
            break;
        case '14': //9:00
            return 16*60*60*1000;
            break;
        case '15': //9:30
            return 16*60*60*1000+30*60*1000;
            break;
        case '16':  //10:00
            return 17*60*60*1000;
            break;
        case '17':
            return 17*60*60*1000+30*60*1000;
            break;
        case '18':
            return 18*60*60*1000;
            break;
        case '19':
            return 18*60*60*1000+30*60*1000;
            break;
        case '20':
            return 19*60*60*1000;
            break;
        case '21':
            return 19*60*60*1000+30*60*1000;
            break;
        case '22':
            return 20*60*60*1000;
            break;
        case '23':
            return 20*60*60*1000+30*60*1000;
            break;
        case '24':
            return 21*60*60*1000;
            break;
        case '25':
            return 21*60*60*1000+30*60*1000;
            break;

    }

}

/**
 * 路演厅时间段的时间戳
 * @param type
 * @returns {number}
 */
var roadshowTime = function(type){
    switch(type) {
        case '0': //8:00
            return 8 * 60 * 60 * 1000;
            break;
        case '1': //8:30
            return 8 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '2':  //10:00
            return 9 * 60 * 60 * 1000;
            break;
        case '3':
            return 9 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '4':
            return 10 * 60 * 60 * 1000;
            break;
        case '5':
            return 10 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '6':
            return 11 * 60 * 60 * 1000;
            break;
        case '7':
            return 11 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '8':
            return 12 * 60 * 60 * 1000;
            break;
        case '9':
            return 12 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '10':
            return 13 * 60 * 60 * 1000;
            break;
        case '11':
            return 13 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '12':
            return 14 * 60 * 60 * 1000;
            break;
        case '13':
            return 14 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '14':
            return 15 * 60 * 60 * 1000;
            break;
        case '15': //8:00
            return 15 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '16': //8:30
            return 16 * 60 * 60 * 1000;
            break;
        case '17':  //10:00
            return 16 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '18':
            return 17 * 60 * 60 * 1000;
            break;
        case '19':
            return 17 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '20':
            return 18 * 60 * 60 * 1000;
            break;
        case '21':
            return 18 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '22':
            return 19 * 60 * 60 * 1000;
            break;
        case '23':
            return 19 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '24':
            return 20 * 60 * 60 * 1000;
            break;
        case '25':
            return 20 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '26':
            return 21 * 60 * 60 * 1000;
            break;
        case '27':
            return 21 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '28':
            return 22 * 60 * 60 * 1000;
            break;
        case '29':
            return 22 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
    }
}

/**
 * 健身房时间段的时间戳
 * @param type
 * @returns {number}
 */
var gymTime = function(type){
    switch(type) {
        case '0': //8:00
            return 30 * 60 * 1000;
            break;
        case '1': //8:30
            return 1 * 60 * 60 * 1000;
            break;
        case '2':  //10:00
            return 1 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '3':
            return 2 * 60 * 60 * 1000;
            break;
        case '4':
            return 2 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '5':
            return 3 * 60 * 60 * 1000;
            break;
        case '6':
            return 3 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '7':
            return 4 * 60 * 60 * 1000;
            break;
        case '8':
            return 4 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '9':
            return 5 * 60 * 60 * 1000;
            break;
        case '10':
            return 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '11':
            return 6 * 60 * 60 * 1000;
            break;
        case '12':
            return 6 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '13':
            return 7 * 60 * 60 * 1000;
            break;
        case '14':
            return 7 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '15': //8:00
            return 8 * 60 * 60 * 1000;
            break;
        case '16': //8:30
            return 8 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '17':  //10:00
            return 9 * 60 * 60 * 1000;
            break;
        case '18':
            return 9 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '19':
            return 10 * 60 * 60 * 1000;
            break;
        case '20':
            return 10 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '21':
            return 11 * 60 * 60 * 1000;
            break;
        case '22':
            return 11 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '23':
            return 12 * 60 * 60 * 1000;
            break;
        case '24':
            return 12 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '25':
            return 13 * 60 * 60 * 1000;
            break;
        case '26':
            return 13 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '27':
            return 14 * 60 * 60 * 1000;
            break;
        case '28':
            return 14 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '29':
            return 15 * 60 * 60 * 1000;
            break;
        case '30':
            return 15 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '31':
            return 16 * 60 * 60 * 1000;
            break;
        case '32':
            return 16 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '33': //8:00
            return 17 * 60 * 60 * 1000;
            break;
        case '34': //8:30
            return 17 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '35':  //10:00
            return 18 * 60 * 60 * 1000;
            break;
        case '36':
            return 18 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '37':
            return 19 * 60 * 60 * 1000;
            break;
        case '38':
            return 19 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '39':
            return 20 * 60 * 60 * 1000;
            break;
        case '40':
            return 20 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '41':
            return 21 * 60 * 60 * 1000;
            break;
        case '42':
            return 21 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '43':
            return 22 * 60 * 60 * 1000;
            break;
        case '44':
            return 22 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '45':
            return 23 * 60 * 60 * 1000;
            break;
        case '46':
            return 23 * 60 * 60 * 1000 + 30 * 60 * 1000;
            break;
        case '47':
            return 24 * 60 * 60 * 1000;
            break;
    }
}

var cancelStation = function(priseid,roomid,stationid,userid,fn){
    Staffapplyfor.find({priseId:priseid,ispass:'1'},function(err,staff){
        if(err){
            fn(err,null)
        }else{
            var userids = new Array()
            for(var i=0;i<staff.length;i++){
                userids.push(staff[i].userId)
            }
            userids.push(userid)
            console.log(userids)
            for(var i=0;i<userids.length;i++){
                Lockauthority.remove({userId:userids[i],type:'1',roomId:roomid},function(err,docs){
                    console.log(docs)
                })
            }
            fn(null,'ok')
        }
    })
    // Lockauthority.find({userId:userid,type:'1',roomId:roomid},function(err,docs){
    //     if(err){
    //
    //     }else{
    //         var stationids = []
    //         for(var i=0;i<docs[0].stationids.length;i++){
    //             if(docs[0].stationids[i] != stationid){
    //                 stationids.push(docs[0].stationids[i])
    //             }
    //         }
    //         if(stationids.length > 0){
    //             Lockauthority.update({roomId:req.body.officeid,userId:doce.userId},{'stationids':stationids},function(err,docs){
    //                 if(err){
    //                     fn()
    //                 }else{
    //
    //                 }
    //             })
    //         }else{
    //
    //             //Lockauthority.find({userId:userid,type:'1',roomId:roomid})
    //         }
    //     }
    // })
    // Lockauthority.find({userId:userid,type:'1',roomId:roomid})
    // Staffapplyfor.find({priseId:priseid,ispass:'1'})
}
/**
 * 下载文件
 * @param fileName
 * @param fn
 */
var downloadFile = function(fileName,res,fn){
    console.log(fileName)
    var path = require('path');
    var mime = require('mime');
    var fs = require('fs');
    var file = './uploads/out.xlsx'

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);        //匹配文件格式

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.on('data', function (chunk) {
        console.log(chunk)
        //res.send(chunk);
    });
    filestream.on('end', function () {
        //fs.unlink(fileName);
        fn(null,'ok')
    });

}

//获取url请求客户端ip
var get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }
    return ip;
};

var orderType = function(interspaceid,fn){
    console.log('************'+interspaceid)
    Goodsclass.find({interspaceId:interspaceid},'classOrder className',function(err,docs){
        if(err){
            fn(err,null)
        }else {
            var arr = [
                {
                    className: '全部',
                    classOrder: 0
                },
                {
                    className: '工位',
                    classOrder: 1
                },
                {
                    className: '会议室',
                    classOrder: 2
                },
                {
                    className: '路演厅',
                    classOrder: 3
                },
                {
                    className: '健身房',
                    classOrder: 4
                },
                {
                    className: '初创咖啡',
                    classOrder: 5
                },
                {
                    className: '健身教练',
                    classOrder: 6
                },
                {
                    className: 'AA加速',
                    classOrder: 9
                },
            ]
            var data = arr.concat(docs)
            fn(null,data)
        }
    })

}

/**
 * 购物车订单钱包支付
 * @param orders
 * @param channel
 */
var orderswalletPay = function(orders,channel,req,res){
    for(var i=0;i<orders.length;i++){
        addFinance(orders[i].orderNo,orders[i].interspaceId,channel,orders[i].userId,orders[i].orderAmount,orders[i].type,orders[i].orderInfo[0].goodsId,orders[i].orderInfo[0].goodsName ,function(err,docs){

        })
    }
    var ret = errors.error0;
    ret.data = {
        data:orders[0].orderNo
    }
    apiReturn(res,ret,req.body._requestId);

}
/**
 * 微信或支付宝购物车订单支付
 * @param orders
 * @param channel
 * @param req
 * @param res
 */
var orderwxoralipayPay = function(orders,channel,req,res){
    for(var i=0;i<orders.length;i++){
        addFinance(orders[i].orderNo,orders[i].interspaceId,channel,orders[i].userId,orders[i].orderAmount,orders[i].type,orders[i].orderInfo[0].goodsId,orders[i].orderInfo[0].goodsName ,function(err,docs){

        })
        sms.sendNote(orders[i].interspaceId,orders[i].type)
    }
    res.status(200).end("success");

}

/**
 * 添加公共媒体服务
 * @param interspaceid
 * @returns {boolean}
 */
var mediatype = function(interspaceid){
    var arr = [
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154108.png',    //服务logo图片
            content:'空间入孵宣传服务',    //服务内容
            index:'1',
        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154031.png',    //服务logo图片
            content:'软文文案撰写',    //服务内容
            index:'2',

        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154059.png',    //服务logo图片
            content:'品牌策划输出',    //服务内容
            index:'3',

        },

        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154122.png',    //服务logo图片
            content:'全媒体宣传报道',    //服务内容
            index:'4',

        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154113.png',    //服务logo图片
            content:'视频拍摄、宣传',    //服务内容
            index:'5',

        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154116.png',    //服务logo图片
            content:'广告推广',    //服务内容
            index:'6',

        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154041.png',    //服务logo图片
            content:'线下活动策划组织',    //服务内容
            index:'7',

        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154053.png',    //服务logo图片
            content:'杂志内刊、印务宣传',    //服务内容
            index:'8',
            data:[
                {
                    content:'企业内刊、宣传彩页、文化册编辑制作、印刷出版'
                },
            ]
        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154103.png',    //服务logo图片
            content:'产品展示专区',    //服务内容
            index:'9',

        },
        {
            picLogo:'http://oonn7gtrq.bkt.clouddn.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20170511154049.png',    //服务logo图片
            content:'APP专区展示',    //服务内容
            index:'10',

        },

    ]
    for(var i=0;i<arr.length;i++){
        var media = new Media({
            interspaceId:interspaceid,    //空间id
            index:arr[i].index,
            picLogo:arr[i].picLogo,    //服务logo图片
            content:arr[i].content,    //服务内容
            createTime:Date.now(),  //时间
        })
        media.save(function(err,docs){
            // for(var y=0;y<arr[i].data.length;y++){
            //     var server = new Mediaserver({
            //         mediaId:docs._id,    //媒体服务id
            //         data:'',
            //         content:arr[i].data[y].content,    //服务内容
            //         createTime:Date.now(),  //时间
            //     })
            //     server.save(function(err,server){
            //         console.log(server)
            //     })
            // }

        })
    }

    return true;
}
/**
 * 添加立体媒体
 * @param interspaceid
 * @param picLogo
 * @param content
 * @param fn
 */
var addMedia = function(interspaceid,picLogo,content,fn){

    var media = new Media({
        interspaceId:interspaceid,    //空间id
        picLogo:picLogo,    //服务logo图片
        content:content,    //服务内容
        createTime:Date.now(),  //时间
    })
    media.save(function(err,docs){
        if(err){
            fn(err,null)
        }else{
            fn(null,docs)
        }
    })
}

/**
 * 添加立体媒体具体内容
 * @param mediaid
 * @param content
 * @param fn
 */
var addMediaServer = function(mediaid,content,fn){
    var server = new Mediaserver({
        mediaId:mediaid,    //媒体服务id
        data:'',
        content:content,    //服务内容
        createTime:Date.now(),  //时间
    })
    server.save(function(err,server){
        if(err){
            fn(err,null)
        }else{
            fn(null,server)
        }
    })
}
/**
 * 初始化空间
 * @param interspaceid
 */
var initializeInterspace = function(interspaceid){
    var arr = [
        {
            index:'1',
            data:[
                {
                    content:'企业品牌宣传、媒体资源对接'
                },
                {
                    content:'入孵团队主题活动公众号推广、企业新闻报道'
                },
                {
                    content:'创业故事会专题图文展示'
                },
                {
                    content:'中心电梯三块大屏、前台大屏广告发布'
                },
                {
                    content:'活动联合主办、内容微信微博平台推送转发'
                },
                {
                    content:'社群企业专题展示宣传（企业项目简介、业务对接、创客故事会）'
                },
                {
                    content:'品牌文案、策划、宣传策略咨询'
                },
            ]
        },
        {
            index:'2',
            data:[
                {
                    content:'原创活动软文、广告文案撰写'
                }
            ]
        },
        {
            index:'3',
            data:[
                {
                    content:'创业团队公关和传播策略整体计划建议，输出公关整体策划一篇'
                }
            ]
        },
        {
            index:'4',
            data:[
                {
                    content:'51家媒体：视频、纸媒、网媒、新媒体等发布活动通稿 输出报道链接（详情见媒体资源表）'
                }
            ]
        },
        {
            index:'5',
            data:[
                {
                    content:'视频bp拍摄，输出5－10分钟视频短片'
                },
                {
                    content:'企业活动拍摄、剪辑'
                },
                {
                    content:'企业宣传片、MV、花絮、人物专访5分钟'
                },
            ]
        },
        {
            index:'6',
            data:[
                {
                    content:'电视'
                },
                {
                    content:'报纸杂志'
                },
                {
                    content:'新媒体'
                },
                {
                    content:'户外LED广告大屏全城联动'
                },
                {
                    content:'自媒体：微博、微信'
                },
                {
                    content:'直播'
                },
            ]
        },
        {
            index:'7',
            data:[
                {
                    content:'媒体召集及推广 输出10+媒体参加活动'
                },
                {
                    content:'活动整个策划和传播，公众文字内容、30家媒体邀约、来访嘉宾邀约'
                },
                {
                    content:'创业类活动场地支持（百人LED路演厅、室内+创咖）'
                },

            ]
        },
        {
            index:'8',
            data:[
                {
                    content:'企业内刊、宣传彩页、文化册编辑制作、印刷出版'
                },
            ]
        },
        {
            index:'9',
            data:[
                {
                    content:'空间橱窗展示'
                },
            ]
        },
        {
            index:'10',
            data:[
                {
                    content:'企业硬广宣传专区、产品展示、企业客户导流、贴吧、推单、线上线下销售'
                },
            ]
        },
    ]
    Media.find({interspaceId:interspaceid},function(err,docs){
        for(var i=0;i<docs.length;i++){
            for(var j=0;j<arr.length;j++){
                if(docs[i].index == arr[j].index){
                    for(var x=0;x<arr[j].data.length;x++){
                        var server = new Mediaserver({
                            mediaId:docs[i]._id,    //媒体服务id
                            data:'',
                            content:arr[j].data[x].content,    //服务内容
                            createTime:Date.now(),  //时间
                        })
                        server.save(function(err,server){
                            console.log(server)
                        })
                    }
                }
            }
        }
        return true;
    })
}

var aa= function(x){
    return x.aa

}

/**
 * 一个数组去除另一个数组的元素
 * @param a
 * @param b
 * @returns {*}
 */
var array_diff = function(a, b) {
    for(var i=0;i<b.length;i++)
    {
        for(var j=0;j<a.length;j++)
        {
            if(a[j]==b[i]){
                a.splice(j,1);
                j=j-1;
            }
        }
    }
    return a;
}


var sendNote = function(){

}

/**
 * 积分收入
 * @param type
 * @param userid
 * @param goodsname
 */
var addIntegral = function(type,userid,goodsname){
    Integralconf.find({},function(err,integral){
        if(err){
            return false
        }else{
            var integralnum = 0
            var integralType
           switch(type){
               case 1:
                   //首次注册
                   for(var i=0;i<integral[0].getIntegralWay.length;i++) {
                       if (integral[0].getIntegralWay[i].type == '首次注册成功创程APP') {
                           integralnum = integral[0].getIntegralWay[i].fee
                           break;
                       }
                   }
                   integralType = 'a1'
                   break;
               case 2:
                   //任意消费
                   for(var i=0;i<integral[0].getIntegralWay.length;i++) {
                       if (integral[0].getIntegralWay[i].type == '任意消费') {
                           integralnum = integral[0].getIntegralWay[i].fee
                           break;
                       }
                   }
                   integralType = 'a3'
                   break;
               case 3:
                   //每日签到
                   for(var i=0;i<integral[0].getIntegralWay.length;i++) {
                       if (integral[0].getIntegralWay[i].type == '每日签到') {
                           integralnum = integral[0].getIntegralWay[i].fee
                           break;
                       }
                   }
                   integralType = 'a2'
                   break;
           }

            var integraldetail = new Integraldetail({
                userId:userid,        //userid
                integralWay:1,          //1获得积分2消费积分
                integralType:integralType,          //a1新用户注册a2每日签到a3消费b1
                goodsName:goodsname,          //消费的产品名称
                integralNum:integralnum,      //积分数
            })
            integraldetail.save(function(err,data){
                if(err){
                    return false
                }else{
                    console.log(integralnum)
                    if(type == 3){
                        var obj = {
                            $inc:{integral:integralnum},
                            isDaySignin:1
                        }
                    }else{
                        var obj = {
                            $inc:{integral:integralnum},
                        }
                    }
                    User.update({_id:userid},obj,function(err,result){
                        if(err){
                            return false
                        }else{
                            console.log(result)
                            return true
                        }
                    })
                }
            })
        }
    })
}

/**
 * 扣除积分
 * @param order
 */
var deductIntegral = function(order){
   if(order.integralNum > 0){
       var integraldetail = new Integraldetail({
           userId:order.userId,        //userid
           integralWay:2,          //1获得积分2消费积分
           integralType:'a3',          //a1新用户注册a2每日签到a3消费b1
           goodsName:order.orderInfo[0].goodsName,          //消费的产品名称
           integralNum:order.integralNum,      //积分数
       })
       integraldetail.save(function(err,data){
           if(err){
               return false
           }else{
               var integral = (-1)*(order.integralNum)
               User.update({_id:order.userId},{$inc:{integral:integral}},function(err,result){
                   if(err){
                       return false
                   }else{
                       console.log(result)
                       return true
                   }
               })
           }
       })
   }
}
module.exports = {
    signCheck : signCheck,
    recordRequest : recordRequest,
    apiReturn : apiReturn,
    createVercode: createVercode,
    getFlatternDistance:getFlatternDistance,
    arrayUniq:arrayUniq,
    createLeftNavByCode:createLeftNavByCode,
    createLeftNavByCodes:createLeftNavByCodes,
    timeFormat:timeFormat,
    saveToQiniu:saveToQiniu,
    createSign:createSign,
    createShopLeftNav:createShopLeftNav,
    sendJpush:sendJpush,
    judgeGoodsInventory:judgeGoodsInventory,
    orderstatusChange:orderstatusChange,
    getArrayItems:getArrayItems,
    addMesg:addMesg,
    countOrder:countOrder,
    sortByKey:sortByKey,
    addGoodsClass:addGoodsClass,
    createGroup:createGroup,
    addGroupMember:addGroupMember,
    sendMesgToGroup:sendMesgToGroup,
    addLockAuthority:addLockAuthority,
    addFinance:addFinance,
    officeTime:officeTime,
    roadshowTime:roadshowTime,
    downloadFile:downloadFile,
    orderType:orderType,
    get_client_ip:get_client_ip,
    orderswalletPay:orderswalletPay,
    cancelStation:cancelStation,
    mediatype:mediatype,
    addMedia:addMedia,
    addMediaServer:addMediaServer,
    initializeInterspace:initializeInterspace,
    gymTime:gymTime,
    orderwxoralipayPay:orderwxoralipayPay,
    aa:aa,
    array_diff:array_diff,
    sortNumberByKey:sortNumberByKey,
    addIntegral:addIntegral,
    deductIntegral:deductIntegral
}