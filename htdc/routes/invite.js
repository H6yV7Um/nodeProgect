var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var config = require("../common/config");
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Invitejob = mongoose.model("Invitejob");
var Applyforjob = mongoose.model("Applyforjob");

/**
 * 查询公司招聘
 */
router.get("/companyinvite",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=7
        var leftNav = functions.createLeftNavByCodes('La', userinfo.arr);
        var counturl = "/invite/getcompanyinvite/1/"+pagesize + '/1';
        var dataurl = "/invite/getcompanyinvite/2"+ '/' + pagesize;
        res.render('invite/companyinvitelist_mng',{
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

router.get("/getcompanyinvite/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId;
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Invitejob.count({interspaceId:interspaceid}).exec(function(err,docs){
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
                Invitejob.find({interspaceId:interspaceid}).sort({createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        console.log(docs)
                        var data=new Array
                        for(a in docs){
                            var obj={
                                time:functions.timeFormat(docs[a].createTime*1),
                            }
                            var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(json)
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
 * 查询求职者
 */
router.get("/jobseekerlist",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=7
        var leftNav = functions.createLeftNavByCodes('Lb', userinfo.arr);
        var counturl = "/invite/getjobseeker/1/"+pagesize + '/1';
        var dataurl = "/invite/getjobseeker/2"+ '/' + pagesize;
        res.render('invite/jobseekerlist_mng',{
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

router.get("/getjobseeker/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId;
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Applyforjob.count({interspaceId:interspaceid}).exec(function(err,docs){
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
                Applyforjob.find({interspaceId:interspaceid}).sort({createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data=new Array
                        for(a in docs){
                            var obj={
                                time:functions.timeFormat(docs[a].createTime*1),
                            }
                            var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            data.push(json)
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
module.exports = router;