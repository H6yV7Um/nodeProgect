var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var mongoose = require("mongoose");
var Station = mongoose.model("Station");
var state = require("../common/state")
var Office = mongoose.model("Office");
var enterprise = require("../common/enterprise")



/*
 /添加工位
 */
router.get("/addstation",function (req,res) {
    var leftNav = functions.createLeftNavByCode('Nb');
    Office.find({},function (err,offices) {
        res.render("station/addstation_mng",{
            leftNav:leftNav,
            states:state,
            offices:offices,
            enterprises:enterprise
        })
    })




})

/*
 /处理添加商品
 */
router.post("/insertstation",function(req,res){
    console.log(req.body)
    var ad = new Station(req.body);
    ad.save(function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            res.redirect("/stationadmin/stationlist")
        }
    })
})

/*
 /查询所有商品
 */
router.get("/stationlist",function (req,res){
    var leftNav = functions.createLeftNavByCode('Na');
    var pagesize = 3;
    var counturl = "/stationadmin/getstations/1/"+pagesize + '/1';
    var dataurl = "/stationadmin/getstations/2"+ '/' + pagesize;
    res.render('station/stationlist_mng',{

        leftNav:leftNav,
        pagesize : pagesize,
        counturl:counturl,
        dataurl:dataurl
    });


})

router.get("/getstations/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Station.count().exec(function(err,docs){
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
            Station.find().skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
})
/*
 /删除商品
 */
router.get("/delete/:stationid",function (req,res) {
    Station.remove({_id:req.params.stationid},function (err,docs) {
        if(err){
            res.render("nodata")
        }else{
            res.redirect("/stationadmin/stationlist")
        }
    })
})
/*
 /编辑商品
 */
router.get("/stationinfo/:stationid",function(req,res){
    var leftNav = functions.createLeftNavByCode('Nb');
    Office.find({},function (err,offices) {
        if(err){
            res.render("nodata")
        }else {
            Station.find({_id:req.params.stationid},function (err,docs) {
                if(err){
                    res.render("nodata")
                }else {
                    res.render("station/stationinfo_mng",{
                        leftNav:leftNav,
                        ss:state,
                        offices:offices,
                        ee:enterprise,
                        data:docs[0]
                    })
                }
            })

        }
    })

})
/*
 /更新商品
 */
router.post("/update",function (req,res) {
    var obj = {
        officeId:req.body.officeId,                    //办公室id
        price1:req.body.price1,                  //
        price2:req.body.price2,              //
        price3:req.body.price3,            //
        price4:req.body.price4,                   //
        enterpriseId:req.body.enterpriseId,  //入驻企业id
        stateId:req.body.stateId,                //状态
        detail:req.body.detail,   //预约信息
        //createTime:Number,
    }
    Station.update({_id:req.body.stationid},obj,function(err,doce){
        if(err){
            res.render("nodata")
        }else{
            res.redirect('/stationadmin/stationlist');
        }
    })
})

module.exports = router;