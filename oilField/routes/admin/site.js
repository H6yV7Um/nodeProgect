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

/*添加站点*/
router.post("/addSite",function(req,res){
    req.models.Site.find({
        siteName:req.body.siteName,
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error10001);
            }else{
                req.models.Site.create({
                    siteName:req.body.siteName,
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

/*查询用户所管理的站点*/
router.get('/getSite', function (req, res, next) {
    var user=req.session.user
    if(user) {
        req.models.User.find({id: req.session.user.id/*id:1*/}, function (err, docs) {
            if (err) {
                res.status(200).json(errors.error3);
            } else {
                req.models.Site.find({}, function (err, sites) {
                    if (err) {
                        res.status(200).json(errors.error3);
                    } else {
                        var sitearr = []
                        if (docs[0].jurisdiction == '') {
                            for (let i = 0; i < sites.length; i++) {
                                sitearr.push({
                                    type: sites[i].id,
                                    name: sites[i].siteName
                                })
                            }
                        } else {
                            var power = (docs[0].jurisdiction).split("-")
                            for (let i = 0; i < sites.length; i++) {
                                if (power[i] == sites[i].siteName) {
                                    sitearr.push({
                                        type: sites[i].id,
                                        name: sites[i].siteName
                                    })
                                }
                            }
                        }
                        res.json({
                            error: 0,
                            data: sitearr
                        })
                    }
                })
            }
        })
    }else {
        res.json("noData")
    }
});

/*添加站点数据*/
router.post("/addSiteData",function(req,res){
    var user=req.session.user
    req.models.SiteData.create({
        siteId:req.body.siteId,
        throughput:req.body.throughput,
        position:req.body.position,
        oilTransfer:req.body.oilTransfer,
        waterContent:req.body.waterContent,
        liquidAmount:req.body.liquidAmount,
        sprayAmount:req.body.sprayAmount,
        dose:req.body.dose,
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
router.get('/getSiteData/:page', function (req, res, next) {

    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;

    req.models.SiteData.count({},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.SiteData.find({}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.Site.find({},function (err, sites) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                for(var j in sites){
                                    if(docs[i].siteId==sites[j].id){
                                        var json = eval('('+(JSON.stringify(sites[j])+JSON.stringify(docs[i])).replace(/}{/,',')+')');
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
router.get('/history/:page/:siteId', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    var siteId=req.params.siteId
    req.models.SiteData.count({siteId:siteId},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.SiteData.find({siteId:siteId}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.Site.find({id:siteId},function (err, sites) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                var createTime=functions.timeFormat((docs[i].createTime) * 1000)
                                var obj={
                                    id:docs[i].id,
                                    siteId:req.body.siteId,
                                    siteName:sites[0].siteName,
                                    throughput:docs[i].throughput,
                                    position:docs[i].position,
                                    oilTransfer:docs[i].oilTransfer,
                                    waterContent:docs[i].waterContent,
                                    liquidAmount:docs[i].liquidAmount,
                                    sprayAmount:docs[i].sprayAmount,
                                    dose:docs[i].dose,
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
                    // }
                }
            })
        }
    });
});

/*历史记录折线图*/
router.get('/historyChart/:siteId/:field', function (req, res, next) {
    var siteId=req.params.siteId
    var field=req.params.field
    req.models.SiteData.find({siteId:siteId},function (err,docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else {
            var siteTime=[],arr=[];
            for (var i = 0; i < docs.length; i++) {
                siteTime = siteTime.concat(functions.timeFormat((docs[i].createTime)*1000))
                arr.push(docs[i])
            }
            var brr = []
            var ids=[]
            for(var m in arr){
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
            var data=[siteTime,brr,ids]
            res.status(200).json({
                data:data,
                average:average
            })
        }
    })
});

/*某个站点的录入记录*/
router.get('/record/:page/:siteId', function (req, res, next) {
    var page = req.params.page;
    var start = (parseInt(page) - 1) * 10;
    var siteId=req.params.siteId
    req.models.SiteData.count({siteId:siteId},function (err, count) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            req.models.SiteData.find({siteId:siteId}).limit(10).offset(start).order("createTime").run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    req.models.Site.find({id:siteId},function (err, sites) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            for(var i in docs){
                                var createTime=functions.timeFormat((docs[i].createTime) * 1000)
                                var obj={
                                    id:docs[i].id,
                                    siteId:req.body.siteId,
                                    siteName:sites[0].siteName,
                                    standard:sites[0].standard,
                                    throughput:docs[i].throughput,
                                    position:docs[i].position,
                                    oilTransfer:docs[i].oilTransfer,
                                    waterContent:docs[i].waterContent,
                                    liquidAmount:docs[i].liquidAmount,
                                    sprayAmount:docs[i].sprayAmount,
                                    dose:docs[i].dose,
                                    userName:docs[i].userName,
                                    createTime: createTime
                                }
                                arr.push(obj)
                            }
                            console.log(arr)
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
            req.models.SiteData.find({id:id}).run(function (err, docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var arr=[]
                    console.log(docs[0].siteId)
                    req.models.Site.find({id:docs[0].siteId},function (err, sites) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                                var createTime=functions.timeFormat((docs[0].createTime) * 1000)
                                var obj={
                                    id:docs[0].id,
                                    siteId:docs[0].siteId,
                                    siteName:sites[0].siteName,
                                    standard:sites[0].standard,
                                    throughput:docs[0].throughput,
                                    position:docs[0].position,
                                    oilTransfer:docs[0].oilTransfer,
                                    waterContent:docs[0].waterContent,
                                    liquidAmount:docs[0].liquidAmount,
                                    sprayAmount:docs[0].sprayAmount,
                                    dose:docs[0].dose,
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
router.get('/updateSiteData/:id', function (req, res, next) {
    var id=req.params.id
    req.models.SiteData.find({id:id}).run(function (err, docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            res.json(docs[0])
        }
    })
});

/*修改站点录入记录*/
router.post("/updateSiteData/:id",function(req,res){
    var user=req.session.user
    var id=req.params.id
    req.models.SiteData.find({id:id}).each(function (sitedata) {
        sitedata.siteId=req.body.siteId;
        sitedata.throughput=req.body.throughput;
        sitedata.position=req.body.position;
        sitedata.oilTransfer=req.body.oilTransfer;
        sitedata.waterContent=req.body.waterContent;
        sitedata.liquidAmount=req.body.liquidAmount;
        sitedata.sprayAmount=req.body.sprayAmount;
        sitedata.dose=req.body.dose;
        sitedata.userName=user.username /*'张三'*/;
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

/*修改站点名称*/
router.post("/changeSiteName",function(req,res){
    var id=req.body.siteId
    req.models.Site.find({id:id}).each(function (site) {
        site.id=req.body.siteId;
        site.siteName=req.body.siteName;
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
        siteDataId:req.body.siteDataId,
        // remark:req.body.remark,
    }, function (err, docs) {
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error10001);
            }else{
                req.models.Abnormal.create({
                    siteDataId:req.body.siteDataId,
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