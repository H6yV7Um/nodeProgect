var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var sms = require("../common/sms")
var orderstatus = require("../common/orderstatus")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Goods = mongoose.model("Goods");
var Goodsclass = mongoose.model("Goodsclass");
var Media = mongoose.model("Media");
var Mediaserver = mongoose.model("Mediaserver");
var Applyforjob = mongoose.model("Applyforjob");
var Invitejob = mongoose.model("Invitejob");
var Interspace = mongoose.model("Interspace");
var Print = mongoose.model("Print");
var Officeorder = mongoose.model("Officeorder");
var Systemconfig = mongoose.model("Systemconfig");
var Serviceclass = mongoose.model("Serviceclass");
var Service = mongoose.model("Service");

router.get("/test",function(req,res){
   // var obj = new Service({
   //     serviceClassId:'5ab8bad75c0fff7a60ba5acd',    //分类id
   //     logo:'http://oonn7gtrq.bkt.clouddn.com/273544857578524745.png',            //图标
   //     name:'智慧知识产权公司',           //名称
   //     address:'碑林区南二环西段69号',       //地址
   //     linkPhone:'400-1236-598',     //联系方式
   //     serviceContent:[
   //         {
   //              name:'专利代理',
   //              info:'技术查新报告、申请策略建议、申请文件撰写、费用贷代缴',
   //              price:'200',
   //         }
   //     ],   //服务内容
   // })
   //  obj.save(function(err,docs){
   //      res.send(docs)
   //  })
    // Serviceclass.find({},function(err,docs){
    //     res.send(docs)
    // })
    Service.update({_id:'5ab8bce4386ecf7c82e4f9e7'},{serviceInfo:'新华社北京3月28日电 中共中央总书记、国家主席、中央军委主席、中央全面深化改革委员会主任习近平3月28日下午主持召开中央全面深化改革委员会第一次会议并发表重要讲话'},function(err,docs){
        res.send(docs)
    })
})

/**
 * 创业服务
 */
router.get("/businesservice/:interspaceid/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Serviceclass.find({interspaceId:req.params.interspaceid}).sort({order:1}).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 创业服务详情
 */
router.get("/businesservicecontent/:page/:pagesize/:serviceid/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Service.find({serviceClassId:req.params.serviceid}).sort({createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,service){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = service;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 查询实体商品
 */
router.get("/getgoods/:classid/:page/:pagesize/:type/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var obj = {
        goodsClassId:req.params.classid
    }
    switch(req.params.type){
        case '1':
            var json = {
                createTime:-1
            }
            break;
        case '2':
            var json = {
                goodsPrice:-1
            }
            break;
        case '3':
            var json = {
                goodsPrice:1
            }
            break;
        case '4':
            var json = {
                allSaleNum:-1
            }
            break;
        case '5':
            var json = {
                allSaleNum:1
            }
            break;
    }
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Goods.find(obj,'goodsName goodsPic price1 price2 price3 allSaleNum').sort(json).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 查询分类
 */
router.get("/getgoodsclass/:interspaceid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Goodsclass.find({interspaceId:req.params.interspaceid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            // console.log(docs)
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 查询单个商品详情(服务页面商品)
 */
router.get("/getonegoods/:classorder/:goodsid/:nickname/:txyid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Goods.findOne({_id:req.params.goodsid},function(err,docs) {
        if (err) {
            res.render('nodata')
        } else {
            var str = '刚刚浏览了'+docs.goodsName
            var obj = {
                goodsid:req.params.goodsid,
                classorder:req.params.classorder
            }
            if(req.params.classorder == '5'){
                var type = 4
            }else{
                var type = 3
            }


            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.body._requestId);
            functions.sendMesgToGroup(req.params.txyid,type,req.params.nickname,obj,str, function (err, data) {
                // if (err) {
                //     console.log(err)
                //     switch (err.error) {
                //         case '3':
                //             var ret1 = errors.error3;
                //             break;
                //         case '20003':
                //             var ret1 = errors.error20003;
                //             break;
                //         case '20000':
                //             var ret1 = errors.error20000;
                //             break;
                //     }
                //     ret1.data = err;
                //     functions.apiReturn(res, ret1, req.body._requestId);
                // } else {
                //     console.log(docs)
                //
                // }
            })
        }
    })
})


/**
 * 查询单个商品详情(咖啡、AA加速商品)
 */
router.get("/goodsinfo/:goodsid/:nickname/:txyid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Goods.findOne({_id:req.params.goodsid},function(err,docs) {
        if (err) {
            res.render('nodata')
        } else {
            var str = '刚刚浏览了'+docs.goodsName
            var obj = {
                goodsid:req.params.goodsid
            }
            functions.sendMesgToGroup(req.params.txyid,4,req.params.nickname,obj,str, function (err, data) {
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
})

/**
 * 商品详情页
 */
router.get("/getgoodsinfo/:goodsid",function(req,res){
    Goods.findOne({_id:req.params.goodsid},'goodsInfo',function(err,docs){
        if(err){
            console.log(docs)
            res.render('nodata')
        }else{
            res.render('goodsinfo',{
                data:docs.goodsInfo
            })
        }
    })

})
/**
 * 查询服务商品列表
 */
router.get("/getservergoods/:classid/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Goods.find({goodsClassId:req.params.classid}).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 查询立体媒体服务
 */
router.get("/getmedia/:interspaceid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Media.find({interspaceId:req.params.interspaceid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 查询立体媒体服务的具体内容
 */
router.get("/getmediaserver/:mediaid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Mediaserver.find({mediaId:req.params.mediaid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 我要求职
 */
router.post("/applyforjob",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var obj = new Applyforjob({
        interspaceId:req.body.interspaceId,
        name:req.body.name,           //求职者姓名
        sex:req.body.sex,   //性别
        age:req.body.age,    //年龄
        education:req.body.education,     //学历
        applyJob:req.body.applyJob,     //应聘岗位
        phone:req.body.phone,        //联系电话
        experience:req.body.experience,     //经验
        speciality:req.body.speciality,     //特长
        createTime:Date.now(),    //发布时间
    })
    obj.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})
/**
 * 我要招聘
 */
router.post("/invitejob",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var obj = new Invitejob({
        interspaceId:req.body.interspaceId,
        businessName:req.body.businessName,           //公司名称
        businessInfo:req.body.businessInfo,   //公司简介
        jobName:req.body.jobName,    //职位名称
        request:req.body.request,     //职位要求
        salary:req.body.salary,     //薪资
        welfare:req.body.welfare,        //公司福利
        linkman:req.body.linkman,     //联系人
        phone:req.body.phone,     //联系电话
        email:req.body.email,       //邮箱
        createTime:Date.now(),    //发布时间
    })
    obj.save(function(err,docs){
        if(err){
            console.log(err)
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 打印复印
 */
router.post("/addprint",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Interspace.findOne({_id:req.body.interspaceId},function(err,interspace) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var obj = new Print({
                orderNo:req.body.orderno,
                userId:req.body.userid,
                type:'2',
                interspaceId:req.body.interspaceId,    //空间id
                interspaceName:interspace.interspaceName,
                date:parseInt(req.body.date),    //复印打印时间
                number:parseInt(req.body.number),   //打印复印张数
                createTime:Date.now(),  //时间
            })
            obj.save(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    sms.sendNote(req.body.interspaceId,'7')
                    var ret = errors.error0;
                    ret.data = docs;
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            })
        }
    })

})

/**
 * 服务下订单
 */
router.post("/addorder",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var obj = {
        interspaceId:req.body.interspaceId,    //空间id
        userId:req.body.userid,  //userid
        userPhone:req.body.phone,
        address:{
            userName:req.body.username,
            userphone:req.body.userphone,
            addressinfo:req.body.addressinfo,
        },
        orderNo:req.body.orderNo, //订单号
        useInfo:req.body.useInfo,  //使用说明
        type:req.body.type,   //1工位2会议室3路演厅4健身房6健身教练
        //goodsId:req.body.goodsid,  //预定商品的id
        orderStatus:orderstatus.status0,  //订单状态
        orderAmount:req.body.orderAmount,  //订单金额
        orderInfo:JSON.parse(req.body.orderinfo),  //订单详情
        consumerCode :req.body.consumerCode,
        coachPhone:req.body.coachPhone,
        //orderTime:Number,    //预约时间
        paytype:'',         //支付方式'wallet'钱包支付'wx'微信支付'alipay'支付宝支付
        createTime:Date.now(),             //时间
    }
    // var arr = functions.sortByKey(JSON.parse(req.body.orderinfo),'goodsId',1)
    // console.log(arr)
    var order = new Officeorder(obj)

    order.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 会议接待详情h5
 */
router.get("/meetinginfo/:interspaceid",function(req,res){
    Systemconfig.find({interspaceId:req.params.interspaceid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            if(docs.length > 0){
                res.render('goodsinfo',{
                    data:docs[0].meetingLink.data
                })
            }else{
                res.render('goodsinfo',{
                    data:''
                })
            }

        }
    })
})

/**
 * 会议招待联系人
 */
router.get("/getmeetinglink/:interspaceid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Systemconfig.find({interspaceId:req.params.interspaceid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            if(docs.length > 0){
                var ret = errors.error0;
                ret.data = docs[0];
                functions.apiReturn(res,ret,req.body._requestId);
            }else{
                var ret = errors.error0;
                ret.data = {};
                functions.apiReturn(res,ret,req.body._requestId);
            }

        }
    })
})

/**
 * 立体媒体服务详情
 */
router.get("/mediainfo/:mediaid",function(req,res){
    Mediaserver.find({_id:req.params.mediaid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.render('goodsinfo',{
                data:docs[0].content
            })
        }
    })
})

/**
 * 空间详情
 */
router.get("/interspaceinfo/:interspaceid",function(req,res){
    Interspace.find({_id:req.params.interspaceid},function(err,content){
        if(err){
            res.render('nodata')
        }else{
            res.render('goodsinfo',{
                data:content[0].content
            })
        }
    })
})

/**
 * 会议接待详情
 */
router.get("/meetinginfo/:interspaceid",function(req,res){
    Interspace.find({_id:req.params.interspaceid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            if(docs.length > 0){
                res.render('goodsinfo',{
                    data:docs[0].content
                })
            }else{
                res.render('goodsinfo',{
                    data:''
                })
            }

        }
    })
})

/**
 * 购物车下订单
 */
router.post("/cartorder",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Interspace.findOne({_id:req.body.interspaceId},'interspaceName',function(err,interspace) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var arr = JSON.parse(req.body.goodsinfo)
            console.log(arr)
            for(var i=0;i<arr.length;i++){
                var obj = new Officeorder({
                    userId:req.body.userid,  //userid
                    userPhone:req.body.phone, //用户手机号
                    interspaceId:req.body.interspaceId,    //空间id
                    interspaceName:interspace.interspaceName,    //空间名
                    address:{
                        userName:req.body.userName,
                        phone:req.body.phone,
                        addressinfo:req.body.addressinfo,
                    },
                    useInfo:arr[i].useInfo,//消费码使用说明
                    orderNo:req.body.orderNo, //订单号
                    type:arr[i].type,   //
                    goodsId:arr[i].goodsId,  //预定商品的id
                    orderStatus:orderstatus.status0,  //订单状态
                    orderAmount:arr[i].amount,  //订单金额
                    orderInfo:[
                        {
                            goodsId:arr[i].goodsId,
                            goodsName:arr[i].goodsName,
                            goodsPic:arr[i].goodsPic,
                            goodsPrice:arr[i].goodsPrice,
                            buyNum:arr[i].buyNum,
                        }
                    ],  //预约详情
                    remark:arr[i].remark,
                    consumerCode:arr[i].consumerCode,    //消费码
                    paytype:'',         //支付方式'wallet'钱包支付'wx'微信支付'alipay'支付宝支付
                    createTime:Date.now(),             //时间
                })
                obj.save()
            }
            var ret = errors.error0;
            ret.data = {
                sattus:0
            };
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })

})
module.exports = router;