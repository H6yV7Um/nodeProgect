var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var orderstatus = require("../common/orderstatus");
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Goods = mongoose.model("Goods");
var Ctype = mongoose.model("Ctype");
var Officeorder = mongoose.model("Officeorder");
var User = mongoose.model("User");
var Finance = mongoose.model("Finance");
var Coffeeshop = mongoose.model("Coffeeshop");

router.get('/tfghg', function (req, res) {
    Finance.find({}, function (err, doce) {
        res.send(doce)
    })
})

/*
 /添加咖啡店商品
 */
router.get("/addcgoods", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Oe', userinfo.arr);
        Ctype.find({}, function (err, ctypes) {
            if (err) {
                res.render("nodata")
            } else {
                res.render("cgoods/addcgoods_mng", {
                    leftNav: leftNav,
                    ctypes: ctypes,
                    userinfo: userinfo.adminuserInfo
                })
            }
        })
    } else {
        res.render('login')
    }


})

/*
 /处理添加商品
 */
router.post("/insertcgoods", function (req, res) {
    console.log(req.body)
    var obj = {
        type: '1',
        createTime: Date.now(),
        monthSaleNum: 0,
        allSaleNum: 0
    }
    var newjson = eval('(' + (JSON.stringify(req.body) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
    newjson.goodsImgs = JSON.parse(req.body.goodsImgs)

    var ad = new Goods(newjson);
    ad.save(function (err, docs) {
        if (err) {
            console.log(err)
            res.render("nodata")
        } else {
            res.redirect("/cgoodsadmin/cgoodslist")
        }
    })
})

/*
 /查询所有商品
 */
router.get("/cgoodslist", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Od', userinfo.arr);
        var pagesize = 7;
        var counturl = "/cgoodsadmin/getcgoods/1/" + pagesize + '/1';
        var dataurl = "/cgoodsadmin/getcgoods/2" + '/' + pagesize;
        res.render('cgoods/cgoodslist_mng', {
            leftNav: leftNav,
            pagesize: pagesize,
            counturl: counturl,
            dataurl: dataurl,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }
})

router.get("/getcgoods/:type/:pagesize/:page", function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch (req.params.type) {
        case '1':
            Goods.count({'type': "1"}).exec(function (err, docs) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                } else {
                    res.status(200).json(docs);
                }
            })
            break;
        case '2':
            Goods.find({'type': "1"}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                } else {
                    console.log(docs);
                    var ids = new Array
                    for (var i = 0; i < docs.length; i++) {
                        ids.push(docs[i].goodsClassId)
                    }
                    Ctype.find({_id: {$in: ids}}, function (err, types) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        } else {
                            var datas = new Array
                            for (var x = 0; x < docs.length; x++) {
                                for (var y = 0; y < types.length; y++) {
                                    if (docs[x].goodsClassId == types[y]._id) {
                                        var obj = {
                                            typeName: types[y].name
                                        }
                                        var json = eval('(' + (JSON.stringify(docs[x]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                                        datas.push(json)
                                    }
                                }
                            }
                            console.log(datas)
                            res.status(200).json(datas);
                        }
                    })

                }
            })
            break;

    }
})
/**
 * 搜索列表
 */
router.get('/searchgoods/:name', function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Od', userinfo.arr);
        var pagesize = 7;
        var goodsName = req.params.name
        var counturl = "/cgoodsadmin/getallga/1/" + goodsName + '/' + pagesize + '/1';
        var dataurl = "/cgoodsadmin/getallga/2/" + goodsName + '/' + pagesize;
        res.render('cgoods/cgoodslist_mng', {
            //administrator:userinfo,
            leftNav: leftNav,
            pagesize: pagesize,
            counturl: counturl,
            dataurl: dataurl,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }

})

router.get("/getallga/:type/:goodsName/:pagesize/:page", function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs = new RegExp(req.params.goodsName);
    console.log(qs)
    var obj = {
        goodsName: qs
    }
    switch (req.params.type) {
        case '1':
            Goods.count(obj).exec(function (err, docs) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                } else {
                    res.status(200).json(docs);
                }
            })
            break;
        case '2':
            Goods.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                } else {
                    var ids = new Array
                    for (var i = 0; i < docs.length; i++) {
                        ids.push(docs[i].goodsClassId)
                    }
                    Ctype.find({_id: {$in: ids}}, function (err, types) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            res.status(200).json(ret1);
                        } else {
                            var datas = new Array
                            for (var x = 0; x < docs.length; x++) {
                                for (var y = 0; y < types.length; y++) {
                                    if (docs[x].goodsClassId == types[y]._id) {
                                        var obj = {
                                            typeName: types[y].name
                                        }
                                        var json = eval('(' + (JSON.stringify(docs[x]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                                        datas.push(json)
                                    }
                                }
                            }
                            console.log(datas)
                            res.status(200).json(datas);
                        }
                    })

                }
            })
            break;

    }
})

/*
 /删除商品
 */
router.post("/delete", function (req, res) {
    Goods.remove({_id: req.body.cgoodsid}, function (err, docs) {
        if (err) {
            res.render("nodata")
        } else {
            res.redirect("/cgoodsadmin/cgoodslist")
        }
    })
})
/*
 /编辑商品
 */
router.get("/cgoodsinfo/:cgoodsid", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('O的', userinfo.arr);
        Goods.find({_id: req.params.cgoodsid}, function (err, docs) {
            if (err) {
                res.render("nodata")
            } else {
                Ctype.find({}, function (err, aa) {
                    if (err) {
                        res.render("nodata")
                    } else {
                        var typeNname
                        for (var i = 0; i < aa.length; i++) {
                            if (docs[0].goodsClassId == aa[i]._id) {
                                typeName = aa[i].name
                            }
                        }
                        res.render("cgoods/cgoodsinfo_mng", {
                            data: docs[0],
                            leftNav: leftNav,
                            bb: aa,
                            typeName: typeName,
                            userinfo: userinfo.adminuserInfo
                        })
                    }
                })
            }
        })
    } else {
        res.render('login')
    }
})
/*
 /更新商品
 */
router.post("/update", function (req, res) {
    var obj = {
        goodsName: req.body.goodsName,           //赛道名称
        typeId: req.body.typeId,
        goodsPic: req.body.goodsPic,
        goodsImgs: JSON.parse(req.body.goodsImgs),
        goodsDescribe: req.body.goodsDescribe,
        price1: req.body.price1,
        price2: req.body.price2,
        price3: req.body.price3,
        useInfo: req.body.useInfo
    }
    Goods.update({_id: req.body.cgoodsid}, obj, function (err, doce) {
        if (err) {
            res.render("nodata")
        } else {
            res.redirect('/cgoodsadmin/cgoodslist');
        }
    })
})

/**
 * 初心咖啡订单
 */
router.get("/cgoodsorder", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Of', userinfo.arr);
        var pagesize = 7;
        var counturl = "/cgoodsadmin/cgoodsorder/1/" + pagesize + '/1';
        var dataurl = "/cgoodsadmin/cgoodsorder/2" + '/' + pagesize;
        Coffeeshop.find({}, function (err, shops) {
            if (err) {
                res.render('nodata')
            } else {
                res.render('cgoods/cgoodsorder_mng', {
                    leftNav: leftNav,
                    pagesize: pagesize,
                    counturl: counturl,
                    dataurl: dataurl,
                    userinfo: userinfo.adminuserInfo,
                    shops: shops
                });
            }
        })

    } else {
        res.render('login')
    }
})

router.get("/cgoodsorder/:type/:pagesize/:page", function (req, res, next) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj = {
            type: '5',
            orderStatus: orderstatus.statusB10001
        }
        console.log(obj)
        switch (req.params.type) {
            case '1':
                Officeorder.count(obj).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Officeorder.find(obj).sort({'createTime': -1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        console.log(docs)
                        var userids = new Array()
                        for (var i = 0; i < docs.length; i++) {
                            userids.push(docs[i].userId)
                        }
                        User.find({_id: {$in: userids}}, function (err, users) {
                            if (err) {
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            } else {
                                var data = new Array()
                                for (var x = 0; x < docs.length; x++) {
                                    for (var y = 0; y < users.length; y++) {
                                        if (docs[x].userId == users[y]._id) {
                                            var obj = {
                                                userName: users[y].nickName,
                                                time: functions.timeFormat(docs[x].createTime)
                                            }
                                            var newjson = eval('(' + (JSON.stringify(docs[x]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
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
    } else {
        res.render('login')
    }

})
/**
 * 消费码搜索
 */
router.get("/searchorder/:data", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Of', userinfo.arr);
        var pagesize = 7;
        var counturl = "/cgoodsadmin/cgoodsorder/1/" + req.params.data + '/' + pagesize + '/1';
        var dataurl = "/cgoodsadmin/cgoodsorder/2/" + req.params.data + '/' + pagesize;
        res.render('cgoods/cgoodsorder_mng', {
            leftNav: leftNav,
            pagesize: pagesize,
            counturl: counturl,
            dataurl: dataurl,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }
})

router.get("/cgoodsorder/:type/:data/:pagesize/:page", function (req, res, next) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var qs = new RegExp(req.params.data);
        var interspaceid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var obj = {
            '$or': [{'consumerCode': qs}, {'userPhone': qs}],
            type: '5',
            orderStatus: orderstatus.statusB10001
        }
        console.log(obj)
        switch (req.params.type) {
            case '1':
                Officeorder.count(obj).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Officeorder.find(obj).sort({'createTime': -1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        console.log(docs)
                        var userids = new Array()
                        for (var i = 0; i < docs.length; i++) {
                            userids.push(docs[i].userId)
                        }
                        User.find({_id: {$in: userids}}, function (err, users) {
                            if (err) {
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            } else {
                                var data = new Array()
                                for (var x = 0; x < docs.length; x++) {
                                    for (var y = 0; y < users.length; y++) {
                                        if (docs[x].userId == users[y]._id) {
                                            var obj = {
                                                userName: users[y].nickName,
                                                time: functions.timeFormat(docs[x].createTime)
                                            }
                                            var newjson = eval('(' + (JSON.stringify(docs[x]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
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
    } else {
        res.render('login')
    }

})

/**
 * 确认收货
 */
router.post("/updateorder", function (req, res) {
    // { shopid: '5947dca824b4225eb715dad1',
    //     orderid: '59479ba840393b0881b3e951',
    //     orderno: 'C14978651239101',
    //     goodsid: '59226894ecfcc161e05d9171' }
    Officeorder.update({_id: req.body.orderid}, {
        'orderStatus': orderstatus.statusU10001,
        'coffeeShopId': req.body.shopid
    }, function (err, docs) {
        if (err) {
            res.render('nodata')
        } else {
            Finance.update({
                orderNo: req.body.orderno,
                goodsId: req.body.goodsid
            }, {'coffeeShopId': req.body.shopid}, function (err, data) {
                if (err) {
                    res.render('nodata')
                } else {
                    res.redirect("/cgoodsadmin/cgoodsorder")
                }
            })

        }
    })
})

/**
 * 初心创咖财务
 */
router.get("/cgoodsfinance", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var data = {
            type: 5
        }
        var leftNav = functions.createLeftNavByCodes('Og', userinfo.arr);
        var pagesize = 7;
        var counturl = "/cgoodsadmin/cgoodsfinance/1/" + JSON.stringify(data) + '/' + pagesize + '/1';
        var dataurl = "/cgoodsadmin/cgoodsfinance/2/" + JSON.stringify(data) + '/' + pagesize;
        Coffeeshop.find({}, function (err, shops) {
            if (err) {
                res.render('nodata')
            } else {
                var shop = {
                    _id: '0',
                    shopName: '请选择分店'
                }
                res.render('cgoods/cgoodsfinance_mng', {
                    leftNav: leftNav,
                    pagesize: pagesize,
                    counturl: counturl,
                    dataurl: dataurl,
                    userinfo: userinfo.adminuserInfo,
                    shop: shop,
                    shops: shops
                });
            }
        })

    } else {
        res.render('login')
    }
})

router.get("/cgoodsfinance/:type/:data/:pagesize/:page", function (req, res, next) {
    console.log(JSON.parse(req.params.data))
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        var newjson = JSON.parse(req.params.data)
        console.log(newjson)
        console.log("1111111111111111111111111111111111111111111111111")
        switch (req.params.type) {
            case '1':
                Finance.count(newjson).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Finance.find(newjson).sort({'createTime': -1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        var userids = new Array()
                        for (var i = 0; i < docs.length; i++) {
                            userids.push(docs[i].userId)
                        }
                        User.find({_id: {$in: userids}}, function (err, users) {
                            if (err) {
                                var ret1 = errors.error3;
                                ret1.data = err;
                                res.status(200).json(ret1);
                            } else {
                                var data = new Array()
                                for (var x = 0; x < docs.length; x++) {
                                    for (var y = 0; y < users.length; y++) {
                                        if (docs[x].userId == users[y]._id) {
                                            var obj = {
                                                userName: users[y].nickName,
                                                time: functions.timeFormat(docs[x].createTime),
                                                money: (docs[x].amount / 100).toFixed(2)
                                            }
                                            switch (docs[x].channel) {
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
                                            var json = eval('(' + (JSON.stringify(docs[x]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                                            data.push(json)
                                        }
                                    }
                                }
                                console.log(data)
                                res.status(200).json(data);
                            }
                        })

                    }
                })
                break;

        }
    } else {
        res.render('login')
    }

})
/**
 * 日期，商品名称搜索
 */
router.get('/goodsnamesearch/:data', function (req, res) {
    //{"starttime":"2017-06-08","enddate":"2017-06-21"}
    var json = JSON.parse(req.params.data)

    var starttime = json.starttime + ' 00:00:00';
    var startdate = Date.parse(new Date(starttime))
    var endtime = json.enddate + ' 00:00:00';
    var enddate = Date.parse(new Date(endtime)) + 24 * 60 * 60 * 1000
    var userinfo = req.session.adminuser;
    var goodsname = json.goodsname
    var qs = new RegExp(goodsname);
    var goodsId
    var obj = {
        goodsName: qs,
        type: '1'
    }
    if (userinfo) {
        Goods.find(obj).exec(function (err, goods) {
            if (err) {
                res.render('nodata')
            } else {
                if(goods.length>0){
                    goodsId = goods[0]._id
                    if(json.starttime==''){
                        var data = {
                            type: 5,
                            goodsId: goodsId
                        }

                    }else {
                        var data = {
                            type: 5,
                            createTime: {'$gt': startdate, '$lt': enddate},
                            goodsId: goodsId
                        }
                    }
                }else {
                    if(json.starttime==''){
                        var data = {}

                    }else {
                        var data = {
                            type: 5,
                            createTime: {'$gt': startdate, '$lt': enddate},
                        }

                    }

                }
          /*      if (json.coffeeShopId == '0') {
                    var data = {
                        type: 5,
                        createTime: {'$gt': startdate, '$lt': enddate},
                        goodsId: goodsId
                    }
                } else {
                    var data = {
                        type: 5,
                        createTime: {'$gt': startdate, '$lt': enddate},
                        coffeeShopId: json.coffeeShopId,
                        goodsId: goodsId
                    }
                }*/
                var leftNav = functions.createLeftNavByCodes('Og', userinfo.arr);
                var pagesize = 7;
                var counturl = "/cgoodsadmin/cgoodsfinance/1/" + JSON.stringify(data) + '/' + pagesize + '/1';
                var dataurl = "/cgoodsadmin/cgoodsfinance/2/" + JSON.stringify(data) + '/' + pagesize;
                Coffeeshop.find({}, function (err, shops) {
                    if (err) {
                        res.render('nodata')
                    } else {
                        if (json.coffeeShopId == '0') {
                            var shop = {
                                _id: '0',
                                shopName: '请选择分店'
                            }
                        } else {
                            for (var i = 0; i < shops.length; i++) {
                                if (shops[i]._id == json.coffeeShopId) {
                                    var shop = shops[i]
                                }
                            }
                        }
                        res.render('cgoods/cgoodsfinance_mng', {
                            leftNav: leftNav,
                            pagesize: pagesize,
                            counturl: counturl,
                            dataurl: dataurl,
                            userinfo: userinfo.adminuserInfo,
                            shops: shops,
                            shop: shop
                        });
                    }
                })

            }
        })
    } else {
        res.render('login')
    }
})

/**
 * 日期搜索
 */
router.get('/datesearch/:data', function (req, res) {
    //{"starttime":"2017-06-08","enddate":"2017-06-21"}
    var json = JSON.parse(req.params.data)
    var starttime = json.starttime + ' 00:00:00';
    var startdate = Date.parse(new Date(starttime))
    var endtime = json.enddate + ' 00:00:00';
    var enddate = Date.parse(new Date(endtime)) + 24 * 60 * 60 * 1000
    var userinfo = req.session.adminuser;
    var goodsname = json.goodsname
    var qs = new RegExp(goodsname);
    var goodsId
    if(goodsname==''){
        var obj = {
            type: '9'
        }

    }   else {
        var obj = {
            goodsName: qs,
            type: '1'
        }
    }
    if (userinfo) {
        Goods.find(obj).exec(function (err, goods) {
            if (err) {
                res.render('nodata')
            } else {

                if(goods.length>0){
                    goodsId = goods[0]._id
                    var data = {
                        type: 5,
                        createTime: {'$gt': startdate, '$lt': enddate},
                        goodsId: goodsId
                    }
                }else {
                    var data = {
                        type: 5,
                        createTime: {'$gt': startdate, '$lt': enddate},
                    }
                }

                var leftNav = functions.createLeftNavByCodes('Og', userinfo.arr);
                var pagesize = 7;
                var counturl = "/cgoodsadmin/cgoodsfinance/1/" + JSON.stringify(data) + '/' + pagesize + '/1';
                var dataurl = "/cgoodsadmin/cgoodsfinance/2/" + JSON.stringify(data) + '/' + pagesize;
                Coffeeshop.find({}, function (err, shops) {
                    if (err) {
                        res.render('nodata')
                    } else {
                        if (json.coffeeShopId == '0') {
                            var shop = {
                                _id: '0',
                                shopName: '请选择分店'
                            }
                        } else {
                            for (var i = 0; i < shops.length; i++) {
                                if (shops[i]._id == json.coffeeShopId) {
                                    var shop = shops[i]
                                }
                            }
                        }
                        res.render('cgoods/cgoodsfinance_mng', {
                            leftNav: leftNav,
                            pagesize: pagesize,
                            counturl: counturl,
                            dataurl: dataurl,
                            userinfo: userinfo.adminuserInfo,
                            shops: shops,
                            shop: shop
                        });
                    }
                })
            }
        })
    } else {
        res.render('login')
    }
})

/**
 * 根据店铺搜索财务
 */
router.get("/searchbyshop/:data", function (req, res) {
    var json = JSON.parse(req.params.data)
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var data = json
        var leftNav = functions.createLeftNavByCodes('Og', userinfo.arr);
        var pagesize = 7;
        var counturl = "/cgoodsadmin/cgoodsfinance/1/" + JSON.stringify(data) + '/' + pagesize + '/1';
        var dataurl = "/cgoodsadmin/cgoodsfinance/2/" + JSON.stringify(data) + '/' + pagesize;
        Coffeeshop.find({}, function (err, shops) {
            if (err) {
                res.render('nodata')
            } else {
                for (var i = 0; i < shops.length; i++) {
                    if (shops[i]._id == json.coffeeShopId) {
                        var shop = shops[i]
                    }
                }
                res.render('cgoods/cgoodsfinance_mng', {
                    leftNav: leftNav,
                    pagesize: pagesize,
                    counturl: counturl,
                    dataurl: dataurl,
                    userinfo: userinfo.adminuserInfo,
                    shops: shops,
                    shop: shop
                });
            }
        })

    } else {
        res.render('login')
    }
})

/**
 * 编辑详情
 */
router.get("/editinfo/:goodsid", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        Goods.findOne({_id: req.params.goodsid}, function (err, goodsinfo) {
            if (err) {
                res.render('nodata')
            } else {
                var leftNav = functions.createLeftNavByCodes('Og', userinfo.arr);
                res.render('cgoods/cgoodsdata_mng', {
                    leftNav: leftNav,
                    userinfo: userinfo.adminuserInfo,
                    data: goodsinfo
                });
            }

        })

    } else {
        res.render('login')
    }
})


/**
 * 更新商品详情
 */
router.post("/updategoodsinfo", function (req, res) {
    // { goodsInfo: '<p><img src="http://oonn7gtrq.bkt.clouddn.com/shop_1492659061000762416.jpg" alt="ad1" style="max-width:100%;"><br></p><p style="text-align: center; "><b><font color="#ff0000" size="6">真好喝呀真好喝</font></b></p><p><br></p>',
    //     goodsid: '58f820e53a0baa736e5a3886' }
    Goods.update({_id: req.body.goodsid}, {'goodsInfo': req.body.goodsInfo}, function (err, docs) {
        if (err) {
            res.render('nodata')
        } else {
            res.redirect("/cgoodsadmin/editinfo/" + req.body.goodsid)
        }
    })
})

/**
 * 分店列表
 */
router.get("/shoplist", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Oh', userinfo.arr);
        var pagesize = 7;
        var counturl = "/cgoodsadmin/getshop/1/" + pagesize + '/1';
        var dataurl = "/cgoodsadmin/getshop/2" + '/' + pagesize;
        res.render('cgoods/shoplist_mng', {
            leftNav: leftNav,
            pagesize: pagesize,
            counturl: counturl,
            dataurl: dataurl,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }
})

router.get("/getshop/:type/:pagesize/:page", function (req, res, next) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch (req.params.type) {
            case '1':
                Coffeeshop.count({}).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        res.status(200).json(docs);
                    }
                })
                break;
            case '2':
                Coffeeshop.find({}).sort({'createTime': -1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
                        var data = new Array()
                        for (var i = 0; i < docs.length; i++) {
                            var obj = {
                                time: functions.timeFormat(docs[i].createTime)
                            }
                            var newjson = eval('(' + (JSON.stringify(docs[i]) + JSON.stringify(obj)).replace(/}{/, ',') + ')');
                            data.push(newjson)
                        }
                        res.status(200).json(data);
                    }
                })
                break;

        }
    } else {
        res.render('login')
    }

})

/**
 * 添加分店
 */
router.get("/addshop", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        var leftNav = functions.createLeftNavByCodes('Oh', userinfo.arr);
        res.render('cgoods/addshop_mng', {
            leftNav: leftNav,
            userinfo: userinfo.adminuserInfo
        });
    } else {
        res.render('login')
    }
})

/**
 * 处理添加分店
 */
router.post("/insertshop", function (req, res) {
    var shop = new Coffeeshop({
        shopName: req.body.shopName,
        createTime: Date.now(),             //发布时间
    })
    shop.save(function (err, docs) {
        if (err) {

            res.render('nodata')
        } else {
            res.redirect("/cgoodsadmin/shoplist")
        }
    })
})

/**
 * 删除分店
 */
router.get("/deleteshop/:shopid", function (req, res) {
    Coffeeshop.remove({_id: req.params.shopid}, function (err, docs) {
        if (err) {
            res.render('nodata')
        } else {
            res.redirect("/cgoodsadmin/shoplist")
        }
    })
})

/**
 * 编辑分店
 */
router.get("/editshop/:shopid", function (req, res) {
    var userinfo = req.session.adminuser;
    if (userinfo) {
        Coffeeshop.find({_id: req.params.shopid}, function (err, docs) {
            if (err) {
                res.render('nodata')
            } else {
                var leftNav = functions.createLeftNavByCodes('Oh', userinfo.arr);
                res.render('cgoods/shopinfo_mng', {
                    leftNav: leftNav,
                    userinfo: userinfo.adminuserInfo,
                    data: docs[0]
                });
            }
        })

    } else {
        res.render('login')
    }
})

/**
 *处理编辑分店
 */
router.post("/updateshop", function (req, res) {
    Coffeeshop.update({_id: req.body.shopid}, {'shopName': req.body.shopName}, function (err, docs) {
        if (err) {
            res.render('nodata')
        } else {
            res.redirect("/cgoodsadmin/shoplist")
        }
    })
})
module.exports = router;