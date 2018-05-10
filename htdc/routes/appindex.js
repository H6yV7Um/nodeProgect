var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var errors = require("../common/errors");
var Advertisement = mongoose.model("Advertisement");
var Cshop = mongoose.model("Cshop");
var Ctype = mongoose.model("Ctype");
var Cgoods = mongoose.model("Cgoods");
var Activity = mongoose.model("Activity");
var Enterprise = mongoose.model("Enterprise");
var Interspace = mongoose.model("Interspace");
var User = mongoose.model("User");
var Goods = mongoose.model("Goods");
var Goodsclass = mongoose.model("Goodsclass");
var Officeorder = mongoose.model("Officeorder");
var Boardroom = mongoose.model("Boardroom");
var Roadshow = mongoose.model("Roadshow");




router.get("/test",function(req,res){
    //58f196b022e95b77ef30004c
    Officeorder.find({},function(err,docs){
        res.send(docs)
    })
    // var a;
    // console.log(a)
    // res.send('111')
})
/**
 * 查看广告
 */
router.get("/getadvertisement/:type/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    switch(req.params.type){
        case '1':
            var obj = {
                place:1
            }
            break;
        case '2':
            var obj = {
                place:2
            }
            break;
    }
    Advertisement.find(obj,function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            console.log('1111111111111111111111111111')
            console.log(docs)
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})
/**
 * 广告详情url
 */
router.get("/advertisementinfo/:advid",function(req,res){
    Advertisement.findOne({_id:req.params.advid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.render("advertisement",{
                data:docs.data
            })
        }
    })
})
/*
 /获取咖啡店信息
 */
router.get("/getcshop/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Cshop.find({},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }  else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})
/*
 /获取咖啡店分类信息
 */
router.get("/getctype/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Ctype.find({},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }  else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res, ret, req.params._requestId);
        }
    })
})

/**
 * 获取不同分类下的商品
 */
router.get("/getcgoods/:page/:pagesize/:typeid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var obj = {
        goodsClassId:req.params.typeid,
        type:"1"
    }

    Goods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})
/*
 /获取活动列表
 */
router.get("/getactivities/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Activity.find({}).sort({isHot:-1,hotTime:-1,createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var arr = functions.sortByKey(docs, 'startTime',1)
            var ret = errors.error0;
            ret.data = arr
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 我要入驻
 */
router.post("/addenterprise",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Enterprise.find({userId:req.body.userId,isCheck:{$ne:2}},function(err,prise){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            if(prise.length > 0){
                var ret = errors.error0;
                ret.data = prise
                functions.apiReturn(res,ret,req.body._requestId);
            }else{
                var obj = {
                    userId:req.body.userId,        //userid
                    interspaceId:req.body.interspaceId,  //空间id
                    businessLicensePic:req.body.businessLicensePic,   //营业执照图片
                    businessLogo:req.body.businessLogo,
                    priseName:req.body.priseName,   //公司名称
                    operation:req.body.operation,  //业务领域
                    originatorName:req.body.originatorName,   //创始人姓名
                    originatorPhone:req.body.originatorPhone,  //创始人手机
                    priseInfo:req.body.priseInfo,       //公司简介
                    productName:req.body.productName,     //产品名称
                    teamMembers:req.body.teamMembers,     //团队成员数
                    needStation:req.body.needStation,        //所需工位
                    isRegister:req.body.isRegister,      //是否注册公司
                    freeboardroom:0,          //免费会议室
                    freeroadshow:0,           //免费路演厅
                    isCheck:0,
                    createTime:Date.now(),             //时间
                }
                var enterprise = new Enterprise(obj);
                enterprise.save(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res,ret1,req.body._requestId);
                    }else{
                        Interspace.findOne({_id:req.body.interspaceId},'linkman linkPhone linkemail',function(err,interspace){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                functions.apiReturn(res,ret1,req.body._requestId);
                            }else{
                                var ret = errors.error0;
                                ret.data = interspace
                                functions.apiReturn(res,ret,req.body._requestId);
                            }
                        })

                    }
                })
            }
        }

    })

})
router.get("/test",function(req,res){
    User.update({_id:'59085ee7d04d11790870d609'},{'authenticationStatus':4},function(err,docs){
        res.send(docs)
    })
    //59085ee7d04d11790870d609
})

/**
 * 查看入驻企业
 */
router.get("/getenterprise/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    //isRecommend:1
    Enterprise.find({isCheck:1}).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 获取空间联系方式
 */
router.get("/getlinkphone/:interspaceid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {

})

/**
 * 推荐服务
 */
router.get("/getrecommendservice/:interspaceid/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Goods.find({goodsType:2,interspaceId:req.params.interspaceid,isRecommend:1},'goodsName goodsPic price1 price2 price3 goodsUnit interspaceId goodsClassId').skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var classids = new Array();
            for(var i=0;i<docs.length;i++){
                classids.push(docs[i].goodsClassId)
            }
            Goodsclass.find({_id:{$in:classids}},function(err,classes){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    var data = new Array()
                    for(var x=0;x<docs.length;x++){
                        for(var y=0;y<classes.length;y++){
                            if(docs[x].goodsClassId == classes[y]._id){
                                var obj = {
                                    classOrder:classes[y].classOrder
                                }
                                var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                data.push(newjson)
                            }
                        }
                    }
                    console.log(data)
                    var ret = errors.error0;
                    ret.data = data
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            })

        }
    })
})

/**
 * 入驻企业详情h5
 */
router.get("/priseinfo/:priseid",function(req,res){
    //Enterprise
    Enterprise.findOne({_id:req.params.priseid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.render('goodsinfo',{
                data:docs.content
            })
        }
    })
})

/**
 * 首页空间列表
 */
router.get("/interspacelist/:randomnum/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Interspace.find({}).sort({createTime:1}).exec(function(err,space){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = space
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 空间服务
 */
router.get("/interspaceservice/:interspaceid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Boardroom.find({interspaceId:req.params.interspaceid},function(err,boardroom){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            console.log(boardroom)
            Roadshow.find({interspaceId:req.params.interspaceid},function(err,roadshow){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    var ret = errors.error0;
                    ret.data = {
                        boardroom:boardroom[0],
                        roadshow:roadshow[0]
                    }
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            })
        }
    })
})

/**
 * 查看空间入驻企业
 */
router.get("/interspaceenterprise/:interspaceid/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    console.log(req.params)
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    console.log(req.params)
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    //isRecommend:1
    Enterprise.find({isCheck:1,interspaceId:req.params.interspaceid}).sort({createTime:1}).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})
module.exports = router;