var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Goods = mongoose.model("Goods");
var Shop = mongoose.model("Shop");
var Goodsclass = mongoose.model("Goodsclass");
var Interspace = mongoose.model("Interspace");



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
    // Goods.remove({},function(err,docs){
    //
    //     res.send(docs)
    // })
    // 59c394e021fa693329302d3c
    // 59bb38b48ce4fd771b257da0
    // 5ac356641e8b3e702a8e5d38
    // 597807db3abf0e3a48127223
    // 5ac353741e8b3e702a8e5cca
    // 5978076737e73936c28e14b0
    Goodsclass.find(/*{_id:'5978076737e73936c28e14b0'},*/{/*className:'保洁打扫'*/},function (err,doc) {
        res.send(doc)
    })
})

/**
 * 商品列表
 */
router.get('/allgoodslist',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ea', userinfo.arr);
        var pagesize = 7;
        var counturl = "/goodsadmin/getallgoods/1/"+'1/'+pagesize + '/1';
        var dataurl = "/goodsadmin/getallgoods/2/"+'1/' + pagesize;
        res.render('goodsadmin/allgoodslist_mng',{
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
router.get("/getallgoods/:type/:subtype/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var interspaceid = userinfo.adminuserInfo.interspaceId;
        switch(req.params.subtype){
            case '1':
                var obj = {
                    goodsType:'1',
                    interspaceId:interspaceid
                }
                break;
            case '2':
                var obj = {
                    goodsType:'2',
                    interspaceId:interspaceid
                }
                break;
        }

        switch(req.params.type){
            case '1':
                Goods.count(obj).exec(function(err,docs){
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
                Goods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    }else{
                        console.log(docs)
                        var datas=new Array
                        var aa=new Array
                        for(x in docs){
                            aa.push(docs[x].goodsClassId)
                        }
                        Goodsclass.find({_id:{$in:aa}},function (err,className) {
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            }else {
                                for(a in docs){
                                    for(b in className){
                                        if(docs[a].goodsClassId==className[b]._id){
                                            var obj={
                                                className:className[b].className
                                            }
                                            var json = eval('('+(JSON.stringify(docs[a])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                            datas.push(json)
                                        }
                                    }
                                }
                                res.status(200).json(datas);

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

/**
 * 添加商品
 */
router.get("/addgoods",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid=userinfo.adminuserInfo.interspaceId
        var leftNav = functions.createLeftNavByCodes('Eb', userinfo.arr);
        Goodsclass.find({interspaceId:interspacesid,type:1},function(err,docs){
            if(err){
                res.send('nodata')
            }else{
                res.render("goodsadmin/addgoods_mng",{
                    interspacesid:interspacesid,
                    leftNav:leftNav,
                    goodsclass:docs,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }
})

/**
 * 处理添加商品
 */
router.post("/insertgoods",function(req,res){
    //goodsInventory:parseInt(req.body.goodsInventory),     //商品库存
   console.log('11111111111111111111')
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId;
        console.log()
        var obj = {
            interspaceId:interspaceid,    //商品所属空间id
            goodsType:req.body.type,   //商品类别1实体性2服务型
            goodsName:req.body.goodsName,    //商品名称
            goodsDescribe:req.body.goodsDescribe,   //商品描述
            goodsInfo:'',       //商品详情
            goodsPic:req.body.goodsPic,        //商品展示图
            goodsImgs:JSON.parse(req.body.goodsImgs),         //商品轮播图
            goodsUnit:req.body.goodsUnit,      //商品单位
            price1:parseFloat(req.body.price1),                  //入驻企业有期权价格
            price2:parseFloat(req.body.price2),              //入驻企业无期权价格
            price3:parseFloat(req.body.price3),            //普通用户价格
            goodsInventory:0,
            goodsClassId:req.body.goodsClassId,//商品分类
            goodsExplain:'',
            createTime:Date.now(),         //商品添加时间
            monthSaleNum:0,            //月销售量
            allSaleNum:0,              //总销售量
        }
        console.log(obj)
        var goods = new Goods(obj)
        goods.save(function(err,docs){
            if(err){
                console.log(err)
                res.render('nodata')
            }else{
                if(req.body.type == '1'){
                    res.redirect("/goodsadmin/allgoodslist")
                }else{
                    res.redirect("/goodsadmin/getservergoods")
                }

            }
        })
    }else{
        res.render('login')
    }

})

/**
 * 编辑商品详情
 */
router.get("/editgoodsinfo/:goodsid",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Eb', userinfo.arr);
        Goods.findOne({_id:req.params.goodsid},'goodsInfo',function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                if(docs.goodsInfo == ''){
                    var content = "无"
                }else{
                    var content = docs.goodsInfo
                }
                res.render("goodsadmin/goodsinfo_mng",{
                    leftNav:leftNav,
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
    Goods.update({_id:req.body.goodsid},{'goodsInfo':req.body.goodsInfo},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect("/goodsadmin/allgoodslist")
        }
    })
})
/*
/编辑商品
 res.render('goodsadmin/updategoods_mng',{
 leftNav:leftNav,
 typeName:name[0].className
 })
 */
router.get('/updategoods/:goodsid',function (req,res) {
    var userinfo = req.session.adminuser;
    if(userinfo) {

        var interspaces=userinfo.adminuserInfo.interspaceId
        Goods.find({_id:req.params.goodsid},function (err,docs) {
            if(err){
                res.render('nodata')
            }else {
                if(docs[0].goodsType == '1'){
                    var leftNav = functions.createLeftNavByCodes('Ea', userinfo.arr);
                    var obj = {
                        interspaceId:interspaces,
                        type:1
                    }
                }else{
                    var leftNav = functions.createLeftNavByCodes('Ec', userinfo.arr);
                    var obj = {
                        interspaceId:interspaces,
                        type:2
                    }
                }

                var classId=docs[0].goodsClassId
                Goodsclass.find({_id:classId},function (err,aa) {
                    if(err){
                        res.render('nodata')
                    }else {
                        var typeName=aa[0].className
                        Goodsclass.find(obj,function(err,bb){
                            if(err){
                                res.send('nodata')
                            }else{
                                res.render("goodsadmin/updategoods_mng",{
                                    interspacesid:interspaces,
                                    leftNav:leftNav,
                                    goodsclass:bb,
                                    data:docs[0],
                                    typeName:typeName,
                                    userinfo: userinfo.adminuserInfo
                                })
                            }
                        })
                    }
                })
            }
        })
    }else {
        res.render('login')
    }

})
/*
/更新商品
 */
router.post('/update',function (req,res) {
    console.log(req.body)
    var obj = {
      //  goodsType:req.body.type,   //商品类别1实体性2服务型
        goodsName:req.body.goodsName,    //商品名称
        goodsDescribe:req.body.goodsDescribe,   //商品描述
        goodsInfo:'',       //商品详情
        goodsPic:req.body.goodsPic,        //商品展示图
        goodsImgs:JSON.parse(req.body.goodsImgs),         //商品轮播图
        goodsUnit:req.body.goodsUnit,      //商品单位
        price1:parseFloat(req.body.price1),                  //入驻企业有期权价格
        price2:parseFloat(req.body.price2),              //入驻企业无期权价格
        price3:parseFloat(req.body.price3),            //普通用户价格
        goodsClassId:req.body.goodsClassId,//商品分类
        goodsExplain:'',
        goodsInventory:0,
        userInfo:req.body.userInfo,
        createTime:Date.now(),         //商品添加时间
        monthSaleNum:0,            //月销售量
        allSaleNum:0,              //总销售量
    }
    console.log('@@@@@@@@@'+req.body.goodsInventory)
    if(req.body.goodstype == '1'){
        if((req.body.goodsInventory != 'undefined') && (typeof(req.body.goodsInventory) != 'undefined')){
            obj.goodsInventory = parseInt(req.body.goodsInventory)
        }

    }
    Goods.update({_id:req.body.goodsid},obj,function(err,doce){
        if(err){
            console.log(err)
            res.render('nodata')
        }else {
            if(req.body.goodstype == '1'){
                res.redirect("/goodsadmin/allgoodslist")
            }else{
                res.redirect("/goodsadmin/getservergoods")
            }

        }
    })
})
/**
 * 查询一个空间的分类
 */
router.get("/getoneinspacegoodsclass/:inspaceid",function(req,res){
    // Goodsclass.find({interspaceId:'58f196b022e95b77ef30004c'},function(err,docs){
    //     res.send(docs)
    // })
    Goodsclass.find({interspaceId:req.params.inspaceid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            res.status(200).json(ret1);
        }else{
            console.log(docs)
            res.status(200).json(docs);
        }
    })
})
/**
 * 删除商品
 */
router.post("/deletegoods",function(req,res){
    Goods.remove({_id:req.body.goodsid},function(err,docs){
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/goodsadmin/allgoodslist")
        }
    })
})

/**
 * 添加服务
 */
router.get("/addservergoods",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ed', userinfo.arr);
        var interspaces=userinfo.adminuserInfo.interspaceId
        Goodsclass.find({interspaceId:interspaces,type:2},function(err,docs){
            if(err){
                res.send('nodata')
            }else{
                res.render("goodsadmin/addservergoods_mng",{
                    leftNav:leftNav,
                    goodsclass:docs,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    }else {
        res.render('login')
    }
})

/**
 * 服务列表
 */
router.get("/getservergoods",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ec', userinfo.arr);
        var pagesize = 7;
        var counturl = "/goodsadmin/getallgoods/1/"+ '2/'+pagesize + '/1';
        var dataurl = "/goodsadmin/getallgoods/2/"+'2/' + pagesize;
        res.render('goodsadmin/allgoodslist_mng',{
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
 * 改变推荐情况
 */
router.get("/recommend/:isrecommend/:goodsid",function(req,res){
    //ad08
    //{ isrecommend: '1', goodsid: '597959297fbead7533e2ad08' }
    console.log(req.params)
    var userinfo = req.session.adminuser;
    if(userinfo) {
        Goods.update({_id:req.params.goodsid},{'isRecommend':parseInt(req.params.isrecommend)},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                console.log(docs)
                res.redirect("/goodsadmin/getservergoods")
            }
        })
    }else {
        res.render('login')
    }
})

/**
 * 商品列表
 */
router.get('/searchgoods/:goodsName',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ea', userinfo.arr);
        var pagesize = 7;
        var goodsname=req.params.goodsName
        var counturl = "/goodsadmin/getallgoods/1/"+'1/'+goodsname+'/'+pagesize + '/1';
        var dataurl = "/goodsadmin/getallgoods/2/"+'1/'+goodsname +'/'+ pagesize;
        res.render('goodsadmin/allgoodslist_mng',{
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
 * 搜索商品
 */
router.get("/getallgoods/:type/:subtype/:goodsname/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs=new RegExp(req.params.goodsname);
    switch(req.params.subtype){
        case '1':
            var obj = {
                goodsType:'1',
                goodsName:qs
            }
            break;
        case '2':
            var obj = {
                goodsType:'2',
                goodsName:qs
            }
            break;
    }
    switch(req.params.type){
        case '1':
            Goods.count(obj).exec(function(err,docs){
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
            console.log(obj)
            Goods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
})
module.exports = router;