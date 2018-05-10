var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var config = require("../common/config")
var makexlsx = require("../common/makexlsx")
var mongoose = require("mongoose");
var Finance = mongoose.model("Finance");
var Withdraw = mongoose.model("Withdraw");
var Interspace = mongoose.model("Interspace");
var User = mongoose.model("User");
var fs = require('fs');
var officegen = require('officegen');
var xlsx = officegen ( 'xlsx' );
var path = require ( 'path' );
var mime = require ( 'mime' );

/*
 查询所有财务
 */
router.get("/financelist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ua', userinfo.arr);
        var pagesize = 7;
        var counturl = "/financeadmin/getfinance/1/"+pagesize + '/1';
        var dataurl = "/financeadmin/getfinance/2"+ '/' + pagesize;
        Interspace.find({},function(err,interspace) {
            if (err) {
                var ret1 = errors.error3;
                ret1.data = err;
                res.status(200).json(ret1);
            } else {
                var obj = {
                    _id:'0',
                    interspaceName:'--选择财务分类--'
                }
                var coffee = {
                    _id:'1',
                    interspaceName:'初心创咖'
                }
                var aa = {
                    _id:'2',
                    interspaceName:'AA加速'
                }
                var gym = {
                    _id:'3',
                    interspaceName:'健身房'
                }
                var gymcoach = {
                    _id:'4',
                    interspaceName:'健身教练'
                }
                interspace.push(coffee)
                interspace.push(aa)
                interspace.push(gym)
                interspace.push(gymcoach)
                res.render('finance/financelist_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    interspaces:interspace,
                    userinfo: userinfo.adminuserInfo,
                    interspace:obj
                });
            }
        })

    }else {
        res.render('login')
    }
})

router.get("/getfinance/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Finance.count({type:{$ne:100},type:{$ne:101}}).exec(function(err,docs){
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
                Finance.find({type:{$ne:100},type:{$ne:101}}).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        Interspace.find({},function(err,interspace){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                var data = new Array()
                                for(var i=0;i<docs.length;i++){
                                    for(var j=0;j<interspace.length;j++){
                                        if(interspace[j]._id == docs[i].interspaceId){
                                            var obj = {
                                                interspaceName:interspace[j].interspaceName,
                                                time:functions.timeFormat(docs[i].createTime),
                                                paytype:'',
                                                money:(docs[i].amount/100).toFixed(2)
                                            }
                                            var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(json)
                                        }
                                    }
                                }
                                for(var x=0;x<data.length;x++){
                                    switch(data[x].channel){
                                        case 'wx':
                                            data[x].paytype = '微信支付'
                                            break;
                                        case 'alipay':
                                            data[x].paytype = '支付宝支付'
                                            break;
                                        case 'wallet':
                                            data[x].paytype = '钱包支付'
                                            break;

                                    }
                                }
                                res.status(200).json(data);
                            }
                        })

                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/*
 查询所有提现
 */
router.get("/withdrawlist",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ub', userinfo.arr);
        var pagesize = 3;
        var counturl = "/financeadmin/getwithdraw/1/"+pagesize + '/1';
        var dataurl = "/financeadmin/getwithdraw/2"+ '/' + pagesize;
        res.render('finance/withdrawlist_mng',{
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

router.get("/getwithdraw/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Withdraw.count().exec(function(err,docs){
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
            Withdraw.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var data = new Array()
                    var userids = new Array()
                    for(var i=0;i<docs.length;i++){
                        userids.push(docs[i].userId)
                    }
                    User.find({_id:{$in:userids}},function(err,users){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else{
                            for(var x=0;x<docs.length;x++){
                                for(var y=0;y<users.length;y++){
                                    if(docs[x].userId == users[y]._id){
                                        var obj = {
                                            userName:users[y].nickName,
                                            time:functions.timeFormat(docs[x].createTime),
                                            money:(docs[x].amount/100).toFixed(2)
                                        }
                                        var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                        data.push(newjson)
                                    }
                                }
                            }
                            res.status(200).json(data);
                        }
                    })

                }
            })
            break;

    }
})

/**
 * 导出文件
 */
router.post("/searchdata",function(req,res){
    // console.log(req.body)
    if(req.body.type == 2){
        var obj = {
            interspaceId: req.body.interspaceId,
            createTime:{'$gt':req.body.startdate,'$lt':(req.body.enddate)+24*60*60*1000},
        }
    }else{
        var obj = {
            interspaceId: req.body.interspaceId,
        }
    }
    Finance.find(obj,function(err,docs){
        if(err){

        }else{
            var arr = [req.body.interspaceName,'支付金额','支付方式','支付时间'];
            var filename = './uploads/'+req.body.interspaceName+'/.xlsx'
            makexlsx.makeXlsx(arr,docs,req.body.interspaceName,filename)
            var userinfo = req.session.adminuser;
            if(userinfo) {
                var leftNav = functions.createLeftNavByCodes('Ua', userinfo.arr);
                var pagesize = 3;
                var counturl = "/financeadmin/getsearchfinance/1/"+'/'+obj+'/'+pagesize + '/1';
                var dataurl = "/financeadmin/getsearchfinance/2"+ '/'+obj+'/' + pagesize;
                Interspace.find({},function(err,interspace) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        res.render('finance/financelist_mng',{
                            leftNav:leftNav,
                            pagesize : pagesize,
                            counturl:counturl,
                            dataurl:dataurl,
                            interspaces:interspace,
                            userinfo: userinfo.adminuserInfo
                        });
                    }
                })
            }else{
                res.render('login')
            }

        }
    })

})

router.get("/getsearchfinance/:type/:obj/:pagesize/:page",function(req,res){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Finance.count(req.params.obj).exec(function(err,docs){
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
            Finance.find(req.params.obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    Interspace.find({},function(err,interspace){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        }else{
                            var data = new Array()
                            for(var i=0;i<docs.length;i++){
                                for(var j=0;j<interspace.length;j++){
                                    if(interspace[j]._id == docs[i].interspaceId){
                                        var obj = {
                                            interspaceName:interspace[j].interspaceName,
                                            time:functions.timeFormat(docs[i].createTime),
                                            paytype:'',
                                        }
                                        var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                        data.push(json)
                                    }
                                }
                            }
                            for(var x=0;x<data.length;x++){
                                switch(data[x].channel){
                                    case 'wx':
                                        data[x].paytype = '微信支付'
                                        break;
                                    case 'alipay':
                                        data[x].paytype = '支付宝支付'
                                        break;
                                    case 'wallet':
                                        data[x].paytype = '钱包支付'
                                        break;

                                }
                            }
                            res.status(200).json(data);
                        }
                    })

                }
            })
            break;

    }
})

router.get("/tess",function(req,res){
    var path = require('path');
    var mime = require('mime');
    var fs = require('fs');
    var file = './uploads/out.xlsx';

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);        //匹配文件格式

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);
    filestream.on('data', function (chunk) {
        res.send(chunk);
    });
    filestream.on('end', function () {
        res.send('ok');
    });
})

/**
 * 筛选财务
 */
router.get("/interspacefinance/:type/:interspaceid",function(req,res){
    console.log(req.params.interspaceid)
    //"{\"interspaceId\":\"591fdee4b06f7c6b47dc53b6\",\"starttime\":\"2017-06-04\",\"enddate\":\"2017-06-05\"}"

    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ua', userinfo.arr);
        var pagesize = 7;
        if(req.params.type == 1){

            switch(req.params.interspaceid){
                case '1':
                    var obj = {
                        type:5,
                    }
                    break;
                case '2':
                    var obj = {
                        type:9,
                    }
                    break;
                case '3':
                    var obj = {
                        type:4,
                    }
                    break;
                case '4':
                    var obj = {
                        type:6,
                    }
                    break;
                default:
                    var obj = {
                        interspaceId:req.params.interspaceid,
                        type:{$nin:[5,9,4,6,100,101]}
                    }
                    break;
            }
            var interspaceid = req.params.interspaceid
        }else{
            var json = JSON.parse(req.params.interspaceid)
            //{"interspaceId":"591fdee4b06f7c6b47dc53b6","starttime":"2017-06-04","enddate":"2017-06-05"}
            // { interspaceId: '591fdee4b06f7c6b47dc53b6',
            //     starttime: '2017-06-04',
            //     enddate: '2017-06-05' }

            var interspaceid = json.interspaceId
            var starttime = json.starttime + ' 00:00:00';
            var startdate = Date.parse(new Date(starttime))
            var endtime = json.enddate + ' 00:00:00';
            var enddate = Date.parse(new Date(endtime))+24*60*60*1000
            switch(interspaceid){
                case '0':
                    var obj = {
                        createTime:{'$gt':startdate,'$lt':enddate}
                    }
                    break;
                case '1':
                    var obj = {
                        type:5,
                        createTime:{'$gt':startdate,'$lt':enddate}
                    }
                    break;
                case '2':
                    var obj = {
                        type:9,
                        createTime:{'$gt':startdate,'$lt':enddate}
                    }
                    break;
                case '3':
                    var obj = {
                        type:4,
                        createTime:{'$gt':startdate,'$lt':enddate}
                    }
                    break;
                case '4':
                    var obj = {
                        type:6,
                        type:{$nin:[5,9,4,6,100,101]},
                        createTime:{'$gt':startdate,'$lt':enddate}
                    }
                    break;
                default:
                    var obj = {
                        interspaceId:json.interspaceId,
                        createTime:{'$gt':startdate,'$lt':enddate}
                    }
                    break
            }


        }

        var counturl = "/financeadmin/interspacefinance/1/"+JSON.stringify(obj)+'/'+pagesize + '/1';
        var dataurl = "/financeadmin/interspacefinance/2"+ '/'+JSON.stringify(obj)+'/' + pagesize;
        Interspace.find({},function(err,interspace) {
            if (err) {
                var ret1 = errors.error3;
                ret1.data = err;
                res.status(200).json(ret1);
            } else {
                switch(interspaceid){
                    case '0':
                        var obj = {
                            _id:'0',
                            interspaceName:'--选择财务分类--'
                        }
                        break;
                    case '1':
                        var obj = {
                            _id:'1',
                            interspaceName:'初心创咖'
                        }
                        break;
                    case '2':
                        var obj = {
                            _id:'2',
                            interspaceName:'AA加速'
                        }
                        break;
                    case '3':
                        var obj = {
                            _id:'3',
                            interspaceName:'健身房'
                        }
                        break;
                    case '4':
                        var obj = {
                            _id:'4',
                            interspaceName:'健身教练'
                        }
                        break;

                    default:
                        for(var i=0;i<interspace.length;i++){
                            if(interspaceid == interspace[i]._id){
                                var obj = interspace[i]
                            }
                        }
                        break;
                }

                var coffee = {
                    _id:'1',
                    interspaceName:'初心创咖'
                }
                var aa = {
                    _id:'2',
                    interspaceName:'AA加速'
                }
                var gym = {
                    _id:'3',
                    interspaceName:'健身房'
                }
                var gymcoach = {
                    _id:'4',
                    interspaceName:'健身教练'
                }
                interspace.push(coffee)
                interspace.push(aa)
                interspace.push(gym)
                interspace.push(gymcoach)
                res.render('finance/financelist_mng',{
                    leftNav:leftNav,
                    pagesize : pagesize,
                    counturl:counturl,
                    dataurl:dataurl,
                    interspaces:interspace,
                    userinfo: userinfo.adminuserInfo,
                    interspace:obj
                });
            }
        })

    }else {
        res.render('login')
    }
})

router.get("/interspacefinance/:type/:obj/:pagesize/:page",function(req,res){

    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Finance.count(JSON.parse(req.params.obj)).exec(function(err,docs){
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
            Finance.find(JSON.parse(req.params.obj)).sort({'createTime':-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{  //interspaceId
                    console.log(docs)
                    var interspaceids = new Array()
                    for(var i=0;i<docs.length;i++){
                        if((!docs[i].interspaceId) || (docs[i].interspaceId == '')){

                        }else{
                            interspaceids.push(docs[i].interspaceId)
                        }

                    }
                    if(interspaceids.length > 0){
                        Interspace.find({},function(err,interspace){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else{
                                var data = new Array()
                                for(var i=0;i<docs.length;i++){
                                    for(var j=0;j<interspace.length;j++){
                                        if(interspace[j]._id == docs[i].interspaceId){
                                            var obj = {
                                                interspaceName:interspace[j].interspaceName,
                                                time:functions.timeFormat(docs[i].createTime),
                                                paytype:'',
                                                money:(docs[i].amount/100).toFixed(2)
                                            }
                                            var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            data.push(json)
                                        }
                                    }
                                }
                                for(var x=0;x<data.length;x++){
                                    switch(data[x].channel){
                                        case 'wx':
                                            data[x].paytype = '微信支付'
                                            break;
                                        case 'alipay':
                                            data[x].paytype = '支付宝支付'
                                            break;
                                        case 'wallet':
                                            data[x].paytype = '钱包支付'
                                            break;

                                    }
                                }
                                res.status(200).json(data);
                            }
                        })
                    }else{
                        var data = []
                        for(var x=0;x<docs.length;x++){
                            var obj = {
                                time:functions.timeFormat(docs[x].createTime),
                                paytype:'',
                                money:(docs[x].amount/100).toFixed(2)
                            }
                            switch(docs[x].channel){
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
                            data.push(json)
                        }
                        res.status(200).json(data);
                    }


                }
            })
            break;

    }
})

router.post("/financeout",function(req,res){

    var starttime = Date.parse(new Date(req.body.startdate + ' 00:00:00'))
    var endtime = Date.parse(new Date(req.body.enddate + ' 00:00:00'))+24*60*60*1000
    var interspaceid = req.body.interspaceId
        switch(interspaceid){
            case '1':
                var obj = {
                    type:5,
                    createTime:{$gt:starttime,$lt:endtime}
                }
                break;
            case '2':
                var obj = {
                    type:9,
                    createTime:{$gt:starttime,$lt:endtime}
                }
                break;
            case '3':
                var obj = {
                    type:4,
                    createTime:{$gt:starttime,$lt:endtime}
                }
                break;
            case '4':
                var obj = {
                    type:6,
                    createTime:{$gt:starttime,$lt:endtime}
                }
                break;

            default:
                var obj = {
                    interspaceId:interspaceid,
                    createTime:{$gt:starttime,$lt:endtime}
                }
                break;
        }
    Finance.find(obj).sort({'createTime':1}).exec(function(err,docs){
        if(err){

        }else{
            Interspace.find({},function(err,interspace){
                if(err){

                }else{
                    var jsondata = []
                    for(var i=0;i<docs.length;i++){
                        for(var j=0;j<interspace.length;j++){
                            if(docs[i].interspaceId == interspace[j]._id){
                                docs[i].interspaceId = interspace[j].interspaceName
                            }
                        }
                        var json = {
                            time:functions.timeFormat(docs[i].createTime),
                            money:(docs[i].amount/100).toFixed(2),
                            paytype:''
                        }
                        switch(docs[i].channel){
                            case 'wx':
                                json.paytype = '微信支付'
                                break;
                            case 'alipay':
                                json.paytype = '支付宝支付'
                                break;
                            case 'wallet':
                                json.paytype = '钱包支付'
                                break;
                        }
                        var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(json)).replace(/}{/,',')+')');
                        jsondata.push(newjson)
                    }

                    xlsx.on ( 'finalize', function ( written ) {
                        console.log ( 'Finish to create an Excel file.\nTotal bytes created: ' + written + '\n' );
                    });

                    xlsx.on ( 'error', function ( err ) {
                        console.log ( err );
                    });

                    sheet = xlsx.makeNewSheet ();
                    sheet.name = 'Excel Test';

                    sheet.data[0] = ['空间信息','商品名','支付方式','支付金额','下单时间'];
                    console.log(jsondata)
                    for(var i=1;i<jsondata.length-1;i++){
                        sheet.data[i] = [jsondata[i].interspaceId,jsondata[i].goodsName,jsondata[i].paytype,jsondata[i].money,jsondata[i].time]
                    }
                    var out = fs.createWriteStream ( './uploads/out.xlsx' );
                    out.on ( 'error', function ( err ) {

                    });

                    xlsx.generate ( out );

                    res.status(200).json({
                        status:1
                    });
                }
            })


        }
    })

})
router.get("/excelDownload", function (req, res, next) {
    //var schoolNameStr = req.params.schoolNameStr;
    var file = config.siteUrl + '/uploads/out.xlsx';

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);        //匹配文件格式

    res.setHeader('Content-disposition', 'attachment; filename=' + encodeURIComponent(filename));
    res.setHeader('Content-type', mimetype);
    var filestream = fs.createReadStream(file);
    filestream.on('data', function (chunk) {
        res.write(chunk);
    });
    filestream.on('end', function () {
        res.end();
        fs.unlink(file)
    });
});
module.exports = router;