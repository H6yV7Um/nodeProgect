var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var Advertisement = mongoose.model("Advertisement");

router.get("/test",function(req,res){
    Advertisement.find({},function(err,docs){
        res.send(docs)
    })
})

/**
 * 广告列表
 */
router.get("/advertisementlist",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Da', userinfo.arr);
        Advertisement.find({}, function (err, docs) {
            if (err) {
                res.render("nodata")
            } else {
                var datas=new Array
                var placename
                for(a in docs){
                    if(docs[a].place==1){
                        placename="首页"
                    }else {
                        placename="非首页"
                    }
                    var obj={
                        placename:placename
                    }
                    var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
                    datas.push(json)
                }
                console.log(datas)
                res.render('advertisement/advertisementlist_mng', {
                    leftNav: leftNav,
                    data: datas,
                    userinfo: userinfo.adminuserInfo
                });
            }
        })
    }else {
        res.render('login')
    }


})

/**
 * 查询广告
 */
/*router.get("/getadvertisement",function(req,res){
    // var leftNav = functions.createLeftNavByCode('Da');
    Advertisement.find({_id:req.params.advertisementid},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            // res.render('advertisement/advertisementinfo_mng',{

                //administrator:userinfo,
                // leftNav:leftNav,
                // data : docs[0],
            // });
        }
    })
})*/

/**
 * 添加广告
 */
router.get("/addadvertisement",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Db', userinfo.arr);
        Advertisement.find({}, function (err, docs) {
            if (err) {
                res.render("nodata")
            } else {
                res.render('advertisement/addadvertisement', {
                    leftNav: leftNav,
                    userinfo: userinfo.adminuserInfo
                });
            }
        })
    }else {
        res.render('login')
    }

})
/**
 * 处理添加广告
 */
router.post("/insertadvertisement",function(req,res){
    var obj = {
        createTime:Date.now()
    }
    var json = eval('('+(JSON.stringify(req.body)+JSON.stringify(obj)).replace(/}{/,',')+')');
    var ad = new Advertisement(json);
    ad.save(function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/advertisement/advertisementlist")
        }
    })
})

/**
 * 删除广告
 */
router.post("/deleteadvertisement",function(req,res){
    console.log(req.body)
    Advertisement.remove({_id:req.body.advertisementid},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/advertisement/advertisementlist")
        }
    })
})
/*
* 更新广告
* 
*/
router.post("/updatead",function (req,res) {
    var obj = {
        picUrl:req.body.picUrl,
        data:req.body.data,
    }
    Advertisement.update({_id:req.body.adid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/advertisement/advertisementlist');
        }
    })
})
/**
 * 编辑广告
 */
router.get("/editadvertisement/:advertisementid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Da', userinfo.arr);
        Advertisement.find({_id:req.params.advertisementid}, function (err, docs) {
            if (err) {
                res.render("nodata")
            } else {
                console.log(docs)
                res.render('advertisement/advertisementinfo_mng', {
                    leftNav: leftNav,
                    data: docs[0],
                    userinfo: userinfo.adminuserInfo
                });
            }
        })
    }else {
        res.render('login')
    }
})
module.exports = router;