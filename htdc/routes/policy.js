var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var functions = require("../common/functions");
var orderstatus = require("../common/orderstatus");
var config = require("../common/config");
var errors = require("../common/errors");
var Interspace = mongoose.model("Interspace");
var Policy = mongoose.model("Policy");
var Policyclass = mongoose.model("Policyclass");



/**
 * 政策分类
 */
router.get("/policyclass/:userid/:sign",functions.recordRequest,function (req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Policyclass.find({},function(err,policyclass){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = policyclass;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
});

/**
 * 政策详情
 */
router.get("/policylist/:page/:pagesize/:policyid/:userid/:sign",functions.recordRequest,function (req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Policy.find({pilicyClassId:req.params.policyid}).sort({createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,policy){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = policy;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})
module.exports = router;