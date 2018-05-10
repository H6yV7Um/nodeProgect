var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var config = require("../common/config");
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Lock = mongoose.model("Lock");
var Lockauthority = mongoose.model("Lockauthority");
var Lockrecord = mongoose.model("Lockrecord");


router.get("/test",function(req,res){
    Lockrecord.remove({},function(err,docs){
        res.send(docs)
    })
})
/**
 * 查看我的开锁
 */
router.get("/getmylock/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Lockauthority.find({userId:req.params.userid,endTime:{$gt:Date.now()}},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            console.log(docs)
            var roomids = new Array()
            for(var i=0;i<docs.length;i++){
                roomids.push(docs[i].roomId)
            }
            Lock.find({roomId:{$in:roomids}},function(err,data){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    var finaldata = new Array()
                    for(var x=0;x<data.length;x++){
                        for(var y=0;y<docs.length;y++){
                            if(data[x].roomId == docs[y].roomId){
                                var obj = {
                                    roomName:data[x].roomName
                                }
                                var newjson = eval('('+(JSON.stringify(docs[y])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                finaldata.push(newjson)
                            }
                        }
                    }
                    console.log(finaldata)
                    var ret = errors.error0;
                    ret.data = finaldata;
                    functions.apiReturn(res,ret,req.params._requestId);
                }
            })
        }
    })
})

/**
 * 添加开锁记录，生成卡号
 */
router.post("/addlockrecord",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var cartno = (Date.now()).toString().substring(6,10)
    var randomnum = functions.createVercode(4)
    var cardNo = cartno+randomnum;
    var ret = errors.error0;
    ret.data = {
        keyNo:'00852953',
        cardNo:cardNo
    };
    functions.apiReturn(res,ret,req.body._requestId);
})
module.exports = router;