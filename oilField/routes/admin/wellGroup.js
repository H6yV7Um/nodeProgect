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

/*添加井组*/
router.post("/addWellGroup",function(req,res){
    req.models.WellGroup.find({
        wellGroupName:req.body.wellGroupName,
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error10001);
            }else{
                req.models.WellGroup.create({
                    wellGroupName:req.body.wellGroupName,
                    standard:req.body.standard,
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

/*查询用户所管理的井组*/
router.get('/getWellGroup', function (req, res, next) {
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^')
    console.log(req.session.user)
    req.models.User.find({/*id:req.session.user.id*/id:1},function(err,docs){
        if(err){
            res.status(200).json(errors.error3);
        }else {
            console.log(docs)
            req.models.WellGroup.find({}, function (err, wellGroups) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var wellGroupArr = []
                    if(docs[0].jurisdiction==''){
                        for (let i = 0; i < wellGroups.length; i++) {
                            wellGroupArr.push({
                                type: wellGroups[i].id,
                                name: wellGroups[i].wellGroupName
                            })
                        }
                    }else{
                        var power=(docs[0].jurisdiction).split("-")
                        for (let i = 0; i < wellGroups.length; i++) {
                            if(power[i]==wellGroups[i].wellGroupName){
                                wellGroupArr.push({
                                    type: wellGroups[i].id,
                                    name: wellGroups[i].wellGroupName
                                })
                            }
                        }
                    }
                    res.json({
                        error: 0,
                        data: wellGroupArr
                    })
                }
            })
        }
    })
});

/*添加站点数据*/
router.post("/addWellGroupData",function(req,res){
    var user=req.session.user
    console.log(req.body)
    req.models.WellGroupData.create({
        wellGroupId:req.body.wellGroupId,
        singleAmount:req.body.singleAmount,
        arteryWaterContent:req.body.arteryWaterContent,
        pressure:req.body.pressure,
        position:req.body.position,
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
router.get('/getWellGroupData/:page', function (req, res, next) {
    console.log('##############')
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;

    req.models.WellGroupData.count({},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.WellGroupData.find({}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.WellGroup.find({},function (err, WellGroup) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                for(var j in WellGroup){
                                    if(docs[i].wellGroupId==WellGroup[j].id){
                                        var json = eval('('+(JSON.stringify(WellGroup[j])+JSON.stringify(docs[i])).replace(/}{/,',')+')');
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
router.get('/history/:page/:wellGroupId', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    // wellGroup
    var wellGroupId=req.params.wellGroupId
    req.models.WellGroupData.count({wellGroupId:wellGroupId},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.WellGroupData.find({wellGroupId:wellGroupId}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.WellGroup.find({id:wellGroupId},function (err, wellGroup) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                var createTime=functions.timeFormat((docs[i].createTime) * 1000)
                                var obj={
                                    id:docs[i].id,
                                    wellGroupIdId:req.body.wellGroupIdId,
                                    wellGroupName:wellGroup[0].wellGroupName,
                                    singleAmount:docs[i].singleAmount,
                                    arteryWaterContent:docs[i].arteryWaterContent,
                                    pressure:docs[i].pressure,
                                    position:docs[i].position,
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
router.get('/historyChart/:wellGroupId/:field', function (req, res, next) {
    var wellGroupId=req.params.wellGroupId
    var field=req.params.field
    req.models.WellGroupData.find({wellGroupId:wellGroupId},function (err,docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else {
            var wellGroupTime=[],arr=[];
            for (var i = 0; i < docs.length; i++) {
                wellGroupTime = wellGroupTime.concat(functions.timeFormat((docs[i].createTime)*1000))
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
            var data=[wellGroupTime,brr,ids]
            res.status(200).json({
                data:data,
                average:average
            })
        }
    })
});

/*某个站点的录入记录*/
router.get('/record/:page/:wellGroupId', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    // wellGroup
    // WellGroup
    var wellGroupId=req.params.wellGroupId
    req.models.WellGroupData.count({wellGroupId:wellGroupId},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.WellGroupData.find({wellGroupId:wellGroupId}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.WellGroup.find({id:wellGroupId},function (err, WellGroup) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                var createTime=functions.timeFormat((docs[i].createTime) * 1000)
                                var obj={
                                    id:docs[i].id,
                                    wellGroupId:req.body.wellGroupId,
                                    wellGroupName:WellGroup[0].wellGroupName,
                                    standard:WellGroup[0].standard,
                                    singleAmount:docs[i].singleAmount,
                                    arteryWaterContent:docs[i].arteryWaterContent,
                                    pressure:docs[i].pressure,
                                    position:docs[i].position,
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
    req.models.WellGroupData.find({id:id}).run(function (err, docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            var arr=[]
            console.log(docs[0].siteId)
            req.models.WellGroup.find({id:docs[0].wellGroupId},function (err, WellGroup) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var createTime=functions.timeFormat((docs[0].createTime) * 1000)
                    var obj={
                        id:docs[0].id,
                        wellGroupId:req.body.wellGroupId,
                        wellGroupName:WellGroup[0].wellGroupName,
                        standard:WellGroup[0].standard,
                        singleAmount:docs[0].singleAmount,
                        arteryWaterContent:docs[0].arteryWaterContent,
                        pressure:docs[0].pressure,
                        position:docs[0].position,
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
router.get('/updateWellGroupData/:id', function (req, res, next) {
    var id=req.params.id
    req.models.WellGroupData.find({id:id}).run(function (err, docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            res.json(docs[0])
        }
    })
});

/*修改站点录入记录*/
router.post("/updateWellGroupData/:id",function(req,res){
    var user=req.session.user
    var id=req.params.id
    req.models.WellGroupData.find({id:id}).each(function (data) {
        data.wellGroupId=req.body.wellGroupId;
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

/*修改井组名称*/
router.post("/changeWellGroupName",function(req,res){
    var id=req.body.wellGroupId
    req.models.WellGroup.find({id:id}).each(function (well) {
        well.id=req.body.wellGroupId;
        well.wellGroupName=req.body.wellGroupName;
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
        wellGroupDataId:req.body.wellGroupDataId,
        // remark:req.body.remark,
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error10001);
            }else{
                req.models.Abnormal.create({
                    wellGroupDataId:req.body.wellGroupDataId,
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