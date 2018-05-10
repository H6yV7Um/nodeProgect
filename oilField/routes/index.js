var express = require('express');
var router = express.Router();
var config = require('../common/config');
var errors = require("../common/errors");
var md5 = require('md5')
var functions = require('../common/functions');
var session = require("session");

/* 通用 */
router.use(function (req, res, next) {
      var params = {
          title: '中国石油',
          // cdnUrl: config.cdnUrl,
          // keywords: config.keywords,
          // description: config.description,
      };
      req.body._params = params;
    next();
})

/* 首页 */
router.get('/', function (req, res, next) {
    var params = req.body._params;
    req.models.ManageSite.find({},function (err,doc) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            req.models.SiteData.find({},function (err,docs) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    req.models.Site.find({}, function (err, sites) {
                        if (err) {
                            res.status(200).json(errors.error3);
                        } else {
                            var sitearr = []
                            for(var y=0;y<sites.length;y++){
                                var obj = {
                                    siteId:0,
                                    manageId:0,
                                    siteNum:0,
                                }
                                for(var x=0;x<docs.length;x++){
                                    if(sites[y].id == docs[x].siteId){
                                        obj.siteId = sites[y].id
                                        obj.manageId = sites[y].manageId
                                        obj.siteNum += docs[x].position * sites[y].standard
                                    }
                                }
                                if(obj.siteId!=0){
                                    sitearr.push(obj)
                                }
                            }
                            var managearr=[]
                            for(var a=0;a<doc.length;a++){
                                var mObj={
                                    siteId:0,
                                    siteName:'',
                                    siteNum:0,
                                }
                                for(var j=0;j<sitearr.length;j++) {
                                    if (doc[a].id == sitearr[j].manageId) {
                                        mObj.siteId = doc[a].id
                                        mObj.siteName = doc[a].name
                                        mObj.siteNum += sitearr[j].siteNum
                                    }
                                }
                                if(mObj.siteId!=0){
                                    managearr.push(mObj)
                                }
                            }
                            var total = 0
                            for(var i=0;i<managearr.length;i++){
                                total+=managearr[i].siteNum
                                if(managearr[i].siteNum.toString().length>6){
                                    managearr[i].siteNum=(managearr[i].siteNum/10000).toFixed(2)+'万'
                                }
                            }
                            if(total.toString().length>6){
                                total=(total/10000).toFixed(2)+'万'
                            }
                            if(total.toString().length)
                            var renderParams = Object.assign({}, params, {
                                activeArea: 1,
                                total:total,
                                sitearr:JSON.stringify(managearr),
                            });
                            res.render('index', renderParams);
                        }
                    })
                }
            })
        }
    })

});
/* 站点 */
router.get('/site', function (req, res, next) {
    var params = req.body._params;

    req.models.SiteData.find({},function (err,docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            req.models.Site.find({}, function (err, sites) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var sitearr = []
                    for(var y=0;y<sites.length;y++){
                        var obj = {
                            siteId:0,
                            siteName:'',
                            siteNum:0,
                        }
                        for(var x=0;x<docs.length;x++){
                            if(sites[y].id == docs[x].siteId){
                                obj.siteId = sites[y].id
                                obj.siteName = sites[y].siteName
                                obj.siteNum += docs[x].position * sites[y].standard
                            }
                        }
                        if(obj.siteId!=0){
                            sitearr.push(obj)
                        }
                    }
                    sitearr.forEach(function (val,index) {
                        if(val.siteName==''){
                            // console.log(index)
                            sitearr.splice(index, 1)
                        }
                    })
                    var total = 0
                    for(var i=0;i<sitearr.length;i++){
                        total+=sitearr[i].siteNum
                    }
                    var renderParams = Object.assign({}, params, {
                        activeArea: 2,
                        total:total,
                        sitearr:JSON.stringify(sitearr),
                    });
                    res.render('site', renderParams);
                }
            })
        }
    })
});
/* 井组 */
router.get('/wellGroup', function (req, res, next) {
    var params = req.body._params;
    req.models.WellGroupData.find({},function (err,docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            req.models.WellGroup.find({}, function (err, sites) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var sitearr = []
                    for(var y=0;y<sites.length;y++){
                        var obj = {
                            siteId:0,
                            siteName:'',
                            siteNum:0,
                        }
                        for(var x=0;x<docs.length;x++){
                            if(sites[y].id == docs[x].wellGroupId){
                                obj.siteId = sites[y].id
                                obj.siteName = sites[y].wellGroupName
                                obj.siteNum += docs[x].position * sites[y].standard
                            }
                        }
                        sitearr.push(obj)
                    }
                    for(var n=0;n<sitearr.length;n++){
                    for(var m=0;m<sitearr.length;m++){
                        if(sitearr[m].siteName==''){
                            sitearr.splice(m, 1)
                        }
                    }
                    }
                    console.log(sitearr)
                    var total = 0
                    for(var i=0;i<sitearr.length;i++){
                        total+=sitearr[i].siteNum
                    }
                    var renderParams = Object.assign({}, params, {
                        activeArea: 3,
                        total:total,
                        sitearr:JSON.stringify(sitearr),
                    });
                    console.log(renderParams)
                    res.render('wellGroup', renderParams);
                }
            })
        }
    })
});
/* 井 */
router.get('/well', function (req, res, next) {
    var params = req.body._params;
    // req.models.WellGroupData.find({},function (err,docs) {
    //     if (err) {
    //         res.status(200).json(errors.error3);
    //     } else {
            req.models.Well.find({}, function (err, sites) {
                if (err) {
                    res.status(200).json(errors.error3);
                } else {
                    var sitearr = []
                    for(var y=0;y<sites.length;y++){
                        var obj = {
                            siteId:0,
                            siteName:'',
                            siteNum:0,
                        }
                        // for(var x=0;x<docs.length;x++){
                        //     if(sites[y].id == docs[x].wellGroupId){
                                obj.siteId = sites[y].id
                                obj.siteName = sites[y].wellName
                                obj.siteNum = parseInt(sites[y].oilData)
                                // obj.siteNum += docs[x].position * sites[y].standard
                            // }
                        // }
                        sitearr.push(obj)
                    }
                    for(var n=0;n<sitearr.length;n++){
                        for(var m=0;m<sitearr.length;m++){
                            if(sitearr[m].siteName==''){
                                sitearr.splice(m, 1)
                            }
                        }
                    }
                    console.log(sitearr)
                    var total = 0
                    for(var i=0;i<sitearr.length;i++){
                        total+=sitearr[i].siteNum
                    }
                    console.log(total)
                    var renderParams = Object.assign({}, params, {
                        activeArea: 4,
                        total:total,
                        sitearr:JSON.stringify(sitearr),
                    });
                    console.log(renderParams)
                    res.render('well', renderParams);
                }
            })
    //     }
    // })
});
/*获取天气*/
router.get('/weather/:ip',function (req,res) {
    var request = require('request')
    var ip=req.params.ip
    var url = 'http://v.juhe.cn/weather/ip?format=2&key='+'1164ef217caad12d2a5b9657b75ff8de'+'&ip='+ip
    request(url,function(err,resphonse,body){
        var data=JSON.parse(body)
        res.status(200).json(data)
    })
})
/* 点击数据跳转到数据折线图页面 */
router.get('/indexInfo/:siteId',function (req,res) {
    var params = req.body._params;
    var siteId = req.params.siteId;
    console.log(siteId)
    var renderParams = Object.assign({}, params, {siteId:siteId});
    res.render('broken', renderParams);
})
/*首页历史记录折线图*/
router.get('/chart/:siteId/:field', function (req, res, next) {
    console.log('!!!!!!!!!!!!!!!!!!')
    // console.log(req.params)
    var siteId = req.params.siteId
    var field = req.params.field
    // console.log(field)
    req.models.SiteData.find({siteId: siteId}, function (err, docs) {
        if (err) {
            res.status(200).json(errors.error3);
        } else {
            var siteTime = [], arr = [];
            for (var i = 0; i < docs.length; i++) {
                siteTime = siteTime.concat(functions.timeFormat((docs[i].createTime) * 1000))
                arr.push(docs[i])
            }
            var brr = []
            for (m in arr) {
                for (let n in arr[m]) {
                    // console.log(n)
                    if (n == field) {
                        brr.push(arr[m][n])
                    }
                }
            }
            var data = [siteTime, brr]
            // console.log(data)
            // console.log(docs)
            res.status(200).json(data)
        }
    })
})

/*/!* 点击数据跳转到数据折线图页面 *!/
router.get('/linkwellGroup/:wellGroupId',function (req,res) {
    var params = req.body._params;
    var wellGroupId = req.params.wellGroupId;
    // console.log(siteId)
    var renderParams = Object.assign({}, params, {wellGroupId:wellGroupId});
    res.render('wellGroupBroken', renderParams);
})
/!*历史记录折线图*!/
router.get('/wellGroupChart/:wellGroupId/:field', function (req, res, next) {
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
            for(m in arr){
                for (let n in arr[m]) {
                    if(n == field){
                        brr.push(arr[m][n])
                    }
                }
            }
            var data=[wellGroupTime,brr]
            console.log(data)
            res.status(200).json(data)
        }
    })
})*/
/* 点击数据跳转到数据折线图页面 */
router.get('/linkwellGroup/:wellGroupId',function (req,res) {
    var params = req.body._params;
    var wellGroupId = req.params.wellGroupId;
    // console.log(siteId)
    var renderParams = Object.assign({}, params, {wellGroupId:wellGroupId});
    res.render('wellGroupBroken', renderParams);
})
/*历史记录折线图*/
router.get('/wellGroupChart/:wellGroupId/:field', function (req, res, next) {
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
            for(m in arr){
                for (let n in arr[m]) {
                    if(n == field){
                        brr.push(arr[m][n])
                    }
                }
            }
            var data=[wellGroupTime,brr]
            console.log(data)
            res.status(200).json(data)
        }
    })
})
/* 点击数据跳转到数据折线图页面 */
router.get('/linkwell/:wellId',function (req,res) {
    var params = req.body._params;
    var wellId = req.params.wellId;
    // console.log(siteId)
    var renderParams = Object.assign({}, params, {wellId:wellId});
    res.render('wellBroken', renderParams);
})
/*历史记录折线图*/
router.get('/wellChart/:wellId/:field', function (req, res, next) {
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
            for(m in arr){
                for (let n in arr[m]) {
                    if(n == field){
                        brr.push(arr[m][n])
                    }
                }
            }
            var data=[wellTime,brr]
            res.status(200).json(data)
        }
    })
})

module.exports = router;
