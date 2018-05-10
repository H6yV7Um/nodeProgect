var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var md5 = require('md5');
var functions = require("../common/functions");
var config = require("../common/config");
var errors = require("../common/errors");
var Interspace = mongoose.model("Interspace");
var Adminuser = mongoose.model("Adminuser");
var Media = mongoose.model("Media");
var Goods = mongoose.model("Goods");

router.get("/test",function(req,res){
    var fs = require("fs")
   
    fs.open('http://ooy56d8k9.bkt.clouddn.com/shangchao_1497434159000590763.txt', 'r', function (err, fd) {
        if (err) {
            console.error(err);
            return;
        } else {
            res.json({
                data:fd
            })
        }
    })
})


/**
 * 空间列表
 */
router.get('/allinterspace',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=7
        var leftNav = functions.createLeftNavByCodes('Ta', userinfo.arr);
        var counturl = "/interspaceadmin/getinterspace/1/"+pagesize + '/1';
        var dataurl = "/interspaceadmin/getinterspace/2/" + pagesize;
        res.render('interspaceadmin/interspacelist_mng',{
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
 * 查询所有空间
 */
router.get("/getinterspace/:type/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            Interspace.count({}).exec(function(err,docs){
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
            Interspace.find({}).skip(start).sort({createTime:1}).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    res.status(200).json(ret1);
                }else{
                    var datas=new Array
                    for(x in docs){
                        var obj={
                            createTimes:functions.timeFormat(docs[x].createTime*1),
                        }
                        var json = eval('('+(JSON.stringify(docs[x])+JSON.stringify(obj)).replace(/}{/,',')+')');
                        datas.push(json)

                    }
                    res.status(200).json(datas);
                }
            })
            break;

    }
})

/**
 * 初始化
 */
router.get("/initialize/:interspaceid",function(req,res){
    Interspace.update({_id:req.params.interspaceid},{'isInitialize':'1'},function(err,docs){
        if(err){
            res.send('nodata')
        }else{
            functions.initializeInterspace(req.params.interspaceid)
            res.redirect("/interspaceadmin/allinterspace")
        }
    })

})

/**
 * 模糊查询
 */
router.get('/searchinterspace/:interspaceName',function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var pagesize=7
        var leftNav = functions.createLeftNavByCodes('Ta', userinfo.arr);
        var interspaceName=req.params.interspaceName
        var counturl = "/interspaceadmin/getinters/1/"+interspaceName+'/'+pagesize + '/1';
        var dataurl = "/interspaceadmin/getinters/2/"+interspaceName +'/'+ pagesize;
        res.render('interspaceadmin/interspacelist_mng',{
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
 * 搜索所有空间
 */
router.get("/getinters/:type/:interspaceName/:pagesize/:page",function(req,res,next){
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    var qs=new RegExp(req.params.interspaceName);
    var  obj={
        interspaceName:qs
    }
    switch(req.params.type){
        case '1':
            Interspace.count(obj).exec(function(err,docs){
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
            Interspace.find(obj).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,docs){
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
/check
 Adminuser.find({account:account},function (err,docs) {
 if(err){
 res.render('nodata')
 }else {

 }
 })
 */
router.post('/check',function (req,res) {
    var account=req.body.linkPhone
    var interspaceName=req.body.interspaceName
    Interspace.find({interspaceName:interspaceName},function (err,docs) {
        if(err){
            res.render('nodata')
        }else {
            if(docs.length>0){
                res.status(200).json(errors.error60005);
            }else {
                Adminuser.find({account:account},function (err,user) {
                    if(err){
                        res.render('nodata')
                    }else {
                        if(user.length>0){
                            res.status(200).json(errors.error60006);
                        }else {
                            var ret = errors.error0;
                            res.status(200).json(ret);
                        }
                    }
                })
            }
        }
    })

})
/**
 * 添加空间
 */
router.get("/addinterspace",function(req,res){
    var userinfo = req.session.adminuser;
    if(userinfo) {
        var leftNav = functions.createLeftNavByCodes('Tb', userinfo.arr);
        res.render('interspaceadmin/addinterspace_mng', {
            leftNav: leftNav,
            userinfo: userinfo.adminuserInfo
        })

    }else {
        res.render('login')
    }
})
/*
/处理添加空间
 */
router.post("/insertinterspace",function(req,res){
    var account=req.body.linkPhone
    var userName=req.body.linkman
    var interspaceadmin=new Interspace({
        interspaceName:req.body.interspaceName,        //空间名字
        interspaceAddress:req.body.interspaceAddress,     //空间地址
        interspacePic:req.body.interspacePic,          //空间图片
        linkman:userName,               //空间联系人
        linkPhone:account,            //空间联系电话
        isInitialize:'0',
        createTime:Date.now(),
    })
    interspaceadmin.save(function(err,data){
        if(err){
            res.render('nodata')
        }else{
            var salt = functions.createVercode(4);
            var encryptedPw = md5(md5('123456')+salt);
            var interspaceId=data._id
            var adminuser = new Adminuser({
                account:account,     //用户账号（手机号）
                userName:userName,   //用户姓名
                salt:salt,       //盐
                password:encryptedPw,    //密码
                identity:'2',
                createTime:Date.now(),
                interspaceId:interspaceId
            })
            adminuser.save(function(err,data){
                if(err){
                    res.render('nodata')
                }else{
                    if(functions.addGoodsClass(interspaceId)){
                        if(functions.mediatype(interspaceId)){
                            res.redirect("/interspaceadmin/allinterspace")
                        }

                    }else{
                        res.render('nodata')
                    }
                }
            })
        }


    })


})
/*
/删除
 */
router.post("/delete",function(req,res){
    Interspace.remove({_id:req.body.interspaceid},function(err,docs){
        if(err){
            console.log(err)
            res.render("nodata")
        }else{
            Adminuser.remove({account:req.body.account},function (err,doce) {
                if(err){
                    res.render("nodata")
                }else {
                    Goods.remove({interspaceId:req.body.interspaceid},function(err,goods){
                        if(err){
                            res.render("nodata")
                        }else{
                            res.redirect("/interspaceadmin/allinterspace")
                        }
                    })

                }
            })

        }
    })
})
/*
/修改
 */
router.post("/update",function (req,res) {
   //"member":[{"job":"合伙人","name":"张三","pic":"http://oonn7gtrq.bkt.clouddn.com/0.jpg"},{"job":"运营总监","name":"李四","pic":"http://oonn7gtrq.bkt.clouddn.com/n3.jpg"}]
   //res.send(req.body)
    if(req.body.goodsImgs != ''){
        var imags = JSON.parse(req.body.goodsImgs)
    }else{
        var imags = []
    }
    var interspaceimags = JSON.parse(req.body.interspaceimags)

    var member = []
    if(imags.length > 1){
        for(var i=0;i<imags.length;i++){
            var obj = {
                job:req.body.job[i],
                name:req.body.name[i],
                pic:imags[i].pic
            }
            member.push(obj)
        }
    }else{
        for(var i=0;i<imags.length;i++){
            var obj = {
                job:req.body.job,
                name:req.body.name,
                pic:imags[i].pic
            }
            member.push(obj)
        }
    }



    var userinfo = req.session.adminuser;
    if(userinfo) {
        var account = userinfo.adminuserInfo.account
        var obj={
            interspaceName:req.body.interspaceName,        //空间名字
            interspaceAddress:req.body.interspaceAddress,     //空间地址
            interspacePic:interspaceimags,          //空间图片
            linkman:req.body.linkman,               //空间联系人
            linkPhone:req.body.linkPhone,            //空间联系电话
            linkemail:req.body.linkemail,        //联系邮箱
            interspaceInfo:req.body.interspaceInfo,
            interspaceFacility:req.body.spaceCheck,
            member:member,
            content:req.body.content,      //编辑
        }

        if((req.body.url) && (req.body.url != 'undefined')){
            obj.url = req.body.url
        }else{
            obj.url = config.baseUrl+'1.0/service/interspaceinfo/'+req.body.interspaceid
        }
        Interspace.update({_id:req.body.interspaceid},obj,function (err,docs) {
            if(err){
                res.render("nodata")
            }else {
                if(account != req.body.linkPhone){
                    var salt = functions.createVercode(4)
                    var encryptedPw = md5(md5('123456')+salt);
                    Adminuser.update({account:account},{'salt':salt,'password':encryptedPw,'account':req.body.linkPhone},function(err,user){
                        if(err){
                            res.render("nodata")
                        }else{
                            res.redirect("/login/index")
                        }
                    })
                }else{
                    res.redirect("/login/index")
                }

            }
        })

    }else{
        res.render('login')
    }

})

module.exports = router;