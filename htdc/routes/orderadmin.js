var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var cache = require("memory-cache");
var md5 = require("md5");
var functions = require("../common/functions");
var orderstatus = require("../common/orderstatus");
var config = require("../common/config");
var errors = require("../common/errors");
var Print = mongoose.model("Print");
var Officeorder = mongoose.model("Officeorder");
var User= mongoose.model("User");
var Goods= mongoose.model("Goods");
var Goodsclass= mongoose.model("Goodsclass");

router.get("/test",function(req,res){

    Officeorder.find({},function(err,docs){
        res.send(docs)
    })
})


/**
 * 查看订单
 */
router.get("/getorders",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ja', userinfo.arr);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var pagesize = 7;
        var counturl = "/orderadmin/getorders/1/"+pagesize + '/1';
        var dataurl = "/orderadmin/getorders/2"+ '/' + pagesize;
        Goodsclass.find({interspaceId:interspacesid},'classOrder className',function(err,types){
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                var obj = {
                    className: '--选择订单分类--',
                    classOrder:0
                }
                var json = {
                    className: '全部',
                    classOrder: 0
                }
                types.splice(0,0,json)
                res.render('orderadmin/orderlist_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    userinfo: userinfo.adminuserInfo,
                    data:types,
                    ordertype:obj
                });
            }
        })

    }else {
        res.render('login')
    }

})

router.get("/getorders/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId;
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        Goodsclass.find({interspaceId:interspacesid},'classOrder className',function(err,types){
            var arr = new Array()
            for(var i=0;i<types.length;i++){
                arr.push(types[i].classOrder)
            }
            switch(req.params.type){
                case '1':
                    Officeorder.count({interspaceId:interspacesid,type:{$in:arr}}).exec(function(err,docs){
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
                    Officeorder.find({interspaceId:interspacesid,type:{$in:arr}}).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else{

                            var data = new Array()
                            for(var i=0;i<docs.length;i++){
                                switch(docs[i].orderStatus){
                                    case orderstatus.status0:  //未付款
                                        var obj = {
                                            status:'未付款',
                                            subtype:'1',
                                        }
                                        break;
                                    case orderstatus.statusB10001:   //已下单，未收货
                                        var obj = {
                                            status:'确认收货',
                                            subtype:'2',

                                        }
                                        break;
                                    case orderstatus.statusU10001:        //已收货，结束订单
                                        var obj = {
                                            status:'已结单',
                                            subtype:'3',
                                        }
                                        break;
                                }
                                var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                data.push(json)
                            }
                            var result = []
                            for(var m=0;m<data.length;m++){
                                console.log('*************'+data[m].createTime)
                                var timeobj = {
                                    time:functions.timeFormat(data[m].createTime)
                                }
                                console.log(timeobj)
                                var json = eval('('+(JSON.stringify(data[m])+JSON.stringify(timeobj)).replace(/}{/,',')+')');
                                result.push(json)
                            }
                            console.log(result)
                            res.status(200).json(result);
                        }
                    })
                    break;

            }
        })

    }else{
        res.render('login')
    }
})

router.get('/searchorder/:data',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ja', userinfo.arr);
        var pagesize=7
        var linkPhone=req.params.data
        var counturl = "/course/getallga/1/"+linkPhone+'/'+pagesize + '/1';
        var dataurl = "/course/getallga/2/"+linkPhone +'/'+ pagesize;
                res.render('course/courselist_mng',{
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

router.get("/getallga/:type/:linkPhone/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs=new RegExp(req.params.linkPhone);
    var obj={
        linkPhone:qs
    }
    switch(req.params.type){
        case '1':
            Officeorder.count(obj).exec(function(err,docs){
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
            Officeorder.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var data = new Array()
                    for(var i=0;i<docs.length;i++){
                        switch(docs[i].orderStatus){
                            case orderstatus.status0:  //未付款
                                var obj = {
                                    status:'未付款',
                                    subtype:'1'
                                }
                                break;
                            case orderstatus.statusB10001:   //已下单，未收货
                                var obj = {
                                    status:'确认收货',
                                    subtype:'2'
                                }
                                break;
                            case orderstatus.statusU10001:        //已收货，结束订单
                                var obj = {
                                    status:'已结单',
                                    subtype:'3'
                                }
                                break;
                        }
                        var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                        data.push(json)
                    }
                    res.status(200).json(data);
                }
            })
            break;
    }
})

/**
 * 按订单分类搜索
 */
router.get("/typesearch/:typecode",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ja', userinfo.arr);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var pagesize=7
        var counturl = "/orderadmin/typeorder/1/"+req.params.typecode+'/'+pagesize + '/1';
        var dataurl = "/orderadmin/typeorder/2/"+req.params.typecode +'/'+ pagesize;
        Goodsclass.find({interspaceId:interspacesid},'classOrder className',function(err,types){
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                var json = {
                    className: '全部',
                    classOrder: 0
                }
                types.splice(0,0,json)
                for(var i=0;i<types.length;i++){
                    if(req.params.typecode == types[i].classOrder){
                        var obj = types[i]
                    }
                }
                res.render('orderadmin/orderlist_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    userinfo: userinfo.adminuserInfo,
                    data:types,
                    ordertype:obj
                });
            }
        })

    }else {
        res.render('login')
    }
})
router.get("/typeorder/:type/:ordertype/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        if(req.params.ordertype == '0'){
            var obj={
                interspaceId:interspacesid
            }
        }else{
            var obj={
                type:req.params.ordertype,
                interspaceId:interspacesid
            }
        }
        console.log(obj)
        switch(req.params.type){
            case '1':
                Officeorder.count(obj).exec(function(err,docs){
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
                Officeorder.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = new Array()
                        for(var i=0;i<docs.length;i++){
                            switch(docs[i].orderStatus){
                                case orderstatus.status0:  //未付款
                                    var obj = {
                                        status:'未付款',
                                        subtype:'1'
                                    }
                                    break;
                                case orderstatus.statusB10001:   //已下单，未收货
                                    var obj = {
                                        status:'确认收货',
                                        subtype:'2'
                                    }
                                    break;
                                case orderstatus.statusU10001:        //已收货，结束订单
                                    var obj = {
                                        status:'已结单',
                                        subtype:'3'
                                    }
                                    break;
                            }
                            var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
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
 * 按时间搜索
 */
router.get("/searchbydate/:typecode/:starttime/:endtime",function(req,res){
  //{ typecode: '0', starttime: '2017-05-16', endtime: '2017-05-17' }
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ja', userinfo.arr);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var pagesize=7
        var counturl = "/orderadmin/dateorder/1/"+JSON.stringify(req.params)+'/'+pagesize + '/1';
        var dataurl = "/orderadmin/dateorder/2/"+JSON.stringify(req.params)+'/'+ pagesize;
        Goodsclass.find({interspaceId:interspacesid},'classOrder className',function(err,types){
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                var json = {
                    className: '全部',
                    classOrder: 0
                }
                types.splice(0,0,json)
                for(var i=0;i<types.length;i++){
                    if(req.params.typecode == types[i].classOrder){
                        var obj = types[i]
                    }
                }
                for(var i=0;i<types.length;i++){
                    if(req.params.typecode == types[i].classOrder){
                        var obj = types[i]
                    }
                }
                res.render('orderadmin/orderlist_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    userinfo: userinfo.adminuserInfo,
                    data:types,
                    ordertype:obj
                });
            }
        })
    }else {
        res.render('login')
    }
})

/**
 * 查询订单（时间）
 */
router.get("/dateorder/:type/:data/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var starttime = JSON.parse(req.params.data).starttime + ' 00:00:00';
        var startdate = Date.parse(new Date(starttime))
        var endtime = JSON.parse(req.params.data).endtime + ' 00:00:00';
        var enddate = Date.parse(new Date(endtime))+24*60*60*1000
        if(JSON.parse(req.params.data).typecode == '0'){
            var obj={
                interspaceId:interspacesid,
                createTime:{'$gt':startdate,'$lt':enddate}
            }
        }else{
            var obj={
                type:JSON.parse(req.params.data).typecode,
                interspaceId:interspacesid,
                createTime:{'$gt':startdate,'$lt':enddate}
            }
        }
        switch(req.params.type){
            case '1':
                Officeorder.count(obj).exec(function(err,docs){
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
                Officeorder.find(obj).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        var data = new Array()
                        for(var i=0;i<docs.length;i++){
                            switch(docs[i].orderStatus){
                                case orderstatus.status0:  //未付款
                                    var obj = {
                                        status:'未付款',
                                        subtype:'1'
                                    }
                                    break;
                                case orderstatus.statusB10001:   //已下单，未收货
                                    var obj = {
                                        status:'确认收货',
                                        subtype:'2'
                                    }
                                    break;
                                case orderstatus.statusU10001:        //已收货，结束订单
                                    var obj = {
                                        status:'已结单',
                                        subtype:'3'
                                    }
                                    break;
                            }
                            var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
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
 * 确认收货
 */
router.get("/updateorder/:orderid/:subtype",function(req,res){
   if(req.params.subtype == '2'){
       Officeorder.update({_id:req.params.orderid},{'orderStatus':orderstatus.statusU10001},function(err,docs){
           if(err){
               res.render('nodata')
           }else{
               res.redirect("/orderadmin/getorders")
           }
       })
   }else{
       res.redirect("/orderadmin/getorders")
   }
})
module.exports = router;