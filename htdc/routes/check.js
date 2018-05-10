var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Enterprise = mongoose.model("Enterprise");
var Lockauthority = mongoose.model("Lockauthority");
var User = mongoose.model("User");

router.get("/test",function(req,res){
    // Enterprise.find({originatorPhone:'13609124141'},function(err,docs){
    //     res.send(docs)
    // })
    Lockauthority.find({priseId:'5a1616213304a13e00086286'},function (err,doc) {
        res.send(doc)
    })
})
/**
 * 我要入驻未审核
 */
router.get("/enterprisenocheck",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Fa', userinfo.arr);
        var pagesize = 7;
        var counturl = "/check/getenterprisenocheck/1/" + pagesize + '/1';
        var dataurl = "/check/getenterprisenocheck/2/" + pagesize;
        res.render('checkadmin/nochecklist_mng',{
            //administrator:userinfo,
    leftNav:leftNav,
    pagesize : pagesize,
    counturl:counturl,
    dataurl:dataurl,
    userinfo: userinfo.adminuserInfo
});
}else {
    res.render('login')
}

})

router.get("/getenterprisenocheck/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceId=userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Enterprise.count({isCheck:0,interspaceId:interspaceId}).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Enterprise.find({isCheck:0,interspaceId:interspaceId}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = new Array()
                        for(var i=0;i<docs.length;i++){
                            if(docs[i].isRegister == 1){
                                var obj = {
                                    status : '是'
                                }
                            }else{
                                var obj = {
                                    status : '不是'
                                }
                            }
                            var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(newjson)
                        }
                        res.status(200).json(data);
                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})



/**
 * 我要入驻已审核
 */
router.get("/enterprisechecked",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Fb', userinfo.arr);
        var pagesize = 7;
        var counturl = "/check/getenterprisechecked/1/" + pagesize + '/1';
        var dataurl = "/check/getenterprisechecked/2" + '/'+pagesize;
        res.render('checkadmin/ischecklist_mng',{
            //administrator:userinfo,
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }

})

router.get("/getenterprisechecked/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceId = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Enterprise.count({isCheck:1,interspaceId:interspaceId}).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Enterprise.find({isCheck:1,interspaceId:interspaceId}).sort({createTime:1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = new Array()
                        for(var i=0;i<docs.length;i++){
                            if(docs[i].isRegister == 1){
                                var obj = {
                                    status : '是'
                                }
                            }else{
                                var obj = {
                                    status : '不是'
                                }
                            }
                            var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(newjson)
                        }
                        res.status(200).json(data);
                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 历史入驻列表
 */

router.get("/historychecked",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Fc', userinfo.arr);
        var pagesize = 7;
        var counturl = "/check/gethistorychecked/1/" + pagesize + '/1';
        var dataurl = "/check/gethistorychecked/2" + '/'+pagesize;
        res.render('checkadmin/historychecklist_mng',{
            //administrator:userinfo,
            leftNav:leftNav,
            pagesize : pagesize,
            counturl:counturl,
            dataurl:dataurl,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }

})


router.get("/gethistorychecked/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceId=userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Enterprise.count({isCheck:{$in:[0,1,2]},interspaceId:interspaceId}).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Enterprise.find({isCheck:{$in:[0,1,2]},interspaceId:interspaceId}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = new Array()
                        for(var i=0;i<docs.length;i++){
                            if(docs[i].isRegister == 1){
                                var obj = {
                                    status : '是'
                                }
                            }else{
                                var obj = {
                                    status : '不是'
                                }
                            }
                            var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(newjson)
                        }
                        console.log(data)
                        res.status(200).json(data);
                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 通过审核
 */
router.post("/passcheck",function(req,res){
    console.log(req.body)
    // { priseid: '590d96338ad5195e65d151eb',
    //     userid: '590a9ec202c2237664d92ea7' }
    Enterprise.update({_id:req.body.priseid},{isCheck:1},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            User.update({_id:req.body.userid},{'authenticationStatus':4,'enterpriseId':req.body.priseid},function(err,data){
                if(err){
                    res.render("nodata")
                }else{
                    res.redirect("/check/enterprisechecked")
                }
            })

        }
    });
})

/**
 * 取消审核
 */
router.post("/nopasscheck",function(req,res){
    Enterprise.update({_id:req.body.userId},{isCheck:"0"},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/check/enterprisenocheck")
        }
    });
})

/**
 * 是否推荐到首页
 */
router.get("/updaterecommend/:priseid/:type",function(req,res){
    if(req.params.type == 1){
        var obj = {
            isRecommend:0
        }
    }else{
        var obj = {
            isRecommend:1
        }
    }
    Enterprise.update({_id:req.params.priseid},obj,function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/check/enterprisechecked")
        }
    })
})

/**
 * 查看公司详情
 */
router.get("/priseinfo/:priseid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('F', userinfo.arr);
        Enterprise.find({_id:req.params.priseid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.render("checkadmin/priseinfo_mng",{
                    userinfo:userinfo,
                    leftNav:leftNav,
                    title:docs[0].priseName,
                    data:docs[0]
                })
            }
        })
    }else{
        res.render('login')
    }

})


/**
 *修改公司信息
 */
router.post("/changeInfo",function(req,res){
    var obj=req.body
    var imgs = JSON.parse(req.body.goodsImgs)
    var json = {
        mien :imgs
    }
    var newjson = eval('('+(JSON.stringify(obj)+JSON.stringify(json)).replace(/}{/,',')+')');
    Enterprise.update({_id:req.body.priseid},newjson,function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            res.redirect("priseinfo/"+req.body.priseid)
        }
    });
})

module.exports = router;