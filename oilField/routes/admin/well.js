var express = require('express');
var router = express.Router();
var config = require('../../common/config');
var errors = require("../../common/errors");
var md5 = require('md5')
var functions = require('../../common/functions');
var session = require("session");


/* 通用 */
router.use(function (req, res, next) {
    var user = req.session.user;
    if (user) {
        var params = {
            title: '中国石油',
            user: JSON.stringify(user)
        };
        req.body._params = params;
    } else {
        var params = {
            title: '中国石油'
        };
        req.body._params = params;
    }
    next();
})

/*添加单井*/
router.post("/addWell",function(req,res){
    req.models.Well.find({
        wellName:req.body.wellName,
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error10001);
            }else{
                req.models.Well.create({
                    wellName:req.body.wellName,
                    diagrams:req.body.diagrams,
                    oilData:req.body.oilData,
                    createTime:parseInt(Date.now()/1000)                      //创建时间
                }, function (err, docs) {
                    if(err){
                        console.log(err)
                        res.status(200).json(errors.error3);
                    }else{
                        res.status(200).json({
                            error:0,
                            message:'success',
                            data:docs
                        });
                    }
                })
            }
        }
    });
})

/*查询用户所管理的井组*/
router.get('/getWell', function (req, res, next) {
    req.models.User.find({/*id:req.session.user.id*/id:1},function(err,docs){
        if(err){
            res.status(200).json(errors.error3);
        }else {
            req.models.Well.find({}, function (err, wells) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var wellArr = []
                    if(docs[0].jurisdiction==''){
                        for (let i = 0; i < wells.length; i++) {
                            wellArr.push({
                                type: wells[i].id,
                                name: wells[i].wellName
                            })
                        }
                    }else{
                        var power=(docs[0].jurisdiction).split("-")
                        for (let i = 0; i < wells.length; i++) {
                            if(power[i]==wells[i].wellName){
                                wellArr.push({
                                    type: wells[i].id,
                                    name: wells[i].wellName
                                })
                            }
                        }
                    }
                    res.json({
                        error: 0,
                        data: wellArr
                    })
                }
            })
        }
    })
});

/*添加站点数据*/
router.post("/addWellData",function(req,res){
    var user=req.session.user
    req.models.WellData.create({
        wellId:req.body.wellId,
        liquidLevel:req.body.liquidLevel,
        waterContent:req.body.waterContent,
        wellPressure:req.body.wellPressure,
        wellTime:req.body.wellTime,
        userName:user.username /*'张三'*/,
        createTime:parseInt(Date.now()/1000)                      //创建时间
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            res.status(200).json({
                error:0,
                message:'success',
            });
        }
    })
})

/*查询站点数据信息*/
router.get('/getWellData/:page', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;

    req.models.WellData.count({},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.WellData.find({}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.Well.find({},function (err, Well) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                for(var j in Well){
                                    if(docs[i].wellId==Well[j].id){
                                        var json = eval('('+(JSON.stringify(Well[j])+JSON.stringify(docs[i])).replace(/}{/,',')+')');
                                        arr.push(json)
                                    }
                                }
                            }
                            res.json({
                                error:0,
                                data:arr,
                                count:count
                            })
                        }
                    })
                }
            })
        }
    });
});

/*查询历史记录*/
router.get('/history/:page/:wellId', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    var wellId=req.params.wellId
    req.models.WellData.count({wellId:wellId},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.WellData.find({wellId:wellId}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.Well.find({id:wellId},function (err, wells) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                var createTime=functions.timeFormat((docs[i].createTime) * 1000)
                                var obj={
                                    id:docs[i].id,
                                    wellIdId:req.body.wellIdId,
                                    wellName:wells[0].wellName,
                                    liquidLevel:docs[i].liquidLevel,
                                    waterContent:docs[i].waterContent,
                                    wellPressure:docs[i].wellPressure,
                                    wellTime:docs[i].wellTime,
                                    userName:docs[i].userName,
                                    createTime: createTime
                                }
                                arr.push(obj)
                            }
                            res.json({
                                error:0,
                                data:arr,
                                count:count
                            })
                        }
                    })
                }
            })
        }
    });
});

/*历史记录折线图*/
router.get('/historyChart/:wellId/:field', function (req, res, next) {
    var wellId=req.params.wellId
    var field=req.params.field
    req.models.WellData.find({wellId:wellId},function (err,docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else {
            var wellTime=[],arr=[];
            for (var i = 0; i < docs.length; i++) {
                wellTime = wellTime.concat(functions.timeFormat((docs[i].createTime)*1000))
                arr.push(docs[i])
            }
            var brr = []
            var ids=[]
            for(m in arr){
                ids.push(arr[m].id)
                for (let n in arr[m]) {
                    if(n == field){
                        brr.push(arr[m][n])
                    }
                }
            }
            var sum = 0;
            for(var a in brr){
                sum+=brr[a]
            }
            var average=parseInt(sum/brr.length)
            var data=[wellTime,brr,ids]
            res.status(200).json({
                data:data,
                average:average
            })
        }
    })
});

/*某个站点的录入记录*/
router.get('/record/:page/:wellId', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    var wellId=req.params.wellId
    req.models.WellData.count({wellId:wellId},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.WellData.find({wellId:wellId}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.Well.find({id:wellId},function (err, Well) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                var createTime=functions.timeFormat((docs[i].createTime) * 1000)
                                var obj={
                                    id:docs[i].id,
                                    wellId:req.body.wellId,
                                    wellName:Well[0].wellName,
                                    diagrams:Well[0].diagrams,
                                    oilData:Well[0].oilData,
                                    liquidLevel:docs[i].liquidLevel,
                                    waterContent:docs[i].waterContent,
                                    wellPressure:docs[i].wellPressure,
                                    wellTime:docs[i].wellTime,
                                    userName:docs[i].userName,
                                    createTime: createTime
                                }
                                arr.push(obj)
                            }
                            res.json({
                                error:0,
                                data:arr,
                                count:count
                            })
                        }
                    })
                }
            })
        }
    });
});

/*某个站点的录入记录*/
router.get('/dataRecord/:page/:id', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    var id=req.params.id
    console.log(id)
    req.models.WellData.find({id:id}).run(function (err, docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            var arr=[]
            req.models.Well.find({id:docs[0].wellId},function (err, Well) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var createTime=functions.timeFormat((docs[0].createTime) * 1000)
                    var obj={
                        id:docs[0].id,
                        wellId:req.body.wellId,
                        wellName:Well[0].wellName,
                        diagrams:Well[0].diagrams,
                        oilData:Well[0].oilData,
                        liquidLevel:docs[0].liquidLevel,
                        waterContent:docs[0].waterContent,
                        wellPressure:docs[0].wellPressure,
                        wellTime:docs[0].wellTime,
                        userName:docs[0].userName,
                        createTime: createTime
                    }
                    arr.push(obj)
                    // }
                    console.log(obj)
                    res.json({
                        error:0,
                        data:arr,
                        // count:count
                    })
                }
            })
        }
    })
});
/*修改站点录入数据*/
router.get('/updateWellData/:id', function (req, res, next) {
    var id=req.params.id
    req.models.WellData.find({id:id}).run(function (err, docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            res.json(docs[0])
        }
    })
});

/*修改站点录入记录*/
router.post("/updateWellData/:id",function(req,res){
    var user=req.session.user
    var id=req.params.id
    req.models.WellData.find({id:id}).each(function (data) {
        data.wellId=req.body.wellId;
        data.singleAmount=req.body.singleAmount;
        data.arteryWaterContent=req.body.arteryWaterContent;
        data.pressure=req.body.pressure;
        data.position=req.body.position;
        data.userName=user.username /*'张三'*/;
    }).save( function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            res.status(200).json({
                error:0,
                message:'success',
            });
        }
    })
})
/*修改单井名称*/
router.post("/changeWellName",function(req,res){
    var id=req.body.wellId
    req.models.Well.find({id:id}).each(function (well) {
        well.id=req.body.wellId;
        well.wellName=req.body.wellName;
    }).save( function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            res.status(200).json({
                error:0,
                message:'success',
            });
        }
    })
})

/*添加异常点备注*/
router.post("/addRemark",function(req,res){
    console.log(req.body)
    req.models.Abnormal.find({
        wellDataId:req.body.wellDataId,
        // remark:req.body.remark,
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error10001);
            }else{
                req.models.Abnormal.create({
                    wellDataId:req.body.wellDataId,
                    remark:req.body.remark,
                    createTime:parseInt(Date.now()/1000)                      //创建时间
                }, function (err, docs) {
                    if(err){
                        res.status(200).json(errors.error3);
                    }else{
                        res.status(200).json({
                            error:0,
                            message:'success',
                            data:docs
                        });
                    }
                })
            }
        }
    });
})
module.exports = router;