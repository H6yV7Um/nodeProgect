var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var Goodsclass = mongoose.model("Goodsclass");
var Interspace = mongoose.model("Interspace");

router.get("/test",function(req,res){
    functions.addGoodsClass('58f196b022e95b77ef30004c')
    res.send('ok')
    // Goodsclass.remove({},function(err,docs){
    //     res.send(docs)
    // })
    // Interspace.find({},function(err,docs){
    //     res.send(docs)
    // })
})
/**
 * 查看商品分类列表
 */
router.get("/allgoodsclass",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid =userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Ca', userinfo.arr);
        Goodsclass.find({interspaceId:interspaceid},function(err,docs){
            res.render("goodsclass/goodsclasslist_mng",{
                leftNav:leftNav,
                data:docs,
                userinfo: userinfo.adminuserInfo
            })
        })
    }else {
        res.render('login')
    }


})

/**
 * 添加分类
 */
router.get("/addgoodsclass",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Cb', userinfo.arr);
        res.render("goodsclass/addgoodsclass_mng",{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        })
    }else {
        res.render('login')
    }
})

/**
 * 处理添加分类
 */
router.post("/insertgoodsclass",function(req,res){
    var userinfo = req.session.adminuser;
    Goodsclass.find({}).sort({'classOrder':-1}).exec(function(err,docs){
        if(docs.length > 0){
            var order = parseInt(docs[0].classOrder + 1)
        }else{
            var order = 1
        }
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var goodsclass = new Goodsclass({
            type:req.body.type,
            interspaceId:interspaceid,
            iscommon:0,
            classOrder:order,
            className:req.body.className,         //分类名字
            createTime:Date.now(),             //时间
        })
        goodsclass.save(function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.redirect("/goodsclass/allgoodsclass")
            }
        })
    })
})
/*\
/编辑分类
 goodsclass/goodsclassinfo_mng"
 */
router.get('/updategoodsclass/:goodsclassid',function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Cb', userinfo.arr);
        Goodsclass.find({_id:req.params.goodsclassid},function(err,docs){
            if(err){
                res.render('nodata')
            }else {
                res.render("goodsclass/goodsclassinfo_mng",{
                    leftNav:leftNav,
                    data:docs[0],
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }
})
/**
 * 删除分类
 */
router.post("/deletegoodsclass",function(req,res){
    Goodsclass.remove({_id:req.body.goodsclassid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/goodsclass/allgoodsclass")
        }
    })
})
module.exports = router;