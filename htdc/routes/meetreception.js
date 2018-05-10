var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Goods = mongoose.model("Goods");
var Media = mongoose.model("Media");
var Mediaserver = mongoose.model("Mediaserver");
var Systemconfig = mongoose.model("Systemconfig");

/**
 * 编辑会议接待详情
 */
router.get("/meetinginfo",function(req,res){

})

/**
 * 编辑会议接待联系人
 */
router.get("/meetinglink",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Ib', userinfo.arr);
        Systemconfig.find({interspaceId:interspacesid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                if(docs.length > 0){
                    var link = docs[0].meetingLink
                }else{
                    var link ={
                        linkName:'',
                        linkPhone:'',
                        email:'',
                    }
                }
                res.render("meetreception/meetinglink_mng",{
                    leftNav:leftNav,
                    userinfo: userinfo.adminuserInfo,
                    linkdata:link
                })
            }
        })

    }else {
        res.render('login')
    }
})

/**
 * 查看会议接待申请
 */
router.get("/meetingapplyfor",function(req,res){

})
// /meetreception/updatelinkway
/**
 * 修改会议接待联系人
 */
router.post('/updatelinkway',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        Systemconfig.find({interspaceId: interspacesid}, function (err, docs) {
            if (err) {
                res.render('nodata')
            } else {
                var obj = {
                    linkName:req.body.linkName,
                    linkPhone:req.body.linkPhone,
                    email:req.body.email,
                    data:req.body.data,
                }
                console.log(obj)
                if (docs.length > 0) {
                    Systemconfig.update({interspaceId: interspacesid},{'meetingLink':obj},function (err, docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            res.redirect('/meetreception/meetinglink')
                        }
                    })
                }else{
                    var config = new Systemconfig({
                        interspaceId:interspacesid,
                        meetingLink:obj,
                    })
                    config.save(function (err,docs) {
                        if (err) {
                            res.render('nodata')
                        } else {
                            res.redirect('/meetreception/meetinglink')
                        }
                    })
                }
            }
        })
    }
})
module.exports = router;