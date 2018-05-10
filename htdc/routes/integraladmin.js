var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var functions = require("../common/functions");
var config = require("../common/config");
var errors = require("../common/errors");
var Integralgoods = mongoose.model("Integralgoods");
var Goods = mongoose.model("Goods");



/**
 *
 */
router.get("/test",function(req,res){
    // var shop = new Shop({
    //     userPhone:'18734881530',      //店铺用户手机号
    //     shopType:1,        //店铺类别
    //     interspaceId:'58f196b022e95b77ef30004c',    //店铺所属空间id
    //     createTime:Date.now(),             //时间
    // })
    // shop.save(function(err,docs){
    //     res.send(docs)
    // })
    Goods.remove({typeId:"58feb1aecda74c149fb74f1e"},function(err,docs){

        res.send(docs)
    })
})

/**
 * 商品列表
 */
router.get('/allgoodslist',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Na', userinfo.arr);
         var pagesize = 7;
        var counturl = "/integraladmin/getallgoods/1/"+pagesize + '/1';
        var dataurl = "/integraladmin/getallgoods/2/" + pagesize;
        res.render('integraladmin/allgoodslist_mng',{
            //administrator:userinfo,
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

/**
 * 查询所有商品
 */
router.get("/getallgoods/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo){
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type){
            case '1':
                Integralgoods.count({interspaceId:interspaceid}).exec(function(err,docs){
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
                Integralgoods.find({interspaceId:interspaceid}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        console.log(docs)
                        res.status(200).json(docs);
                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})
/**
 * 搜索列表
 */
router.get('/searchgoods/:goodsName',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Na', userinfo.arr);
        var pagesize = 7;
        var goodsname=req.params.goodsName
        var counturl = "/integraladmin/getallga/1/"+goodsname+'/'+pagesize + '/1';
        var dataurl = "/integraladmin/getallga/2/"+goodsname +'/'+ pagesize;
        res.render('integraladmin/allgoodslist_mng',{
            //administrator:userinfo,
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

router.get("/getallga/:type/:goodsname/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var qs=new RegExp(req.params.goodsname);
        var obj={
            goodsName:qs,
            interspaceId:interspaceid
        }
        switch(req.params.type){
            case '1':
                Integralgoods.count(obj).exec(function(err,docs){
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
                Integralgoods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        res.status(200).json(docs);
                    }
                })
                break;

        }
    }else{
        res.render('login')
    }

})

/**
 * 添加商品
 */
router.get("/addgoods",function(req,res){
    var userinfo = req.session.adminuser;

    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Nb', userinfo.arr);
        res.render("integraladmin/addgoods_mng",{
            //interspacesid:interspaces,
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
            //goodsclass:docs,
        })
    }else {
        res.render('login')
    }

})

/**
 * 处理添加商品
 */
router.post("/insertgoods",function(req,res){
    //console.log(req.body)
    //goodsInventory:parseInt(req.body.goodsInventory),     //商品库存
    var userinfo = req.session.adminuser;
    var interspaceid = userinfo.adminuserInfo.interspaceId
    var obj = {
        //userId:String,    //商品所有者userid
        interspaceId:interspaceid,    //商品所属空间id
        goodsName:req.body.goodsName,    //商品名称
        goodsDescribe:req.body.goodsDescribe,   //商品描述
        goodsInfo:'',       //商品详情
        goodsPic:req.body.goodsPic,        //商品展示图
        integral:req.body.integral,       //积分数
        createTime:Date.now(),
    }
    var goods = new Integralgoods(obj)
    goods.save(function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/integraladmin/allgoodslist")
        }
    })
})

/**
 * 编辑商品详情
 */
router.get("/editgoodsinfo/:goodsid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Nb', userinfo.arr);
        Integralgoods.findOne({_id:req.params.goodsid},'goodsInfo',function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                if(docs.goodsInfo == ''){
                    var content = "无"
                }else{
                    var content = docs.goodsInfo
                }
                res.render("integraladmin/goodsinfo_mng",{
                    leftNav:leftNav,
                    content:content,
                    data:docs,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }

})

/**
 * 更新商品详情
 */
router.post("/updategoodsinfo",function(req,res){
    // { goodsInfo: '<p><img src="http://oonn7gtrq.bkt.clouddn.com/shop_1492659061000762416.jpg" alt="ad1" style="max-width:100%;"><br></p><p style="text-align: center; "><b><font color="#ff0000" size="6">真好喝呀真好喝</font></b></p><p><br></p>',
    //     goodsid: '58f820e53a0baa736e5a3886' }
    Integralgoods.update({_id:req.body.goodsid},{'goodsInfo':req.body.goodsInfo},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/integraladmin/allgoodslist")
        }
    })
})

/**
 * 编辑商品详情
 */
router.get("/updategoods/:goodsid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Nb', userinfo.arr);
        Integralgoods.find({_id:req.params.goodsid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.render("integraladmin/infogoods_mng",{
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
router.post('/update',function (req,res) {
    var obj = {
        goodsName:req.body.goodsName,    //商品名称
        goodsDescribe:req.body.goodsDescribe,   //商品描述
        goodsPic:req.body.goodsPic,        //商品展示图
        integral:req.body.integral,       //积分数
    }
    Integralgoods.update({_id:req.body.goodsid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/integraladmin/allgoodslist');
        }
    })
})
/**
 * 删除商品
 */
router.post("/deletegoods",function(req,res){
    Integralgoods.remove({_id:req.body.goodsid},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/integraladmin/allgoodslist")
        }
    })
})


module.exports = router;