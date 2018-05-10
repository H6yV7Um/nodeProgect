var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var makexlsx = require("../common/makexlsx")
var mongoose = require("mongoose");
var Finance = mongoose.model("Finance");
var Withdraw = mongoose.model("Withdraw");
var Interspace = mongoose.model("Interspace");

/**
 * 财务列表
 */
router.get("/financelist",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Wa', userinfo.arr);
        var pagesize = 7;
        var counturl = "/interspacefinance/getfinance/1/"+pagesize + '/1';
        var dataurl = "/interspacefinance/getfinance/2"+ '/' + pagesize;
        functions.orderType(interspacesid,function (err, finances) {
            if(err){
                res.status(200).json(errors.error3);
            }else{
                res.render('interspacefinance/financelist_mng',{
                    leftNav:leftNav,
                    userinfo:userinfo,
                    counturl:counturl,
                    dataurl:dataurl,
                    pagesize:pagesize,
                    data:finances
                })
            }
        })
    }else{
        res.render('login')
    }
})

router.get("/getfinance/:type/:pagesize/:page",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj = {
            type:{$ne:100},type:{$ne:101},
            interspaceId:interspacesid
        }
        console.log(obj)
        switch(req.params.type){
            case '1':
                Finance.count(obj).exec(function(err,docs){
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
                Finance.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = docs
                        var arr = new Array()
                        for(var x=0;x<data.length;x++){
                            var obj = {
                                time:functions.timeFormat(data[x].createTime),
                                paytype:'',
                            }
                            switch(data[x].channel){
                                case 'wx':
                                    obj.paytype = '微信支付'
                                    break;
                                case 'alipay':
                                    obj.paytype = '支付宝支付'
                                    break;
                                case 'wallet':
                                    obj.paytype = '钱包支付'
                                    break;

                            }
                            var json = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                            arr.push(json)
                        }
                        res.status(200).json(arr);

                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})
module.exports = router;