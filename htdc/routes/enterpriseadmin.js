var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var config = require("../common/config")
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Enterprise = mongoose.model("Enterprise");
var Staffapplyfor = mongoose.model("Staffapplyfor");
var Lockauthority = mongoose.model("Lockauthority");
var session = require('express-session');

router.get("/saff",function(req,res){
    //59b9e670be6b9e3b518c58de
    //59ba53dfcfc9ca4b9c3da75e
    Staffapplyfor.remove({_id:'59ba53dfcfc9ca4b9c3da75e'},function(err,docs){
        res.send(docs)
    })
})
router.get("/test",function(req,res){
    Enterprise.update({_id:'59c3977a2a146238583c0af9'},{isCheck:0},function(err,enterprise){
      res.send(enterprise)
    })
})

router.get("/find",function(req,res){
    User.find({},function(err,enterprise){
        res.send(enterprise)
    })
})
/*
\/修改会议室免费次数
 */
router.post("/updateboardroom",function(req,res) {
    Enterprise.update({_id:req.body.enterpriseid},{'freeboardroom':req.body.freeboardroom},function (err,docs) {
        if(err){
            res.render('nodata')
        }else {
            res.redirect('/check/enterprisechecked')
        }
    })
})
/*
 \/修改路演厅免费次数
 */
router.post("/updateroadshow",function(req,res) {
    Enterprise.update({_id:req.body.enterpriseid},{'freeroadshow':req.body.freeroadshow},function (err,docs) {
        if(err){
            res.render('nodata')
        }else {
            res.redirect('/check/enterprisechecked')
        }
    })
})

router.get("/info/:enterpriseid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Fb', userinfo.arr);
        Enterprise.findOne({_id:req.params.enterpriseid},'content url',function(err,docs){
           
            if(err){
                res.render('nodata')
            }else{
                if(docs.content == ''){
                    var content = "无"
                }else{
                    var content = docs.content
                }
                res.render("goodsadmin/enterinfo_mng",{
                    leftNav:leftNav,
                    content:content,
                    data:docs,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }

})
/**
 * 修改入驻企业详情
 */
router.post("/updateenter",function(req,res){
    // var obj={
    //     content:req.body.content,
    // }
    if(req.body.content){
        obj.url = config.baseUrl+'1.0/appindex/priseinfo/'+req.body.enterid
    }else{
        obj.url = req.body.url

    }
    Enterprise.update({_id:req.body.enterid},obj,function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/check/enterprisechecked")
        }
    })
})

/**
 * 删除企业
 */
router.post("/deleteprise",function(req,res){
    Lockauthority.remove({$or:[{priseId:req.body.priseid},{userId:req.body.userid}],type:'1'},function(err,lockauthority){
        if(err){
            res.render('nodata')
        }else{
            Enterprise.update({_id:req.body.priseid},{isCheck:2},function(err,enterprise){
                if(err){
                    res.render('nodata')
                }else{
                    Staffapplyfor.find({priseId:req.body.priseid,ispass:'1'},function(err,staff){
                        if(err){
                            res.render('nodata')
                        }else{
                            var userids = [];
                            for(var i=0;i<staff.length;i++){
                                userids.push(staff[i].userId)
                            }
                            userids.push(req.body.userid)
                            User.update({_id:{$in:userids},$isolated : 1},{authenticationStatus:0},{multi: true},function(err,users){
                                if(err){
                                    res.render('nodata')
                                }else{
                                    res.redirect("/check/enterprisechecked")
                                }
                            })
                        }
                    })

                }
            })
        }
    })
})
module.exports = router;