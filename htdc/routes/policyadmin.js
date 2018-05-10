var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Policy = mongoose.model("Policy");
var Policyclass = mongoose.model("Policyclass");
var Goods = mongoose.model("Goods");


router.get("/dsadw",function(req,res){
    // 'http://oonn7gtrq.bkt.clouddn.com/shangchao_1514346650000608815.jpg'
    // 'http://oonn7gtrq.bkt.clouddn.com/shangchao_1514347278000603723.jpg'

})

router.get("/policyclass",function(req,res){

    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Za', userinfo.arr);
        Policyclass.find({},function(err,policyclass){
            if(err){
                res.render("nodata")
            }else{
                res.render("policy/policyclass",{
                    leftNav: leftNav,
                    data:policyclass,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    } else {
        res.render('login')
    }
})

/**
 * 政策内容
 */
router.get("/policylist/:classid",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Za', userinfo.arr);
        var pagesize = 7;
        var counturl = "/policyadmin/getpolicy/"+req.params.classid+"/1/" + pagesize + '/1';
        var dataurl = "/policyadmin/getpolicy/"+req.params.classid+"/2" + '/' + pagesize;
        res.render('policy/policylist_mng', {
            leftNav: leftNav,
            pagesize: pagesize,
            counturl: counturl,
            dataurl: dataurl,
            policyclassid:req.params.classid,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }

})

/**
 * 查询政策列表
 */
router.get("/getpolicy/:policyclassid/:type/:pagesize/:page", function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch (req.params.type) {
        case '1':
            Policy.count({pilicyClassId:req.params.policyclassid}).exec(function (err, docs) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                } else {
                    res.status(200).json(docs);
                }
            })
            break;
        case '2':
            Policy.find({pilicyClassId:req.params.policyclassid}).sort({createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                } else {
                    console.log(docs)
                    res.status(200).json(docs);

                }
            })
            break;

    }
})

/**
 * 添加政策
 */
router.get("/addpolicy/:classid",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Za', userinfo.arr);
        res.render('policy/addpolicy_mng', {
            policyclassid:req.params.classid,
            leftNav: leftNav,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }
})
/**
 * 添加政策(数据库操作)
 */
router.post("/insertpolicy",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var data = new Policy({
            pilicyClassId:req.body.classid,
            title:req.body.title,      //标题
            content:req.body.content,    //服务内容
            url:req.body.url,       //链接地址
        })
        data.save(function(err,policy){
            if(err){
                res.render('nodata')
            }else{
                res.redirect('/policyadmin/policylist/'+req.body.classid)
            }
        })
    } else {
        res.render('login')
    }
})

/**
 * 编辑政策分类
 */
router.get("/editpolicy/:classid",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Za', userinfo.arr);
        Policyclass.find({_id:req.params.classid},function(err,policyclass){
            if(err){
                res.render('nodata')
            }else{
                res.render('policy/editpolicy_mng', {
                    policyclassid:req.params.classid,
                    leftNav: leftNav,
                    userinfo: userinfo.adminuserInfo,
                    data:policyclass[0]
                });
            }
        })

    } else {
        res.render('login')
    }
})

/**
 * 修改政策类型
 */
router.post("/updatepolicyclass",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        Policyclass.update({_id:req.body.classid},req.body,function(err,policyclass){
            if(err){
                res.render('nodata')
            }else{
                res.redirect("/policyadmin/policyclass")
            }
        })
    } else {
        res.render('login')
    }
})


/**
 * 删除政策
 */
router.post("/delete",function(req,res){
    var userinfo = req.session.adminuser;
    if (userinfo) {
        Policy.remove({_id:req.body.policyid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.redirect("/policyadmin/policylist"+req.body.policyid)
            }
        })
    } else {
        res.render('login')
    }

})
module.exports = router;