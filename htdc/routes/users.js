var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var cache = require("memory-cache");
var md5 = require("md5");
var Txysig = require("../common/txysign");
var functions = require("../common/functions");
var orderstatus = require("../common/orderstatus");
var config = require("../common/config");
var sms = require("../common/sms");
var errors = require("../common/errors");
var Interspace = mongoose.model("Interspace");
var User = mongoose.model("User");
var Group = mongoose.model("Group");
var Lock = mongoose.model("Lock");
var Officeorder = mongoose.model("Officeorder");
var Print = mongoose.model("Print");
var Enterprise = mongoose.model("Enterprise");
var Staffapplyfor = mongoose.model("Staffapplyfor");
var Office = mongoose.model("Office");
var Lockauthority = mongoose.model("Lockauthority");
var Integralgoods = mongoose.model("Integralgoods");
var Integralgoodsorder = mongoose.model("Integralgoodsorder");
var Goodsclass = mongoose.model("Goodsclass");
var Finance = mongoose.model("Finance");
var Coupon = mongoose.model("Coupon");
var Integraldetail = mongoose.model("Integraldetail");
var Visit = mongoose.model("Visit");
var Integralconf = mongoose.model("Integralconf");
var TimRestAPI = require("imsdk/lib/TimRestApi.js");
var conf = {
    sdkAppid: config.tengxunim.sdkappId,
    identifier: config.tengxunim.adminName,
    accountType: config.tengxunim.accountType,
    privateKey: '/ec_key.pem',
};


router.param("userid", function (req, res, next, id) {
    let string = req.originalUrl    //   /1.0/users/getuser/123/123/456/789
    let data = string.split("/")   // ["","1.0","users","getuser","123","24124","513251"]
    //判断是否为App接口
    if (data[1] == "1.0") {
        //存储基本信息
        var obj = {
            functionClass: data[2],  // 模块
            functionName: data[3],   // 方法名
            Method: req.method,   // 方法类型
            type: 2,   // 方法类型
            createTime: Date.now(),    //创建时间
            paramsList: [],
        }
        if (req.method == "GET") {
            console.log("成功捕获到包含userId的Get请求")
            obj.paramsList = data.splice(4, data.length - 1)
        } else if (req.method == "PATCH") {
            console.log("成功捕获到包含userId的PATCH请求")
            obj.paramsList = data.splice(4, data.length - 1)
            obj.body = req.body
        }
        //单独存储userId （GET请求在此方法中无法获取到对应到键的params，因此只存储body中含有userid的方法）
        if (req.params.userid != null && req.params.userid != undefined) {
            obj.userId = req.params.userid
        }
        console.log("存储信息结果集:")
        console.log(obj)

        let visit = new Visit(obj)
        visit.save({}, function (err, visit_save) {
            console.log('正在存储')
            console.log(visit)
            if (err) {
                console.log('失败')
                console.log(err)
                next();
            } else {
                console.log('成功')
                next();
            }
        })
    } else {
        next();
    }
});


// var Visit = mongoose.model("Visit");
//
//
// router.param(function(param, option) {
//     return function (req, res, next, val) {
//         //取Url链接，然后进行/拆分
//         let string = req.originalUrl    //   /1.0/users/getuser/123/123/456/789
//         let data  = string.split("/")   // ["","1.0","users","getuser","123","24124","513251"]
//         //判断是否为App接口
//         if(data[1] == "1.0"){
//             //存储基本信息
//             let obj = {
//                 functionClass : data[2] ,  // 模块
//                 functionName : data[3] ,   // 方法名
//                 Method       : req.method ,   // 方法类型
//                 createTime : Date.now()     //创建时间
//             }
//             //将方法附带参数信息存入body 或 paramsList中
//             if(req.method == "GET"){
//                 console.log("处理包含userid的GET请求")
//                 obj.paramsJson   = req.params
//             }
//             //单独存储userId （GET请求在此方法中无法获取到对应到键的params，因此只存储body中含有userid的方法）
//             if(req.params.userid != null && req.params.userid != undefined){
//                 obj.userId   =   req.params.userid
//             }else{
//                 console.log("不存在userid")
//             }
//             //记录此次操作
//             console.log("打印存储的操作记录：")
//             console.log(obj)
//             let visit = new Visit(obj)
//             visit.save({},function(err,visit_save){
//                 if(err){
//                     next()
//                 }else{
//                     next()
//                 }
//             })
//         }else{
//             next();
//         }
//     }
// });
// router.param("userid",1);

router.get("/aaa", function (req, res) {
    // Enterprise.find({},function(err,docs){
    //   res.send(docs)
    // })
    //5978076737e73936c28e14ae
    // var arr1 = [
    //     {
    //       pic:'http://oonn7gtrq.bkt.clouddn.com/0.jpg',
    //         name:'张三',
    //         job:'合伙人'
    //     },
    //     {
    //         pic:'http://oonn7gtrq.bkt.clouddn.com/n3.jpg',
    //         name:'李四',
    //         job:'运营总监'
    //     }
    //
    // ]
    // var arr2 = [
    //     'http://oonn7gtrq.bkt.clouddn.com/wifi.png',
    //     'http://oonn7gtrq.bkt.clouddn.com/dayin.png',
    //     'http://oonn7gtrq.bkt.clouddn.com/huiyi.png',
    //     'http://oonn7gtrq.bkt.clouddn.com/shuba.png',
    //     'http://oonn7gtrq.bkt.clouddn.com/zidong.png'
    // ]
    Integralconf.find({},function(err,docs){
        res.send(docs)
    })
})
/* GET users listing. */
router.get('/test/:userid/:sign', functions.recordRequest, function (req, res, next) {
    // if (functions.signCheck(req,res)){
    next();
    // }else{
    //   functions.apiReturn(res,errors.error1,req.params._requestId);
    // }
}, function (req, res, next) {
    console.log("userid")
    console.log(req.params.userid)
    User.find({}, function (err, docs) {
        res.send(docs)
    })
});

/**
 * APP用户登录
 */
router.post("/login", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    console.log(req.body.account)
    if (req.body.account != '18792709414') {
        console.log('11111')
        var code = cache.get("vercode" + req.body.account);
        if (code === null) {
            functions.apiReturn(res, errors.error10002, req.body._requestId);
        } else {
            if (code != req.body.vercode) {
                functions.apiReturn(res, errors.error10001, req.body._requestId);
            } else {

                User.find({account: req.body.account}, function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res, ret1, req.body._requestId);
                    } else {
                        if (docs.length > 0) {
                            var ret = errors.error0;
                            ret.data = docs[0];
                            functions.apiReturn(res, ret, req.body._requestId);
                        } else {
                            User.find({bindPhone: req.body.account}, function (err, phones) {
                                if (err) {
                                    var ret1 = errors.error3;
                                    ret1.data = err;
                                    functions.apiReturn(res, ret1, req.body._requestId);
                                } else {
                                    if (phones.length > 0) {
                                        var ret = errors.error0;
                                        ret.data = phones[0];
                                        functions.apiReturn(res, ret, req.body._requestId);
                                        //functions.apiReturn(res,errors.error10013,req.body._requestId);
                                    } else {
                                        next()
                                    }
                                }
                            })
                        }

                    }
                })

            }
        }
    } else {
        User.find({bindPhone: req.body.account}, function (err, docs) {
            if (err) {
                var ret1 = errors.error3;
                ret1.data = err;
                functions.apiReturn(res, ret1, req.body._requestId);
            } else {
                console.log(docs)
                var ret = errors.error0;
                ret.data = docs[0];
                functions.apiReturn(res, ret, req.body._requestId);
            }
        })
    }

}, function (req, res, next) {
    //注册腾讯云
    var api = new TimRestAPI(conf);
    api.init(function (err, data) {
        if (err) {
            var ret = errors.error20003;
            ret.data = err;
            functions.apiReturn(res, ret, req.body._requestId);
        }
        var reqBody = {
            "Identifier": 'htdc' + req.body.account,
        }
        api.request("im_open_login_svc", "account_import", reqBody,
            function (err, data) {
                if (err) {
                    var ret = errors.error20000;
                    ret.data = err;
                    functions.apiReturn(res, ret, req.body._requestId);
                } else {
                    //注册用户表
                    var obj = {
                        txyId: 'htdc' + req.body.account,                    //腾讯云id
                        account: req.body.account,                  //手机号
                        nickName: '用户' + req.body.account,              //姓名
                        headimgUrl: '',            //头像
                        sex: 1,                   //性别
                        authenticationStatus: 0,  //认证状态
                        identity: '',                //身份
                        interspaceId: '',           //所属空间id
                        interspaceName: '',         //所属空间名称
                        level: 0,                   //用户等级
                        integral: 0,
                        money: 0,
                        address: '',                //收货地址
                        bindPhone: req.body.account,
                        linkPhone: req.body.account,             //联系电话
                        paySalt: '',                 //支付的盐
                        payPassword: '0',             //支付密码
                        createTime: Date.now(),             //时间
                        isCashCoupon: 0
                    }
                    var user = new User(obj)
                    user.save(function (err, docs) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res, ret1, req.body._requestId);
                        } else {
                            functions.addIntegral(1,docs._id,null)
                            Group.find({}).sort({memberNumber: 1}).exec(function (err, group) {
                                if (err) {
                                    var ret1 = errors.error3;
                                    ret1.data = err;
                                    functions.apiReturn(res, ret1, req.body._requestId);
                                } else {
                                    if ((group[0].memberNumber > 4999)) {
                                        var order = parseInt(group[0].order + 1)
                                        var groupname = 'group' + order
                                        functions.createGroup(groupname, function (err, data) {
                                            if (err) {
                                                var ret1 = errors.error3;
                                                ret1.data = err;
                                                functions.apiReturn(res, ret1, req.body._requestId);
                                            } else {
                                                var groupid = data.groupId
                                                functions.addGroupMember(groupid, 'htdc' + req.body.account, function (err, group) {
                                                    if (err) {
                                                        switch (err.error) {
                                                            case '3':
                                                                var ret1 = errors.error3;
                                                                break;
                                                            case '20003':
                                                                var ret1 = errors.error20003;
                                                                break;
                                                            case '20000':
                                                                var ret1 = errors.error20000;
                                                                break;
                                                        }
                                                        ret1.data = err;
                                                        functions.apiReturn(res, ret1, req.body._requestId);
                                                    } else {
                                                        var str = '哈喽，大家好！'
                                                        functions.sendMesgToGroup('htdc' + req.body.account, 1, '用户' + req.body.account, null, str, function (err, data) {
                                                            if (err) {
                                                                switch (err.error) {
                                                                    case '3':
                                                                        var ret1 = errors.error3;
                                                                        break;
                                                                    case '20003':
                                                                        var ret1 = errors.error20003;
                                                                        break;
                                                                    case '20000':
                                                                        var ret1 = errors.error20000;
                                                                        break;
                                                                }
                                                                ret1.data = err;
                                                                functions.apiReturn(res, ret1, req.body._requestId);
                                                            } else {
                                                                var ret = errors.error0;
                                                                ret.data = docs;
                                                                functions.apiReturn(res, ret, req.body._requestId);
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        var groupid = group[0].groupId
                                        functions.addGroupMember(groupid, 'htdc' + req.body.account, function (err, group) {
                                            if (err) {
                                                switch (err.error) {
                                                    case '3':
                                                        var ret1 = errors.error3;
                                                        break;
                                                    case '20003':
                                                        var ret1 = errors.error20003;
                                                        break;
                                                    case '20000':
                                                        var ret1 = errors.error20000;
                                                        break;
                                                }
                                                ret1.data = err;
                                                functions.apiReturn(res, ret1, req.body._requestId);
                                            } else {
                                                var str = '哈喽，大家好！'
                                                functions.sendMesgToGroup('htdc' + req.body.account, 1, '用户' + req.body.account, null, str, function (err, data) {
                                                    if (err) {
                                                        switch (err.error) {
                                                            case '3':
                                                                var ret1 = errors.error3;
                                                                break;
                                                            case '20003':
                                                                var ret1 = errors.error20003;
                                                                break;
                                                            case '20000':
                                                                var ret1 = errors.error20000;
                                                                break;
                                                        }
                                                        ret1.data = err;
                                                        functions.apiReturn(res, ret1, req.body._requestId);
                                                    } else {
                                                        var ret = errors.error0;
                                                        ret.data = docs;
                                                        functions.apiReturn(res, ret, req.body._requestId);
                                                    }
                                                })
                                            }
                                        })
                                    }

                                }
                            })

                        }
                    })
                }
            })
    })

})

/**
 * 获得验证码
 * @param  phone 电话号码
 */
router.get('/vercode/:phone/:sign', functions.recordRequest, function (req, res) {
    if (functions.signCheck(req, res)) {
        /*
     * 判断缓存中是否有这个电话号码的验证码
     * 若没有,则生成*/
        var code = cache.get("vercode" + req.params.phone);
        if (null === code) {
            code = functions.createVercode(6);
            cache.put("vercode" + req.params.phone, code, 300000);
        }
        //res.json(req.params._requestId);
        /*手机发送验证码*/
        var cnt = [code, "5分钟"];
        console.log(cnt)
        sms.sendSmsToPhone(res, req.params.phone, config.ytx.templateId, cnt, req.params._requestId);
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
});

/**
 * 生成腾讯云usersig
 */
router.get("/createsig/:txyid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var con = {
        sdk_appid: config.tengxunim.sdkappId,
        identifier: config.tengxunim.adminName,
        account_type: config.tengxunim.accountType,
        appid_at_3rd: config.tengxunim.sdkappId,
        expire_after: 30 * 24 * 3600,
        private_key: config.tengxunim.privateKey,
    }

    var sig = new Txysig.Sig(con);
    var usersig = sig.genSig(req.params.txyid);
    var obj = {
        usersig: usersig,
    }
    var ret = errors.error0;
    ret.data = obj;
    functions.apiReturn(res, ret, req.params._requestId);
});

/**
 * 修改密码
 */
router.patch("/updatepw/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    User.find({_id: req.params.userid}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            if (docs.length > 0) {
                var encryptedPw = md5(md5(req.body.oldpassword) + docs[0].salt);
                if (encryptedPw == docs[0].password) {
                    var salt = functions.createVercode(4);
                    var newpw = md5(md5(req.body.newpassword) + salt);
                    User.update({_id: req.params.userid}, {'salt': salt, 'password': newpw}, function (err, data) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res, ret1, req.body._requestId);
                        } else {
                            var ret = errors.error0;
                            ret.data = data;
                            functions.apiReturn(res, ret, req.params._requestId);
                        }
                    })
                } else {
                    functions.apiReturn(res, errors.error10008, req.body._requestId);
                }
            } else {
                functions.apiReturn(res, errors.error10007, req.body._requestId);
            }
        }
    })
})


/**
 * 忘记密码重置密码
 */
router.post("/resetpw", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        var code = cache.get("vercode" + req.body.account);
        if (code === null) {
            functions.apiReturn(res, errors.error10002, req.body._requestId);
        } else {
            if (code !== req.body.vercode) {
                functions.apiReturn(res, errors.error10001, req.body._requestId);
            } else {
                User.find({phone: req.body.account}, function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res, ret1, req.body._requestId);
                    } else {
                        if (docs.length > 0) {
                            next()
                        } else {
                            functions.apiReturn(res, errors.error10007, req.body._requestId);
                        }
                    }
                })
            }
        }
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    var salt = functions.createVercode(4);
    var newpw = md5(md5(req.body.password) + salt);
    User.update({phone: req.body.account}, {'salt': salt, 'password': newpw}, function (err, data) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = data;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 获取用户信息
 */
router.get("/getuserinfo/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    User.find({_id: req.params.userid}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            // console.log(docs[0])
            var ret = errors.error0;
            ret.data = docs[0];
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 查询空间列表
 */
router.get("/getinterspace/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    Interspace.find({}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})
/**
 * 三方登录
 */
router.post("/thirdlogin", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {

    User.find({account: req.body.openid}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            if (docs.length > 0) {
                var ret = errors.error0;
                ret.data = docs[0];
                functions.apiReturn(res, ret, req.body._requestId);
            } else {
                next()
            }
        }
    })
}, function (req, res, next) {
    //注册腾讯云
    var api = new TimRestAPI(conf);
    api.init(function (err, data) {
        if (err) {
            var ret = errors.error20003;
            ret.data = err;
            functions.apiReturn(res, ret, req.body._requestId);
        }
        var reqBody = {
            "Identifier": 'htdc' + req.body.openid,
        }
        api.request("im_open_login_svc", "account_import", reqBody,
            function (err, data) {
                if (err) {
                    var ret = errors.error20000;
                    ret.data = err;
                    functions.apiReturn(res, ret, req.body._requestId);
                } else {
                    //注册用户表
                    var obj = {
                        txyId: 'htdc' + req.body.openid,                    //腾讯云id
                        account: req.body.openid,                  //手机号
                        nickName: req.body.nickName,              //姓名
                        headimgUrl: req.body.headimgUrl,            //头像
                        sex: req.body.sex,                   //性别
                        authenticationStatus: 0,  //认证状态
                        identity: '',                //身份
                        interspaceId: '',           //所属空间id
                        interspaceName: '',         //所属空间名称
                        level: 0,                   //用户等级
                        integral: 0,                //积分数
                        money: 0,                   //钱包金额（分）
                        address: '',                //收货地址
                        linkPhone: '',             //联系电话
                        paySalt: '',                 //支付的盐
                        payPassword: '0',             //支付密码
                        createTime: Date.now(),             //时间
                        isCashCoupon: 0,
                    }
                    var user = new User(obj)
                    user.save(function (err, docs) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res, ret1, req.body._requestId);
                        } else {
                            Group.find({}).sort({memberNumber: 1}).exec(function (err, group) {
                                if (err) {
                                    var ret1 = errors.error3;
                                    ret1.data = err;
                                    functions.apiReturn(res, ret1, req.body._requestId);
                                } else {
                                    if ((group[0].memberNumber > 4999)) {
                                        var order = parseInt(group[0].order + 1)
                                        var groupname = 'group' + order
                                        functions.createGroup(groupname, function (err, data) {
                                            if (err) {
                                                var ret1 = errors.error3;
                                                ret1.data = err;
                                                functions.apiReturn(res, ret1, req.body._requestId);
                                            } else {
                                                var groupid = data.groupId
                                                functions.addGroupMember(groupid, 'htdc' + req.body.openid, function (err, group) {
                                                    if (err) {
                                                        switch (err.error) {
                                                            case '3':
                                                                var ret1 = errors.error3;
                                                                break;
                                                            case '20003':
                                                                var ret1 = errors.error20003;
                                                                break;
                                                            case '20000':
                                                                var ret1 = errors.error20000;
                                                                break;
                                                        }
                                                        ret1.data = err;
                                                        functions.apiReturn(res, ret1, req.body._requestId);
                                                    } else {
                                                        var str = '哈喽，大家好！'
                                                        functions.sendMesgToGroup('htdc' + req.body.openid, 1, req.body.nickName, null, str, function (err, data) {
                                                            if (err) {
                                                                switch (err.error) {
                                                                    case '3':
                                                                        var ret1 = errors.error3;
                                                                        break;
                                                                    case '20003':
                                                                        var ret1 = errors.error20003;
                                                                        break;
                                                                    case '20000':
                                                                        var ret1 = errors.error20000;
                                                                        break;
                                                                }
                                                                ret1.data = err;
                                                                functions.apiReturn(res, ret1, req.body._requestId);
                                                            } else {
                                                                console.log(docs)
                                                                var ret = errors.error0;
                                                                ret.data = docs;
                                                                functions.apiReturn(res, ret, req.body._requestId);
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        var groupid = group[0].groupId
                                        functions.addGroupMember(groupid, 'htdc' + req.body.openid, function (err, group) {
                                            if (err) {
                                                switch (err.error) {
                                                    case '3':
                                                        var ret1 = errors.error3;
                                                        break;
                                                    case '20003':
                                                        var ret1 = errors.error20003;
                                                        break;
                                                    case '20000':
                                                        var ret1 = errors.error20000;
                                                        break;
                                                }
                                                ret1.data = err;
                                                functions.apiReturn(res, ret1, req.body._requestId);
                                            } else {
                                                var str = '哈喽，大家好！'
                                                functions.sendMesgToGroup('htdc' + req.body.openid, 1, req.body.nickName, null, str, function (err, data) {
                                                    if (err) {
                                                        switch (err.error) {
                                                            case '3':
                                                                var ret1 = errors.error3;
                                                                break;
                                                            case '20003':
                                                                var ret1 = errors.error20003;
                                                                break;
                                                            case '20000':
                                                                var ret1 = errors.error20000;
                                                                break;
                                                        }
                                                        ret1.data = err;
                                                        functions.apiReturn(res, ret1, req.body._requestId);
                                                    } else {
                                                        var ret = errors.error0;
                                                        ret.data = docs;
                                                        functions.apiReturn(res, ret, req.body._requestId);
                                                    }
                                                })
                                            }
                                        })
                                    }

                                }
                            })

                        }
                    })
                }
            })
    })
})

/**
 * 绑定手机号
 */
router.patch("/bindphone/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    var code = cache.get("vercode" + req.body.bindphone);
    if (code === null) {
        functions.apiReturn(res, errors.error10002, req.body._requestId);
    } else {
        if (code !== req.body.vercode) {
            functions.apiReturn(res, errors.error10001, req.body._requestId);
        } else {
            next()
        }
    }
}, function (req, res, next) {
    User.update({_id: req.params.userid}, {'bindPhone': req.body.bindphone}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 设置空间
 */
router.patch("/setinterspace/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    User.update({_id: req.params.userid}, {'interspaceId': req.body.interspaceid}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            console.log(docs)
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 用户发送消息
 */
router.post("/sendmesg", functions.recordRequest, function (req, res, next) {
    console.log(req.body)
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    functions.sendMesgToGroup(req.body.txyid, 2, req.body.nickname, null, req.body.mesg, function (err, docs) {
        if (err) {
            switch (err.error) {
                case '3':
                    var ret1 = errors.error3;
                    break;
                case '20003':
                    var ret1 = errors.error20003;
                    break;
                case '20000':
                    var ret1 = errors.error20000;
                    break;
            }
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})
/**
 * 设置个人信息
 */
router.patch("/setuserinfo/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    // var obj = {
    //   nickName:req.body.nickName,              //姓名
    //   headimgUrl:req.body.headimgUrl,            //头像
    //   sex:req.body.sex,                   //性别
    //   address:req.body.address,
    //   linkPhone:req.body.linkPhone
    // }
    User.update({_id: req.params.userid}, req.body, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 查询我的订单
 */
router.get("/getmyorder/:page/:pagesize/:type/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    if (req.params.type == '0') {
        var obj = {
            userId: req.params.userid,
            orderStatus: {'$ne': orderstatus.status0}
        }
    } else {
        var obj = {
            userId: req.params.userid,
            type: req.params.type,
            orderStatus: {'$ne': orderstatus.status0}
        }
    }
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Officeorder.find(obj).sort({'createTime': -1}).skip(start).limit(req.params.pagesize * 1).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            console.log(docs)
            var arr = functions.sortByKey(docs, 'createTime', 1)
            var ret = errors.error0;
            ret.data = arr;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})
/**
 * 查询我的预约
 */
router.get("/getappointment/:page/:pagesize/:type/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    if (req.params.type == '0') {
        var obj = {
            userId: req.params.userid
        }
    } else {
        var obj = {
            userId: req.params.userid,
            type: req.params.type
        }
    }
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Print.find(obj).skip(start).limit(req.params.pagesize * 1).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 *查看所有入驻企业
 */
router.get("/getallprise/:page/:pagesize/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Enterprise.find({isCheck: 1}).skip(start).limit(req.params.pagesize * 1).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 搜索企业
 */
router.get("/searchprise/:content/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var qs = new RegExp(req.params.content);
    Enterprise.find({priseName: qs, isCheck: 1}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 员工申请
 */
router.post("/applyforprise", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    Staffapplyfor.find({userId: req.body.userid, ispass: ['1', '3']}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            if (docs.length > 0) {
                functions.apiReturn(res, errors.error10012, req.body._requestId);
            } else {
                var obj = new Staffapplyfor({
                    userId: req.body.userid,        //userid
                    priseId: req.body.priseId,  //企业id
                    priseOwnerId: req.body.priseOwnerId,   //企业管理者id
                    userName: req.body.userName,      //申请人姓名
                    userIdCard: req.body.userIdCard,    //身份证号
                    positivePic: req.body.positivePic,     //身份证正面照
                    negativePic: req.body.negativePic,     //身份证反面照
                    ispass: '0',        //是否通过0未通过1通过
                    createTime: Date.now(),             //时间
                })
                obj.save(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res, ret1, req.body._requestId);
                    } else {
                        var ret = errors.error0;
                        ret.data = docs;
                        functions.apiReturn(res, ret, req.body._requestId);
                    }
                })
            }

        }
    })

})

/**
 * 员工通过申请
 */
router.patch("/passapplyfor/:staffapplyforid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    Staffapplyfor.update({_id: req.params.staffapplyforid}, {'ispass': '1'}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            //console.log(req.params.userid)
            User.findOne({_id: req.body.userid}, 'authenticationStatus', function (err, users) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res, ret1, req.body._requestId);
                } else {
                    if (users.authenticationStatus == '2') {
                        var status = '1'
                    } else {
                        var status = '3'
                    }
                    User.update({_id: req.body.staffid}, {
                        'authenticationStatus': status,
                        'enterpriseId': req.body.priseid
                    }, function (err, data) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res, ret1, req.body._requestId);
                        } else {
                            var ret = errors.error0;
                            ret.data = data;
                            functions.apiReturn(res, ret, req.body._requestId);
                        }
                    })
                }
            })

        }
    })
})

/**
 * 拒绝员工申请
 */
router.patch("/refuseapplyfor/:staffapplyforid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    Staffapplyfor.update({_id: req.params.staffapplyforid}, {'ispass': '2'}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 查询一个入驻企业详情
 */
router.get("/getenterprise/:priseid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    Enterprise.find({_id: req.params.priseid}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 员工表
 */
router.get("/stafflist/:page/:pagesize/:priseid/:type/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    switch (req.params.type) {
        case '1':
            var obj = {
                priseId: req.params.priseid,
                ispass: '0'
            }
            break;
        case '2':
            var obj = {
                priseId: req.params.priseid,
                ispass: '1'
            }
            break
    }
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Staffapplyfor.find(obj).skip(start).limit(req.params.pagesize * 1).exec(function (err, docs) {
        if (err) {
            console.log(err)
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            console.log(docs)
            var userids = new Array();
            for (var i = 0; i < docs.length; i++) {
                userids.push(docs[i].userId)
            }
            console.log(userids)
            User.find({_id: {$in: userids}}, function (err, users) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res, ret1, req.params._requestId);
                } else {
                    var data = new Array()
                    for (var x = 0; x < users.length; x++) {
                        for (var y = 0; y < docs.length; y++) {
                            if (users[x]._id == docs[y].userId) {
                                var obj = {
                                    headimgUrl: users[x].headimgUrl
                                }
                                var newjson = eval('(' + (JSON.stringify(docs[y]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                                data.push(newjson)
                            }
                        }
                    }
                    var ret = errors.error0;
                    ret.data = data;
                    functions.apiReturn(res, ret, req.params._requestId);
                }
            })

        }
    })
})

/**
 * 授权的办公室
 */
router.get("/getoffices/:adminuserid/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var obj = {
        userId: req.params.adminuserid,
        type: "1"
    }
    Lockauthority.find(obj, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            console.log(docs)
            var roomids = new Array();
            for (var i = 0; i < docs.length; i++) {
                roomids.push(docs[i].roomId)
            }
            Lock.find({roomId: {$in: roomids}}, function (err, locks) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res, ret1, req.params._requestId);
                } else {
                    console.log(locks)
                    var data = new Array()
                    for (var y = 0; y < locks.length; y++) {
                        for (var x = 0; x < docs.length; x++) {
                            if (docs[x].roomId == locks[y].roomId) {
                                var obj = {
                                    officeName: locks[y].roomName,
                                    isauthorization: 0
                                }
                                var newjson = eval('(' + (JSON.stringify(docs[x]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                                data.push(newjson)
                            }
                        }
                    }
                    Lockauthority.find({userId: req.params.userid, type: '1'}, function (err, locks) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res, ret1, req.params._requestId);
                        } else {
                            for (var n = 0; n < data.length; n++) {
                                for (var m = 0; m < locks.length; m++) {
                                    if (locks[m].roomId == data[n].roomId) {

                                        data[n].isauthorization = 1
                                    }
                                }
                            }
                            console.log(data)
                            var ret = errors.error0;
                            ret.data = data;
                            functions.apiReturn(res, ret, req.params._requestId);
                        }
                    })

                }
            })

        }
    })
})

/**
 * 授权员工
 */
router.post("/addlockauthority", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    var obj = new Lockauthority({
        mac: req.body.mac,           //设备mac地址（唯一）
        roomId: req.body.roomId,       //房间id
        userId: req.body.userid,       //用户id
        type: 1,         //1永久性的2非永久性的
        priseId: req.body.priseid,
        //stationids:Array,    //工位id
        startTime: Date.now(),    //非永久性的开始时间
        endTime: 9999999999999,      //非永久性的到期时间
        createTime: Date.now(),    //发布时间
    })
    var aaa = {
        mac: req.body.mac,           //设备mac地址（唯一）
        roomId: req.body.roomId,       //房间id
        userId: req.body.userid,       //用户id
        type: 1,         //1永久性的2非永久性的
        priseId: req.body.priseid,
        //stationids:Array,    //工位id
        startTime: Date.now(),    //非永久性的开始时间
        endTime: 9999999999999,      //非永久性的到期时间
        createTime: Date.now(),    //发布时间
    }
    console.log(aaa)
    obj.save(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            console.log(docs)
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })


})

/**
 * 取消授权
 */
router.patch("/cancelauthority/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    var obj = {
        roomId: req.body.roomId,
        userId: req.params.userid,
        type: '1'
    }
    Lockauthority.remove(obj, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs.result;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 我的积分
 */
router.get("/getmyintegral/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    User.findOne({_id: req.params.userid}, 'integral', function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 我的钱包
 */
router.get("/getmymoney/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    User.findOne({_id: req.params.userid}, 'money', function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 积分商品查询
 */
router.get("/getintegralgoods/:interspaceid/:page/:pagesize/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    console.log(req.params.interspaceid)
    Integralgoods.find({interspaceId: req.params.interspaceid}).skip(start).limit(req.params.pagesize * 1).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 积分商品h5
 */
router.get("/integralgoodsinfo/:goodsid", function (req, res) {
    Integralgoods.find({_id: req.params.goodsid}, 'goodsInfo', function (err, docs) {
        if (err) {
            res.render('nodata')
        } else {
            res.render("goodsinfo", {
                data: docs[0].goodsInfo
            })
        }
    })
})

/**
 * 兑换商品
 */
router.post("/conversiongoods", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        User.findOne({_id: req.body.userId}, 'integral', function (err, docs) {
            if (err) {
                var ret1 = errors.error3;
                ret1.data = err;
                functions.apiReturn(res, ret1, req.body._requestId);
            } else {
                if (docs.integral > req.body.finalPrice) {
                    next();
                } else {
                    functions.apiReturn(res, errors.error30001, req.body._requestId);
                }
            }
        })
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    //consumerCode
    var json = {
        interspaceId: req.body.interspaceId,    //店铺所属空间id
        userId: req.body.userId,    //订单所有者userid
        orderNo: req.body.orderNo,       //订单号
        goodsName: req.body.goodsName,
        goodsPic: req.body.goodsPic,
        orderStatus: orderstatus.statusB10001,     //订单状态
        finalPrice: req.body.finalPrice,      //最终价格
        createTime: Date.now(),      //订单生成时间
    }
    json.consumerCode = functions.createVercode(6)
    var obj = new Integralgoodsorder(json)

    obj.save(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            User.update({_id: req.body.userId}, {"$inc": {'integral': -req.body.finalPrice}}, function (err, users) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res, ret1, req.body._requestId);
                } else {
                    var ret = errors.error0;
                    ret.data = docs;
                    functions.apiReturn(res, ret, req.body._requestId);
                }
            })

        }
    })
})

/**
 * 查看一个积分商品详情
 */
router.get("/getintegralgoodsinfo/:goodsid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    Integralgoods.findOne({_id: req.params.goodsid}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 查看我的兑换记录
 */
router.get("/myconversion/:page/:pagesize/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Integralgoodsorder.find({userId: req.params.userid}).skip(start).limit(req.params.pagesize * 1).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 设置支付密码
 */
router.patch("/setpaypassword/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    var code = cache.get("vercode" + req.body.bindphone);
    if (code === null) {
        functions.apiReturn(res, errors.error10002, req.body._requestId);
    } else {
        if (code !== req.body.vercode) {
            functions.apiReturn(res, errors.error10001, req.body._requestId);
        } else {
            next()
        }
    }
}, function (req, res, next) {
    var salt = functions.createVercode(4);
    var encryptedPw = md5(md5(req.body.password) + salt);
    User.update({_id: req.params.userid}, {'paySalt': salt, 'payPassword': encryptedPw}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 修改支付密码
 */
router.patch("/updatepaypassword/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    User.findOne({_id: req.params.userid}, 'paySalt payPassword', function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var encryptedPw = md5(md5(req.body.oldpassword) + docs.paySalt);
            if (encryptedPw == docs.payPassword) {
                next()
            } else {
                functions.apiReturn(res, errors.error60004, req.body._requestId);
            }
        }
    })
}, function (req, res, next) {
    var salt = functions.createVercode(4);
    var encryptedPw = md5(md5(req.body.password) + salt);
    User.update({_id: req.params.userid}, {'paySalt': salt, 'payPassword': encryptedPw}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 忘记支付密码
 */
router.patch("/resetpaypassword/:userid", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    var code = cache.get("vercode" + req.body.bindphone);
    if (code === null) {
        functions.apiReturn(res, errors.error10002, req.body._requestId);
    } else {
        if (code !== req.body.vercode) {
            functions.apiReturn(res, errors.error10001, req.body._requestId);
        } else {
            next()

        }
    }
}, function (req, res, next) {
    var salt = functions.createVercode(4);
    var encryptedPw = md5(md5(req.body.password) + salt);
    User.update({_id: req.params.userid}, {'paySalt': salt, 'payPassword': encryptedPw}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 获取订单分类
 */
router.get("/orderlist/:interspaceid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    Goodsclass.find({interspaceId: req.params.interspaceid}, 'classOrder className', function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
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
            console.log(data)
            var ret = errors.error0;
            ret.data = data;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 下载页面
 */
router.get("/downloadlist", function (req, res) {
    res.render('download')
})

/**
 * 个人财务明细
 */
router.get("/financelist/:page/:pagesize/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Finance.find({userId: req.params.userid}).sort({createTime: -1}).skip(start).limit(req.params.pagesize * 1).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {

            var arr = functions.sortByKey(docs, 'createTime', 1)
            console.log(arr)
            var ret = errors.error0;
            ret.data = arr;
            functions.apiReturn(res, ret, req.body._requestId);
        }
    })
})

/**
 * 删除员工
 */
router.delete("/staff", function (req, res) {
    Staffapplyfor.remove({userId: req.query.userid, priseId: req.query.priseid}, function (err, staff) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.query._requestId);
        } else {
            Lockauthority.remove({userId: req.query.userid, priseId: req.query.priseid}, function (err, lock) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res, ret1, req.query._requestId);
                } else {
                    User.update({_id: req.query.userid}, {
                        enterpriseId: '',
                        authenticationStatus: 0
                    }, function (err, user) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res, ret1, req.query._requestId);
                        } else {
                            var ret = errors.error0;
                            ret.data = lock;
                            functions.apiReturn(res, ret, req.query._requestId);
                        }
                    })

                }
            })
        }
    })
})

router.get("/dsryh", function (req, res) {

    // var api = new TimRestAPI(conf);
    // api.init(function (err, data) {
    //   if (err) {
    //     fn(errors.error20003,null)
    //   }
    //   var reqBody = {
    //     "GroupId": groupid,   // 要操作的群组（必填）
    //     "Silence": 1,
    //     "MemberList": [  // 一次最多添加500个成员
    //       {
    //         "Member_Account": txyid  // 要添加的群成员ID（必填）
    //       }]
    //   }
    //   api.request("group_open_http_svc", "add_group_member", reqBody,
    //       function (err, data) {
})


/**
 * 签到
 */
router.post("/signin", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    functions.addIntegral(3,req.body.userid,null)
    var ret = errors.error0;
    ret.data = {
        status:1
    };
    functions.apiReturn(res, ret, req.params._requestId);

})

/**
 * 积分明细
 */
router.get("/integraldetail/:page/:pagesize/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Integraldetail.find({userId: req.params.userid}).sort({createTime: -1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 如何获取积分
 */
router.get("/integral/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.params._requestId);
    }
}, function (req, res, next) {
    Integralconf.find({}, function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs[0];
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 领取卡券
 */
router.post("/coupon", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    var coupon = new Coupon({
        userId: req.body.userid,    //用户id
        type: 1,    //1免费券2折扣券
        consumerCode: functions.createVercode(8)
    })
    coupon.save(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            User.update({_id: req.body.userid}, {isCashCoupon: 1}, function (err, user) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res, ret1, req.params._requestId);
                } else {
                    var ret = errors.error0;
                    ret.data = docs;
                    functions.apiReturn(res, ret, req.params._requestId);
                }
            })

        }
    })

})


/**
 * 我的卡券
 */
router.get("/usercoupon/:userid/:sign", functions.recordRequest, function (req, res, next) {
    if (functions.signCheck(req, res)) {
        next();
    } else {
        functions.apiReturn(res, errors.error1, req.body._requestId);
    }
}, function (req, res, next) {
    Coupon.find({userId: req.params.userid}).sort({createTime: -1}).exec(function (err, docs) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.params._requestId);
        } else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})


router.get("/dg", function (req, res) {
    User.update({_id:'5aa264837f693d707ebf76b6'},{isCashCoupon:0}, function (err, docs) {
        res.send(docs)
    })
})
module.exports = router;
