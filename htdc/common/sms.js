var config = require("./config");
var md5 = require('md5');
var request = require("request");
var functions = require("../common/functions");
var mongoose = require("mongoose");
var Interspace = mongoose.model("Interspace");
var Goodsclass = mongoose.model("Goodsclass");
var Link = mongoose.model("Link");
var errors = require("./errors");
var accountSid = config.ytx.ytxAccountSid;
var authToken = config.ytx.ytxAuthToken;
var restUrl = config.ytx.ytxUrl;
var appId = config.ytx.ytxAppId;
var version = config.ytx.ytxVersion;
/**
 * 格式化时间函数
 * @param fmt
 * @returns {*}
 * @constructor
 */
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 发短信验证码接口
 * @param res response对象
 * @param cellphone 电话号码·
 * @param templateId 短信模版Id
 * @param content 短信内容，格式如“['232453','5']”
 * @param requestId 请求id
 */
var sendSmsToPhone = function (res,cellphone,templateId,content,requestId) {
    //生成验证签名
    var timeStr = new Date().Format("yyyyMMddhhmmss");
    var sig =  md5(accountSid+authToken+timeStr).toUpperCase();
    // 生成请求URL
    var url = restUrl + "/" + version + "/Accounts/" + accountSid + "/SMS/TemplateSMS?sig=" + sig;
    // 生成授权：主帐户Id + 英文冒号 + 时间戳。
    var authen = new Buffer(accountSid + ":" + timeStr).toString("base64");
    //发送的数据
    var data = {
        to:cellphone,
        appId:appId,
        templateId:templateId,
        datas:content,
    }
    //发送请求
    var headers = {
        Authorization: authen,
        Accept: 'application/json'
    };
    headers['Content-Type'] = 'application/json;charset=utf-8;';
    request.post({
        url: url,
        headers: headers,
        body: JSON.stringify(data),
    }, function(err, response, body){
        //回调函数
        if (err){//如果调用接口出错
            functions.apiReturn(res,errors.error10004,requestId);
        }else{
            body = JSON.parse(body);
            console.log(body)
            if (body.statusCode == '000000'){//如果发送成功
                var ret = errors.error0;
                ret.data = {body:body};
                ret._requestId = requestId
                // functions.apiReturn(res,ret,requestId);

                res.status(200).json(ret)
            }else{//如果发送失败
                var ret = errors.error10005;
                ret.message = body.statusMsg;
                ret._requestId = requestId
                res.status(200).json(ret)
                //functions.apiReturn(res,ret,requestId);
            }

        }
    });
}


var sendNote = function(interspaceid,type){
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
            var ordertype = arr.concat(docs)
            var content = []
            for(var i=0;i<ordertype.length;i++){
                if(ordertype[i].classOrder == type){
                    content.push(ordertype[i].className)
                }
            }
            console.log(content)
            if(type == 5){
                var obj = {
                    serviceType:type
                }
            }else{
                var obj = {
                    interspaceId:interspaceid,
                    serviceType:type
                }
            }
            if(type == 7){
                content.push('打印复印')
            }
            Link.find(obj,function(err,link){
                if(link.length > 0){
                    //生成验证签名
                    var timeStr = new Date().Format("yyyyMMddhhmmss");
                    var sig =  md5(accountSid+authToken+timeStr).toUpperCase();
                    // 生成请求URL
                    var url = restUrl + "/" + version + "/Accounts/" + accountSid + "/SMS/TemplateSMS?sig=" + sig;
                    // 生成授权：主帐户Id + 英文冒号 + 时间戳。
                    var authen = new Buffer(accountSid + ":" + timeStr).toString("base64");
                    console.log(link[0].linkPhone + '@@@@@@@@@@@@@@@@' +content)
                    //发送的数据
                    var data = {
                        to:link[0].linkPhone,
                        appId:appId,
                        templateId:config.ytx.nodeTemplateId,
                        datas:content,
                    }
                    //发送请求
                    var headers = {
                        Authorization: authen,
                        Accept: 'application/json'
                    };
                    headers['Content-Type'] = 'application/json;charset=utf-8;';
                    request.post({
                        url: url,
                        headers: headers,
                        body: JSON.stringify(data),
                    }, function(err, response, body){
                        console.log(body)
                        //回调函数
                        if (err){//如果调用接口出错
                            return false
                        }else{
                            body = JSON.parse(body);
                            console.log(body)
                            if (body.statusCode == '000000'){//如果发送成功
                                return true
                            }else{//如果发送失败
                                return false
                            }

                        }
                    });
                }
            })
        }
    })


    // functions.orderType(interspaceid,function(err,ordertype){
    //
    // })
}
module.exports = {
    sendSmsToPhone:sendSmsToPhone,
    sendNote:sendNote
}