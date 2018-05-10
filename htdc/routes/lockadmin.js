var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Lockrecord = mongoose.model("Lockrecord");
var Lock = mongoose.model("Lock");
var User = mongoose.model("User");

router.get("/test",function(req,res){
    var arr = ['59585aa6f1e5535fad859789','5955f5f750f2cc432a9b59f6']
    Lock.remove({_id:{$in:arr}},function(err,docs){
        res.send(docs)
    })
})

/**
 * 查看开锁记录
 */
router.get("/lockrecord",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Bc', userinfo.arr);
        var pagesize = 7;
        var counturl = "/lockadmin/getlock/1/"+pagesize + '/1';
        var dataurl = "/lockadmin/getlock/2"+ '/' + pagesize;
        res.render('lockadmin/lockadmin_mng',{
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

 router.get("/getlock/:type/:pagesize/:page",function(req,res,next){
     var userinfo = req.session.adminuser;
     if(userinfo) {
         var interspacesid = userinfo.adminuserInfo.interspaceId
         var start = (parseInt(req.params.page)-1)*parseInt(req.params.pagesize);
         switch(req.params.type){
             case '1':
                 Lockrecord.count({interspaceId:interspacesid}).exec(function(err,docs){
                     if(err){
                         var ret1=errors.error3;
                         ret1.data = err;
                         res.status(200).json(ret1);
                     }else{
                         res.status(200).json(docs);
                     }
                 })
                 break;
             case '2':
                 Lockrecord.find({interspaceId:interspacesid}).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
                     if(err){
                         var ret1=errors.error3;
                         ret1.data = err;
                         res.status(200).json(ret1);
                     }else{
                         var userids = new Array()
                         var locks = new Array()
                         for(var i=0;i<docs.length;i++){
                             if(docs[i].userId.indexOf('|')>= 0){

                             }else{
                                 userids.push(docs[i].userId)
                                 locks.push(docs[i].lockMac)
                             }


                         }
                         User.find({_id:{$in:userids}},function(err,server){
                             if(err){
                                 var ret1=errors.error3;
                                 ret1.data = err;
                                 res.status(200).json(ret1);
                             }else{
                                 //591fe1eb4ccbd66f3e96cd6
                                 console.log(server)
                                 Lock.find({mac:{$in:locks}},function(err,lock){
                                     if(err){
                                         console.log(err)
                                         var ret1=errors.error3;
                                         ret1.data = err;
                                         res.status(200).json(ret1);
                                     }else{
                                         var data = new Array()
                                         for(var x=0;x<docs.length;x++){
                                             for(var y=0;y<server.length;y++){
                                                 if(docs[x].userId==server[y]._id){
                                                     var obj = {
                                                         nickName:server[y].nickName,
                                                         linkPhone:server[y].linkPhone,
                                                         time:functions.timeFormat(docs[x].createTime)
                                                     }
                                                     var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                                     data.push(newjson)
                                                 }
                                             }
                                         }
                                         console.log(data)
                                         var redata = new Array()
                                         for(var m=0;m<data.length;m++){
                                             for(var n=0;n<lock.length;n++){
                                                 if(data[m].lockMac == lock[n].mac){
                                                     var json = {
                                                         officeName:lock[n].roomName
                                                     }
                                                     var reljson = eval('('+(JSON.stringify(data[m])+JSON.stringify(json)).replace(/}{/,',')+')');
                                                     redata.push(reljson)
                                                 }
                                             }
                                         }
                                         console.log(redata)
                                         res.status(200).json(redata);
                                     }
                                 })

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
router.get("/alllocks",function (req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Ba', userinfo.arr);
        var pagesize = 7;
        var counturl = "/lockadmin/getall/1/"+pagesize + '/1';
        var dataurl = "/lockadmin/getall/2"+ '/' + pagesize;
        res.render('lockadmin/locklist_mng',{
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
/*
 /查询所有门锁
 */
router.get("/getall/:type/:pagesize/:page",function(req,res,next){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
        switch(req.params.type) {
            case '1':
                Lock.count({interspaceId:interspacesid}).exec(function (err, docs) {
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
                Lock.find({interspaceId:interspacesid}).sort({roomId:1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function (err, docs) {
                    if (err) {
                        var ret1 = errors.error3;
                        ret1.data = err;
                        res.status(200).json(ret1);
                    } else {
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
 * 添加门锁
 */
router.get("/addlock",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Bb', userinfo.arr);
        res.render('lockadmin/lockadd_mng',{
            leftNav:leftNav,
            userinfo: userinfo.adminuserInfo
        });
    }else {
        res.render('login')
    }
})

/**
 * 处理添加门锁
 */
router.post("/insertlock",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        var obj = new Lock({
            interspaceId:interspacesid,
            mac:req.body.mac,           //设备mac地址（唯一）
            lockName:req.body.lockName,     //锁名
            roomId:'',       //房间id
            roomName:'',     //房间编号
            createTime:Date.now(),    //发布时间
        })
        obj.save(function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.redirect('/lockadmin/alllocks')
            }
        })
    }else{
        res.render('login')
    }

})

/**
 * 删除锁
 */
router.post("/deletelock",function(req,res){
    Lock.remove({_id:req.body.lockid},function(err,docs){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/lockadmin/alllocks')
        }
    })
})

/**
 * 查看锁是否已添加
 */
router.post("/checklock",function(req,res){
    Lock.find({mac:req.body.mac},function(err,docs){
        if(err){
            res.status(200).json(errors.error3);
        }else{
            if(docs.length > 0){
                res.status(200).json(errors.error10015);
            }else{
                res.status(200).json(errors.error0);
            }
        }
    })
})


/**
 * 编辑锁
 */
router.get("/editlock/:lockid",function(req,res){
    var userinfo = req.session.adminuser;
    var leftNav = functions.createLeftNavByCodes('Ba', userinfo.arr);
    if(userinfo) {
        var interspacesid = userinfo.adminuserInfo.interspaceId
        Lock.find({_id:req.params.lockid},function(err,docs){
            if(err){
                res.render('nodata')
            }else{
                res.render('lockadmin/lockedit_mng',{
                    leftNav:leftNav,
                    data:docs[0],
                    userinfo: userinfo.adminuserInfo
                });
            }
        })
    }else{
        res.render('login')
    }
})

/**
 * 修改锁mac
 */
router.post("/updatelock",function(req,res){
    Lock.update({_id:req.body.lockid},{mac:req.body.mac},function(err,lock){
        if(err){
            res.render('nodata')
        }else{
            res.redirect('/lockadmin/editlock/'+req.body.lockid)
        }
    })
})
module.exports = router;
