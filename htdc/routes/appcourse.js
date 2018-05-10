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
var System = mongoose.model("System");
var Goods = mongoose.model("Goods");
var Trackinterspace = mongoose.model("Trackinterspace");


/**
 * 查询体系列表
 */
router.get("/getsystem/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    System.find({},function(err,docs){
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
 * 获取不同体系的课程列表
 */

router.get("/getcourses/:page/:pagesize/:type/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var obj = {
        typeId:req.params.type,
        type:'3'
    }
    Goods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ids=new Array()
            for(var i=0;i<docs.length;i++){
                ids.push(docs[i].teacherId)
            }
            Teacher.find({_id:{$in:ids}},function (err,teachers) {
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else {
                    var tnames=new Array()
                    for(var j=0;j<teachers.length;j++){
                        //tnames.push(teachers[j].tName)
                        for(var x=0;x<docs.length;x++){
                            if(teachers[j]._id == docs[x].teacherId){
                                var obj = {
                                    teacherName:teachers[j].tName
                                }
                                var json = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                tnames.push(json)
                            }
                        }
                    }
                    console.log(tnames)
                    var ret = errors.error0;
                    ret.data = tnames;
                    functions.apiReturn(res,ret,req.params._requestId);
                }
            })
        }

    })

})

/**
 * 获取课程详情
 */
router.get("/getcourseinfo/:courseid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Goods.find({_id:req.params.courseid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var teacherid=docs[0].teacherId
            Teacher.find({_id:teacherid},function (err,teacher) {
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else {
                    var obj={
                        teacher:teacher[0]
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

/**
 * 获取一个导师的课程
 */
router.get("/teachercourse/:tearchid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Goods.find({type:'3',teacherId:req.params.tearchid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var arr = functions.sortByKey(docs,'startTime',1)
            var ret = errors.error0;
            ret.data = arr
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 查询AA空间列表
 */
router.get("/aainterspace/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Trackinterspace.find({}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            console.log(docs)
            var ret = errors.error0;
            ret.data = docs
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 空间h5
 */
router.get("/interspaceinfo/:interspaceid",function(req,res){
    Trackinterspace.findOne({_id:req.params.interspaceid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            console.log(docs)
            res.render('goodsinfo',{
                data:docs.data
            })
        }
    })
})
module.exports = router;