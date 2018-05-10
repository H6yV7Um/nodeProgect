var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var cache = require("memory-cache");
var md5 = require("md5");
var Txysig = require("../common/txysign");
var functions = require("../common/functions");
var config = require("../common/config");
var sms = require("../common/sms");
var errors = require("../common/errors");
var Interspace = mongoose.model("Interspace");
var TimRestAPI = require("imsdk/lib/TimRestApi.js");
var Teacher = mongoose.model("Teacher")
var Track = mongoose.model("Track");
var titles = require("../common/title")
var Course = mongoose.model("Course");
var tplace = require("../common/tplace")




/**
 * 查询赛道列表
 */
router.get("/gettrack/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Track.find({},function(err,docs){
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
 * 获取不同赛道的导师列表
 */

router.get("/getteachers/:page/:pagesize/:trackid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj = {
            track:req.params.trackid
        }
        Teacher.find(obj).sort({stickTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
            if(err){
                var ret1 = errors.error3;
                ret1.data = err;
                functions.apiReturn(res,ret1,req.params._requestId);
            }else {
                var ret = errors.error0;
                ret.data = docs;
                functions.apiReturn(res,ret,req.params._requestId);
            }
        })
    })
/**
 * 获取导师详情
 */
router.get("/getteacherinfo/:teacherid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Teacher.find({_id:req.params.teacherid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            Course.find({teacherId:req.params.teacherid},function (err,courses) {
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else {
                    var aa={
                        teacherName:docs[0].tName
                    }
                    var course=new Array
                    for(var i=0;i<courses.length;i++){
                        var json1 = eval('('+(JSON.stringify(courses[0])+JSON.stringify(aa)).replace(/}{/,',')+')');
                        course.push(json1)
                    }
                    var obj={
                        course:course
                    }
                    var json = eval('('+(JSON.stringify(docs[0])+JSON.stringify(obj)).replace(/}{/,',')+')');
                    var ret = errors.error0;
                    ret.data = json
                    functions.apiReturn(res,ret,req.params._requestId);
                }

            })

        }
    })
})
/*
/获取首页导师显示导师列表
 */
router.get("/showteachers/:page/:pagesize/:tplaceid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var obj = {
        tplaceId:req.params.tplaceid
    }
    Teacher.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else {
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

module.exports = router;