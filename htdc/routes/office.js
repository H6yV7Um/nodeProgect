var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var orderstatus = require("../common/orderstatus");
var mongoose = require("mongoose");
var Office = mongoose.model("Office");
var Station = mongoose.model("Station");
var Enterprise = mongoose.model("Enterprise");
var User = mongoose.model("User");
var Officeorder = mongoose.model("Officeorder");
var Boardroom = mongoose.model("Boardroom");
var Roadshow = mongoose.model("Roadshow");
var Lockauthority = mongoose.model("Lockauthority");
var Interspace = mongoose.model("Interspace");
var Print = mongoose.model("Print");
var Finance = mongoose.model("Finance");
var Mediaorder = mongoose.model("Mediaorder");
var Systemconfig = mongoose.model("Systemconfig");
var Gym = mongoose.model("Gym");
var Gymcoach = mongoose.model("Gymcoach");
var Integralconf = mongoose.model("Integralconf");

var Visit = mongoose.model("Visit");

router.get("/test",function(req,res){
    //G15054751637225
    Lockauthority.find({},function(err,orders){
      res.send(orders)
    })
})

/**
 * 办公室列表
 */
router.get("/getofficelist/:interspaceid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Office.find({interspaceId:req.params.interspaceid}).sort({name:1}).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var officeids = []
            var data = []
            for(var i=0;i<docs.length;i++){
                officeids.push(docs[i]._id)
                var obj = {
                    stationArr : [],
                    stationNumArr:[],
                    isFull:0
                }
                var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                data.push(newjson)
            }
            console.log(data)
            var time = new Date(new Date().toLocaleDateString()).getTime();
            var nexttime = time + 24*60*60*1000
            //$or:[{type:'1'},{type:'2',endTime:{$lte:nexttime},endTime:{$gte:time}}]
            Lockauthority.find({roomId:{$in:officeids},type:'2',endTime:{$lte:nexttime},endTime:{$gte:time}}).exec(function(err,lock){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{

                    for(var i=0;i<data.length;i++){
                        for(var j=0;j<lock.length;j++){
                            if(data[i]._id == lock[j].roomId){
                                data[i].stationArr.push.apply((data[i].stationArr),lock[j].stationids )
                            }
                        }
                    }
                    console.log(data)
                    Station.find({officeId:{$in:officeids}},function(err,station){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res,ret1,req.params._requestId);
                        }else{
                            for(var x=0;x<data.length;x++){
                                for(var y=0;y<station.length;y++){
                                   if(data[x]._id == station[y].officeId) {
                                       data[x].stationNumArr.push(station[y]._id)
                                       if((station[y].status == 2) || (station[y].status == 1)){
                                           data[x].stationArr.push(station[y]._id)
                                       }
                                   }
                                }
                            }
                            for(var m=0;m<data.length;m++){
                                var arr1 = functions.arrayUniq(data[m].stationArr)
                                var arr2 = functions.arrayUniq(data[m].stationNumArr)
                                if(arr1.length != arr2.length){
                                    data[m].isFull = 1
                                }
                            }
                            console.log(data)
                            var ret = errors.error0;
                            ret.data = data;
                            functions.apiReturn(res,ret,req.params._requestId);

                        }
                    })
                }

            })


        }
    })
})

/**
 * 办公室工位详情
 */
router.get("/getstation/:officeid/:time/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Station.find({officeId:req.params.officeid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var priseids = new Array()
            for(var i=0;i<docs.length;i++){
                if(docs[i].enterpriseId != ''){
                    priseids.push(docs[i].enterpriseId)
                }
            }
            if(priseids.length>0){
                Enterprise.find({_id:{$in:priseids}},function(err,data){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{

                        if(data.length > 0){
                            //var finaldata = new Array()
                            for(var y=0;y<docs.length;y++){
                                for(var x=0;x<data.length;x++){
                                    if((docs[y].status == '1') && (docs[y].enterpriseId == data[x]._id)) {
                                        docs[y].enterpriseName=data[x].priseName
                                    }
                                }
                            }
                            //finaldata = functions.arrayUniq(finaldata)
                            var finaldata = docs
                            console.log(finaldata)
                            Officeorder.find({type:'1',orderTime:parseInt(req.params.time),goodsId:req.params.officeid,orderStatus:orderstatus.statusB10001},'orderInfo',function(err,orders){
                                if(orders.length > 0){
                                    var stationids = new Array()
                                    for(var m=0;m<orders.length;m++){
                                        for(var n=0;n<orders[m].orderInfo.length;n++){
                                            stationids.push(orders[m].orderInfo[n].goodsId)
                                        }
                                    }
                                    for(var b=0;b<finaldata.length;b++){
                                        for(var a=0;a<stationids.length;a++){
                                            if(stationids[a] == finaldata[b]._id){
                                                finaldata[b].status = 3
                                            }
                                        }
                                    }
                                    var ret = errors.error0;
                                    ret.data = finaldata;
                                    functions.apiReturn(res,ret,req.query._requestId);
                                }else{
                                    var ret = errors.error0;
                                    ret.data = finaldata;
                                    functions.apiReturn(res,ret,req.query._requestId);
                                }

                            })
                        }else{
                            var finaldata = docs
                            Officeorder.find({type:'1',orderTime:parseInt(req.params.time),goodsId:req.params.officeid,orderStatus:orderstatus.statusB10001},'orderInfo',function(err,orders) {
                                if (orders.length > 0) {
                                    var stationids = new Array()
                                    for (var m = 0; m < orders.length; m++) {
                                        for (var n = 0; n < orders[m].orderInfo.length; n++) {
                                            stationids.push(orders[m].orderInfo[n].goodsId)
                                        }
                                    }
                                    for (var a = 0; a < stationids.length; a++) {
                                        for (var b = 0; b < finaldata.length; b++) {
                                            if (stationids[a] == finaldata[b]._id) {
                                                finaldata[b].status = 3
                                            }
                                        }
                                    }
                                    var ret = errors.error0;
                                    ret.data = finaldata;
                                    functions.apiReturn(res, ret, req.query._requestId);
                                } else {
                                    var ret = errors.error0;
                                    ret.data = finaldata;
                                    functions.apiReturn(res, ret, req.query._requestId);
                                }
                            })
                        }
                    }
                })
            }else{
                var finaldata = docs
                Officeorder.find({type:'1',orderTime:parseInt(req.params.time),goodsId:req.params.officeid,orderStatus:orderstatus.statusB10001},'orderInfo',function(err,orders) {
                    if (orders.length > 0) {
                        var stationids = new Array()
                        for (var m = 0; m < orders.length; m++) {
                            for (var n = 0; n < orders[m].orderInfo.length; n++) {
                                stationids.push(orders[m].orderInfo[n].goodsId)
                            }
                        }
                        for (var a = 0; a < stationids.length; a++) {
                            for (var b = 0; b < finaldata.length; b++) {
                                if (stationids[a] == finaldata[b]._id) {
                                    finaldata[b].status = 3
                                }
                            }
                        }
                        console.log(finaldata)
                        var ret = errors.error0;
                        ret.data = finaldata;
                        functions.apiReturn(res, ret, req.query._requestId);
                    } else {
                        var ret = errors.error0;
                        ret.data = finaldata;
                        functions.apiReturn(res, ret, req.query._requestId);
                    }
                })

            }
        }
    })
})

/**
 * 预定下单
 */
router.post("/orderstation",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
   console.log(req.body)
    switch(req.body.type) {
        case '1':
            //工位
            next()
            break;
        case '2':
            //会议室
            Officeorder.find({goodsId:req.body.officeid,orderTime:req.body.ordertime,orderStatus:{$ne:orderstatus.status0}},function(err,office){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    console.log(office)
                    if(office.length > 0){
                        var data = []
                        var isexist = 0
                        for(var x=0;x<office.length;x++){
                            for(var y=0;y<office[x].orderInfo.length;y++){
                                data.push(office[x].orderInfo[y].goodsId)
                            }
                        }
                        var arr = JSON.parse(req.body.orderinfo)
                        for(var m=0;m<data.length;m++){
                            for(var n=0;n<arr.length;n++){
                                if(data[m] == arr[n].goodsId){
                                    isexist = 1;
                                    break;
                                }
                            }
                        }
                        if(isexist == 1){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res,ret1,req.body._requestId);
                        }else{
                            next()
                        }
                    }else{
                        next()
                    }
                }
            })
            break;
        case '3':
            //路演厅
            Officeorder.find({goodsId:req.body.officeid,orderTime:req.body.ordertime,orderStatus:{$ne:orderstatus.status0}},function(err,office){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    console.log(office)
                    if(office.length > 0){
                        var data = []
                        var isexist = 0
                        for(var x=0;x<office.length;x++){
                            for(var y=0;y<office[x].orderInfo.length;y++){
                                data.push(office[x].orderInfo[y].goodsId)
                            }
                        }
                        var arr = JSON.parse(req.body.orderinfo)
                        console.log(data)
                        for(var m=0;m<data.length;m++){
                            for(var n=0;n<arr.length;n++){
                                if(data[m] == arr[n].goodsId){
                                    isexist = 1;
                                    break;
                                }
                            }
                        }
                        if(isexist == 1){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res,ret1,req.body._requestId);
                        }else{
                            next()
                        }
                    }else{
                        next()
                    }
                }
            })
            break;
        default:
            next()
            break;
    }
},function (req, res, next) {
    Interspace.findOne({_id:req.body.interspaceId},'interspaceName',function(err,interspace){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var addorder = function(integralNum,integralFee){
                var obj = {
                    interspaceId:req.body.interspaceId,    //空间id
                    interspaceName:interspace.interspaceName,    //空间名
                    userId:req.body.userid,  //userid
                    userPhone:req.body.phone,
                    orderNo:req.body.orderno,
                    goodsId:req.body.officeid,  //预定商品的id
                    type:req.body.type,   //1工位2会议室3路演厅4健身房
                    orderStatus:orderstatus.status0,  //预约状态
                    orderAmount:req.body.orderAmount,  //订单金额
                    orderTime:req.body.ordertime,    //预约时间
                    deposit:req.body.deposit,
                    isreturn:0,
                    integralNum:integralNum,    //抵扣积分数
                    integralFee:integralFee,    //抵扣积分金额数
                    orderInfo:JSON.parse(req.body.orderinfo),  //预约详情
                    createTime:Date.now(),             //时间
                }

                if(req.body.orderAmount == 0){
                    obj.orderStatus = orderstatus.statusB10001;
                    switch(req.body.type){
                        case '1':
                            //工位
                            var starttime = req.body.ordertime;
                            var endtime = parseInt(req.body.ordertime) + 24*60*60*1000;
                            break;
                        case '2':
                            //会议室
                            console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
                            var arr = functions.sortNumberByKey(JSON.parse(req.body.orderinfo),'goodsId',-1)
                            var timeon = functions.officeTime(arr[0].goodsId)
                            var timeend = functions.officeTime(arr[arr.length-1].goodsId)

                            var starttime = parseInt(req.body.ordertime)+timeon;
                            var endtime = parseInt(req.body.ordertime) + timeend + 30*60*1000;

                            break;
                        case '3':
                            //路演厅
                            var arr = functions.sortNumberByKey(JSON.parse(req.body.orderinfo),'goodsId',-1)
                            console.log(arr)
                            var timeon = functions.roadshowTime(arr[0].goodsId)
                            var timeend = functions.roadshowTime(arr[arr.length-1].goodsId)
                            var starttime = parseInt(req.body.ordertime)+timeon;
                            var endtime = parseInt(req.body.ordertime) + timeend + 30*60*1000;
                            console.log(starttime+'________________________'+endtime)
                            break;
                        case '4':
                            //健身房
                            var arr = functions.sortNumberByKey(JSON.parse(req.body.orderinfo),'goodsId',-1)
                            var timeon = functions.gymTime(arr[0].goodsId)
                            var timeend = functions.gymTime(arr[arr.length-1].goodsId)
                            var starttime = parseInt(req.body.ordertime)+timeon;
                            var endtime = parseInt(req.body.ordertime) + timeend;


                            break;
                    }
                    functions.addLockAuthority (req.body.officeid,req.body.userid,starttime,endtime,JSON.parse(req.body.orderinfo),function(err,docs){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res,ret1,req.body._requestId);
                        }else{
                            console.log(docs)
                            var order = new Officeorder(obj)
                            order.save(function(err,data){
                                if(err){
                                    var ret1 = errors.error3;
                                    ret1.data = err;
                                    functions.apiReturn(res,ret1,req.body._requestId);
                                }else{
                                    if((req.body.type == '2') || (req.body.type == '3')){
                                        functions.deductIntegral(data)
                                        User.find({_id:req.body.userid,authenticationStatus:{$in:[2,4]}},function(err,userinfo){
                                            if(err){
                                                var ret1 = errors.error3;
                                                ret1.data = err;
                                                functions.apiReturn(res,ret1,req.body._requestId);
                                            }else{
                                                if(userinfo.length>0){
                                                    if(req.body.type == '2'){
                                                        var obj = {
                                                            $inc:{freeboardroom:-1}
                                                        }
                                                    }else{
                                                        var obj = {
                                                            $inc:{freeroadshow:-1}
                                                        }
                                                    }
                                                    Enterprise.update({userId:req.body.userid},obj,function(err,prise){
                                                        if(err){
                                                            var ret1 = errors.error3;
                                                            ret1.data = err;
                                                            functions.apiReturn(res,ret1,req.body._requestId);
                                                        }else{
                                                            var ret = errors.error0;
                                                            ret.data = data;
                                                            functions.apiReturn(res,ret,req.body._requestId);
                                                        }
                                                    })
                                                }else{
                                                    var ret = errors.error0;
                                                    ret.data = data;
                                                    functions.apiReturn(res,ret,req.body._requestId);
                                                }
                                            }
                                        })
                                    }else{
                                        var ret = errors.error0;
                                        ret.data = data;
                                        functions.apiReturn(res,ret,req.body._requestId);
                                    }
                                }
                            })
                        }
                    })
                }else{
                    var order = new Officeorder(obj)
                    order.save(function(err,data){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res,ret1,req.body._requestId);
                        }else{
                            //Enterprise.update({})
                            var ret = errors.error0;
                            ret.data = data;
                            functions.apiReturn(res,ret,req.body._requestId);
                        }
                    })
                }
            }
            if((req.body.intergral) && (req.body.intergral > 0)){
                Integralconf.find({},function(err,integral){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res,ret1,req.body._requestId);
                    }else{
                        var intergralfee = parseInt((integral[0].integralFee/req.body.intergral)*100)
                        addorder(req.body.intergral,intergralfee)
                    }
                })
            }else{
                addorder(0,0)
            }




        }
    })


})

/**
 * 会议室、路演厅取消订单
 */
router.delete("/deleteorder",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.query._requestId);
    }
},function (req, res, next) {
    //if(req.body.orderAmount == 0){
    //去掉开锁权限

    Officeorder.find({_id:req.query.orderid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.query._requestId);
        }else{
            console.log(docs)
            console.log(parseInt(docs[0].orderAmount)*100)
            Officeorder.remove({_id:req.query.orderid},function(err,order){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.query._requestId);
                }else{
                    var canclelock = function(fn){
                        Lockauthority.remove({userId:req.query.userid,roomId:docs[0].goodsId,type:2},function(err,data){
                            if(err){
                                fn(err,null)
                            }else{
                                fn(null,data)
                            }
                        })
                    }
                    if(docs[0].orderAmount == 0){
                        //去掉开锁权限
                        canclelock(function(err,result){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                functions.apiReturn(res,ret1,req.query._requestId);
                            }else{
                                var ret = errors.error0;
                                ret.data = {
                                    status:1
                                };
                                functions.apiReturn(res,ret,req.query._requestId);
                            }
                        })
                    }else{
                        //去掉开锁权限
                        //金额退至钱包
                        canclelock(function(err,result){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                functions.apiReturn(res,ret1,req.query._requestId);
                            }else{
                                //money
                                User.update({_id:docs[0].userId},{$inc:{money:parseInt((docs[0].orderAmount)*100)}},function(err,user){
                                    if(err){
                                        var ret1 = errors.error3;
                                        ret1.data = err;
                                        functions.apiReturn(res,ret1,req.query._requestId);
                                    }else{
                                        console.log(user)
                                        var finance = new Finance({
                                            userId:req.query.userid,         //userid
                                            interspaceId:docs[0].interspaceId,    //空间id
                                            type:300,           //100充值101提现200路演听押金退还300订单退款
                                            amount:parseInt((docs[0].orderAmount)*100),        //金额(分)
                                            orderNo:'T'+parseInt(Date.now()/1000)+functions.createVercode(4),                //订单号
                                            channel:'wallte',                //充值方式
                                            goodsId:docs[0].goodsId,
                                            goodsName:docs[0].orderInfo[0].goodsName,
                                            //coffeeShopId:String,          //咖啡分店id
                                            financeway:2,
                                            isPaied:1,                //是否支付成功 1成功0未成功
                                            createTime:Date.now(),             //时间
                                        })
                                        finance.save(function(err,addfinance){
                                            if(err){
                                                var ret1 = errors.error3;
                                                ret1.data = err;
                                                functions.apiReturn(res,ret1,req.query._requestId);
                                            }else{
                                                console.log(addfinance)
                                                var ret = errors.error0;
                                                ret.data = {
                                                    status:1
                                                };
                                                functions.apiReturn(res,ret,req.query._requestId);
                                            }
                                        })

                                    }
                                })
                            }
                        })
                    }
                }
            })


        }
    })
})


/**
 * 查看会议室列表
 */
router.get("/getboardroom/:interspaceid/:time/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Boardroom.find({interspaceId:req.params.interspaceid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var boardids = new Array();
            for(var i=0;i<docs.length;i++){
                boardids.push(docs[i]._id)
            }
            Officeorder.find({type:2,goodsId:{$in:boardids},orderTime:parseInt(req.params.time),orderStatus:orderstatus.statusB10001},function(err,orders){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    var finaldata = new Array()
                    for(var i=0;i<docs.length;i++){
                        var orderarr = new Array()
                        for(var j=0;j<orders.length;j++){
                            var arr = new Array()
                            if(docs[i]._id == orders[j].goodsId){
                                for(var x=0;x<orders[j].orderInfo.length;x++){
                                    arr.push(orders[j].orderInfo[x].goodsId)
                                }
                            }
                            orderarr.push.apply(orderarr, arr);
                        }
                        var obj = {
                            orderarr:orderarr
                        }
                        var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                        finaldata.push(newjson)
                    }

                    var ret = errors.error0;
                    ret.data = finaldata;
                    functions.apiReturn(res,ret,req.params._requestId);
                }
            })
        }
    })
})

/**
 * 查看路演厅列表
 */
router.get("/getroadshow/:interspaceid/:time/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Roadshow.find({interspaceId:req.params.interspaceid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            console.log(docs)
            var boardids = new Array();
            for(var i=0;i<docs.length;i++){
                boardids.push(docs[i]._id)
            }
            Officeorder.find({type:'3',goodsId:{$in:boardids},orderTime:parseInt(req.params.time),orderStatus:orderstatus.statusB10001},function(err,orders){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    console.log(orders)
                    var finaldata = new Array()
                    for(var i=0;i<docs.length;i++){
                        var orderarr = new Array()
                        for(var j=0;j<orders.length;j++){
                            var arr = new Array()
                            if(docs[i]._id == orders[j].goodsId){
                                for(var x=0;x<orders[j].orderInfo.length;x++){
                                    arr.push(orders[j].orderInfo[x].goodsId)
                                }
                            }
                            orderarr.push.apply(orderarr, arr);
                        }
                        var obj = {
                            orderarr:orderarr
                        }
                        var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                        finaldata.push(newjson)
                    }

                    var ret = errors.error0;
                    ret.data = finaldata;
                    functions.apiReturn(res,ret,req.params._requestId);
                }
            })
        }
    })
})

/**
 * 查看健身房列表
 */
router.get("/gymlist/:interspaceid/:time/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Gym.find({interspaceId:req.params.interspaceid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{

            if(docs.length > 0){
                var gyms = new Array();
                for(var i=0;i<docs.length;i++){
                    gyms.push(docs[i]._id)
                }
                Officeorder.find({type:'4',goodsId:{$in:gyms},orderTime:parseInt(req.params.time),orderStatus:orderstatus.statusB10001},function(err,orders){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res,ret1,req.params._requestId);
                    }else{

                        if(orders.length > 0){

                            var finaldata = new Array()
                            for(var i=0;i<docs.length;i++){
                                var orderarr = new Array()
                                var newarr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                                for(var j=0;j<orders.length;j++){
                                    if(docs[i]._id == orders[j].goodsId){

                                        for(var x=0;x<orders[j].orderInfo.length;x++){
                                            for(var y=0;y<47;y++){
                                                if(parseInt(orders[j].orderInfo[x].goodsId) == y){
                                                    newarr[y] += 1
                                                }
                                            }

                                        }


                                    }

                                }

                                for(var m=0;m<newarr.length;m++){
                                    if(newarr[m]< docs[i].personNum){

                                    }else{
                                        orderarr.push(m)
                                    }
                                }

                                var obj = {
                                    orderarr:orderarr
                                }
                                var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                finaldata.push(newjson)
                            }

                            var ret = errors.error0;
                            ret.data = finaldata;
                            functions.apiReturn(res,ret,req.params._requestId);
                        }else{
                            var finaldata = new Array()
                            for(var i=0;i<docs.length;i++){
                                var obj = {
                                    orderarr:[]
                                }
                                var newjson = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                finaldata.push(newjson)
                            }
                            var ret = errors.error0;
                            ret.data = finaldata;
                            functions.apiReturn(res,ret,req.params._requestId);
                        }

                    }
                })
            }else{
                var ret = errors.error0;
                ret.data = [];
                functions.apiReturn(res,ret,req.params._requestId);
            }

        }
    })
})

/**
 * 教练列表
 */
router.get("/gymcoachlist/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Gymcoach.find({}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
 * 健身房详情h5
 */
router.get("/gyminfo/:gymid",function(req,res){
    Gym.findOne({_id:req.params.gymid},'roomInfo',function(err,docs){
        console.log()
        if(err){
            res.render('nodata')
        }else{
            res.render("goodsinfo",{
                data:docs.roomInfo
            })
        }
    })
})

/**
 * 会议室详情h5
 */
router.get("/getboardroominfo/:boardid",function(req,res){
    Boardroom.findOne({_id:req.params.boardid},'roomInfo',function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.render("goodsinfo",{
                data:docs.roomInfo
            })
        }
    })
})

/**
 * 路演厅详情h5
 */
router.get("/getroadshowinfo/:roadshowid",function(req,res){
    Roadshow.findOne({_id:req.params.roadshowid},'roomInfo',function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.render("goodsinfo",{
                data:docs.roomInfo
            })
        }
    })
})

/**
 * 加班预约选择办公室
 */
router.get("/getmyoffice/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Lockauthority.find({userId:req.params.userid,type:'1'},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var officeids = new Array()
            for(var i=0;i<docs.length;i++){
                officeids.push(docs[i].roomId)
            }
            Office.find({_id:{$in:officeids}},function(err,offices){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    var data = new Array()
                    for(var x=0;x<docs.length;x++){
                        for(var y=0;y<offices.length;y++){
                            if(docs[x].roomId == offices[y]._id){
                                var obj = {
                                    officeName:offices[y].name
                                }
                                var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                data.push(newjson)
                            }
                        }
                    }
                    var ret = errors.error0;
                    ret.data = data;
                    functions.apiReturn(res,ret,req.params._requestId);
                }
            })
        }
    })
})

/**
 * 加班预约
 */
router.post("/overtimeorder",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Interspace.findOne({_id:req.body.interspaceId},'interspaceName',function(err,interspace) {
        if (err) {
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        } else {
            var obj = new Print({
                orderNo:req.body.orderno,
                userId:req.body.userid,
                type:'1',
                officeId:req.body.officeId,
                officeName:req.body.officeName,
                interspaceId:req.body.interspaceid,    //空间id
                interspaceName:interspace.interspaceName,
                date:req.body.date,    //复印打印、加班预约日期
                startTime:req.body.startTime,     //加班预约开始时间
                endTime:req.body.endTime,       //加班预约结束时间
                createTime:Date.now(),  //时间
        })
            obj.save(function(err,docs){
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
        }
    })

})

/**
 * 获取会议室、路演厅免费次数
 */
router.get("/getofficefree/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Enterprise.findOne({userId:req.params.userid},'freeboardroom freeroadshow',function(err,docs){
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
 * 根据订单号查询订单详情
 */
router.get("/orderinfo/:orderno/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Officeorder.findOne({orderNo:req.params.orderno},function(err,docs){
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
 * 提交立体媒体服务
 */
router.post("/mediaorder",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var obj = new Mediaorder({
        interspaceId:req.body.interspaceid,   //空间id
        userId:req.body.userid,    //用户id
        orderInfo:JSON.parse(req.body.orderinfo),    //订单内容
        userPhone:req.body.phone,
        isDispose:'0',
        createTime:Date.now(),  //时间
    })
    obj.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            Systemconfig.find({interspaceId:req.body.interspaceid},function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    if(docs.length > 0){
                        var ret = errors.error0;
                        ret.data = docs[0];
                        functions.apiReturn(res,ret,req.body._requestId);
                    }else{
                        var ret = errors.error0;
                        ret.data = {};
                        functions.apiReturn(res,ret,req.body._requestId);
                    }

                }
            })

        }
    })
})
module.exports = router;