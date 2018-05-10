var express = require('express');
var router = express.Router();
var functions = require("../common/functions")
var errors = require("../common/errors");
var mongoose = require("mongoose");
var Circle = mongoose.model("Circle");
var User = mongoose.model("User");
var Comment = mongoose.model("Comment");
var Topic = mongoose.model("Topic");
var Topiccomment = mongoose.model("Topiccomment");
var Enterprise = mongoose.model("Enterprise");
var Message = mongoose.model("Message");
var Visit = mongoose.model("Visit");
var redisClient = require("../common/redisClient");
var redisPrefix = require("../common/redisPrefix");


router.param("userid", function (req, res, next, id) {
    let string = req.originalUrl    //   /1.0/users/getuser/123/123/456/789
    let data = string.split("/")   // ["","1.0","users","getuser","123","24124","513251"]
    //判断是否为App接口
    if (data[1] == "1.0") {
        //存储基本信息
        var obj = {
            functionClass: data[2],  // 模块
            functionName: data[3],   // 方法名
            Method: req.method,   // 方法类型
            type: 2,   // 方法类型
            createTime: Date.now(),    //创建时间
            paramsList: [],
        }
        if (req.method == "GET") {
            console.log("成功捕获到包含userId的Get请求")
            obj.paramsList = data.splice(4, data.length - 1)
        } else if (req.method == "PATCH") {
            console.log("成功捕获到包含userId的PATCH请求")
            obj.paramsList = data.splice(4, data.length - 1)
            obj.body = req.body
        }
        //单独存储userId （GET请求在此方法中无法获取到对应到键的params，因此只存储body中含有userid的方法）
        if (req.params.userid != null && req.params.userid != undefined) {
            obj.userId = req.params.userid
        }
        console.log("存储信息结果集:")
        console.log(obj)

        let visit = new Visit(obj)
        visit.save({}, function (err, visit_save) {
            console.log('正在存储')
            console.log(visit)
            if (err) {
                console.log('失败')
                console.log(err)
                next();
            } else {
                console.log('成功')
                next();
            }
        })
    } else {
        next();
    }
});

/**
 * 发布动态或帖子
 */
router.post("/publishcircle",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var circle = new Circle({
        userId:req.body.userid,                   //用户id
        txyId:req.body.txyid,                    //腾讯云id
        interspaceId:req.body.interspaceid,    //店铺所属空间id
        textContent:req.body.textcontent,                 //内容
        imgContent:JSON.parse(req.body.imgcontent),                //图片内容
        type:req.body.type,                     //类别1帖子2动态
        title:req.body.title,                   //标题
        commentNum:0,               //评论数
        goodNum:0,                 //点赞数
        goodUserids:[],
        createTime:Date.now(),             //发布时间
    })
    circle.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 查看大程帮
 */
router.get("/getcircle/:interspaceid/:page/:pagesize/:type/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    switch(req.params.type){
        case '1':
            //最新
            var obj = {
                createTime:-1
            }
            var json = {

            }
            break;
        case '2':
            //热门
            var obj = {
                commentNum:-1
            }
            var json = {

            }
            break;
        case '3':
            //我的
            var obj = {
                createTime:-1
            }
            var json = {
                userId:req.params.userid,
            }
            break;
    }
    Circle.find(json).sort(obj).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            if(docs.length > 0){
                var userids = new Array()
                for(var i=0;i<docs.length;i++){
                    userids.push(docs[i].userId)
                }
                User.find({_id:{$in:userids}},'nickName headimgUrl sex authenticationStatus identity',function(err,userinfo){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res,ret1,req.body._requestId);
                    }else{
                        var data = new Array()
                        for(var x=0;x<userinfo.length;x++){
                            for(var y=0;y<docs.length;y++){
                                if(userinfo[x]._id == docs[y].userId){
                                    var obj = {
                                        nickName:userinfo[x].nickName,
                                        headimgUrl:userinfo[x].headimgUrl,
                                        sex:userinfo[x].sex,
                                        authenticationStatus:userinfo[x].authenticationStatus,
                                        identity:userinfo[x].identity,
                                    }
                                    var json = eval('('+(JSON.stringify(docs[y])+JSON.stringify(obj)).replace(/}{/,',')+')');
                                    data.push(json)
                                }
                            }
                        }
                        var reldata = new Array()
                        for(var j=0;j<data.length;j++){
                            var obj2 = {
                                isgood:0
                            }
                            for(var m=0;m<data[j].goodUserids.length;m++){
                                if(data[j].goodUserids[m] == req.params.userid){
                                    console.log('good good good')
                                    obj2.isgood = 1
                                }
                            }
                            var newjson = eval('('+(JSON.stringify(data[j])+JSON.stringify(obj2)).replace(/}{/,',')+')');
                            reldata.push(newjson)
                        }
                        switch(req.params.type) {
                            case '1':
                                var finaldata = functions.sortByKey(reldata, 'createTime',1)
                                break;
                            case '2':
                                var finaldata = functions.sortByKey(reldata, 'commentNum',1)
                                break;
                            case '3':
                                var finaldata = functions.sortByKey(reldata, 'createTime',1)
                                break;
                        }
                        var ret = errors.error0;
                        ret.data = finaldata;
                        functions.apiReturn(res,ret,req.body._requestId);
                    }
                })
            }else{
                var ret = errors.error0;
                ret.data = [];
                functions.apiReturn(res,ret,req.body._requestId);
            }
        }
    })
})

/**
 * 点赞
 */
router.patch("/goodcircle/:userid",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Circle.update({_id:req.body.circleid},{'$inc':{'goodNum':1},'$addToSet':{'goodUserids':req.params.userid}},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 取消点赞
 */
router.patch("/cancelgood/:userid",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Circle.update({_id:req.body.circleid},{'$inc':{'goodNum':-1},'$pull':{'goodUserids':req.params.userid}},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 添加一级评论接口
 */
router.post("/addcomment",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    //nextComment
    var comment = new Comment({
        type:'1',
        circleId:req.body.circleid,
        circleOwnerId:req.body.circleownerid,
        userId:req.body.userid,                   //用户id
        txyId:req.body.txyid,                    //腾讯云id
        circleContent:req.body.circleContent,
        content:req.body.content,                 //内容
        nextComment:[],
        isread:0,
        createTime:Date.now(),             //评论时间
    })
    comment.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            Circle.update({_id:req.body.circleid},{'$inc':{'commentNum':1}},function(err,docs){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    var ret = errors.error0;
                    ret.data = docs;
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            })

        }
    })
})

/**
 * 添加二级评论
 */
router.post("/addnextcomment",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    console.log(req.body)
    var obj = {
        userId:req.body.userid,
        commentUserId:req.body.commentuserid,
        commentId:req.body.commentid,
        txyid:req.body.txyid,
        firstComment:req.body.firstComment,
        content:req.body.content,
        createTime:Date.now(),
        isread:0,
        type:'2',                   //类型，1一级评论2二级评论
    }
    var nextcomment = new Comment(obj);
    nextcomment.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            Comment.findOne({_id:req.body.commentid},'nextComment',function(err,comment){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    if(comment.nextComment.length < 2){
                        Comment.update({_id:req.body.commentid},{'$addToSet':{'nextComment':obj}},function(err,doc){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                functions.apiReturn(res,ret1,req.body._requestId);
                            }else{
                                var ret = errors.error0;
                                ret.data = docs;
                                functions.apiReturn(res,ret,req.body._requestId);
                            }
                        })
                    }else{
                        var ret = errors.error0;
                        ret.data = docs;
                        functions.apiReturn(res,ret,req.body._requestId);
                    }
                }
            })
        }
    })

})

/**
 * 查看一级评论
 */
router.get("/getcomment/:circleid/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Comment.find({circleId:req.params.circleid,type:'1'}).sort({'createTime':-1}).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            if(docs.length > 0){
                var userids = new Array()
                for(var i=0;i<docs.length;i++){
                    userids.push(docs[i].userId)
                    for(var j=0;j<docs[i].nextComment.length;j++){
                        userids.push(docs[i].nextComment[j].userId)
                    }
                }
                User.find({_id:{$in:userids}},'nickName headimgUrl',function(err,usersinfo){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res,ret1,req.body._requestId);
                    }else{
                        var data = new Array()
                        for(var x=0;x<docs.length;x++){
                            for(var y=0;y<usersinfo.length;y++){
                                //console.log(docs[x].userId+'---'+usersinfo[y]._id)
                                if(docs[x].userId == usersinfo[y]._id){

                                    var json = {
                                        nickName:usersinfo[y].nickName,
                                        headimgUrl:usersinfo[y].headimgUrl
                                    }
                                    var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(json)).replace(/}{/,',')+')');
                                    data.push(newjson)
                                }
                            }
                        }
                        var reldata = new Array()
                        for(var x=0;x<data.length;x++){
                            var nextcomment = new Array()
                            for(var m=0;m<docs[x].nextComment.length;m++){
                                for(var y=0;y<usersinfo.length;y++) {
                                    if(docs[x].nextComment[m].userId == usersinfo[y]._id){
                                        var json = {
                                            nickName:usersinfo[y].nickName,
                                            headimgUrl:usersinfo[y].headimgUrl
                                        }
                                        var newjson = eval('('+(JSON.stringify(docs[x].nextComment[m])+JSON.stringify(json)).replace(/}{/,',')+')');
                                        nextcomment.push(newjson)
                                    }
                                }
                            }
                            var nextcommentobj = {
                                nextcomment:nextcomment
                            }
                            var newjson = eval('('+(JSON.stringify(data[x])+JSON.stringify(nextcommentobj)).replace(/}{/,',')+')');
                            reldata.push(newjson)
                        }
                        var ret = errors.error0;
                        ret.data = reldata;
                        functions.apiReturn(res,ret,req.body._requestId);
                    }
                })
            }else{
                var ret = errors.error0;
                ret.data = [];
                functions.apiReturn(res,ret,req.body._requestId);
            }

        }
    })
})

/**
 * 查看一个评论的所有二级评论
 */
router.get("/getnextcomment/:commentid/:page/:pagesize/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Comment.find({commentId:req.params.commentid}).skip(start).limit(req.params.pagesize*1).exec(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            if(docs.length > 0){
                var userids = new Array()
                for(var i=0;i<docs.length;i++) {
                    userids.push(docs[i].userId)
                }
                User.find({_id:{$in:userids}},'nickName headimgUrl',function(err,usersinfo){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res,ret1,req.body._requestId);
                    }else{
                        var data = new Array()
                        for(var x=0;x<docs.length;x++){
                            for(var y=0;y<usersinfo.length;y++){
                                if(usersinfo[y]._id == docs[x].userId){
                                    var json = {
                                        nickName:usersinfo[y].nickName,
                                        headimgUrl:usersinfo[y].headimgUrl
                                    }
                                    var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(json)).replace(/}{/,',')+')');
                                    data.push(newjson)
                                }
                            }
                        }
                        var ret = errors.error0;
                        ret.data = data;
                        functions.apiReturn(res,ret,req.body._requestId);
                    }
                })
            }else{
                var ret = errors.error0;
                ret.data = [];
                functions.apiReturn(res,ret,req.body._requestId);
            }

        }
    })
})

/**
 * 删除动态
 */
router.delete("/deletecircle",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.query._requestId);
    }
},function (req, res, next) {
    Circle.remove({_id:req.query.circleid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.query._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs.result;
            functions.apiReturn(res,ret,req.query._requestId);
        }
    })
})

/**
 * 查看未读消息
 */
router.get("/getnoreadcomment/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.query._requestId);
    }
},function (req, res, next) {
    Comment.find({"$or" :  [ {'circleOwnerId':req.params.userid} , {'commentUserId':req.params.userid} ],isread:0},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.query._requestId);
        }else{
            console.log(docs)
            if(docs.length > 0){
                var ret = errors.error0;
                ret.data = {
                    isread:1
                };
                functions.apiReturn(res,ret,req.query._requestId);
            }else{
                var ret = errors.error0;
                ret.data = {
                    isread:0
                };
                functions.apiReturn(res,ret,req.query._requestId);
            }
        }
    })

})

/**
 * 查看未读回复消息
 */
router.get("/getcommentinfo/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Comment.find({"$or" :  [ {'circleOwnerId':req.params.userid} , {'commentUserId':req.params.userid} ] ,isread:0},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.query._requestId);
        }else{
            var userids = new Array()
            for(var i=0;i<docs.length;i++){
                userids.push(docs[i].userId)
            }
            User.find({_id:{$in:userids}},'nickName headimgUrl',function(err,usersinfo) {
                if (err) {
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res, ret1, req.body._requestId);
                } else {
                    var data = new Array()
                    for (var x = 0; x < docs.length; x++) {
                        for (var y = 0; y < usersinfo.length; y++) {
                            if (usersinfo[y]._id == docs[x].userId) {
                                var json = {
                                    nickName:usersinfo[y].nickName,
                                    headimgUrl:usersinfo[y].headimgUrl
                                }
                                var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(json)).replace(/}{/,',')+')');
                                data.push(newjson)
                            }
                        }
                    }
                    for(var j=0;j<docs.length;j++){
                        Comment.update({_id:docs[j]._id},{'isread':1},function(err,docs){

                        })
                    }
                    var ret = errors.error0;
                    ret.data = data;
                    functions.apiReturn(res,ret,req.query._requestId);

                }
            })

        }
    })
})

//Topic
/**
 * 创建话题
 */
router.post("/createtopic",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Topic.find({title:req.body.title},function(err,topic){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            if(topic.length > 0){
                functions.apiReturn(res,errors.error1,req.body._requestId);
            }else{
                next()
            }
        }
    })
},function (req, res, next) {
    if(req.body.img){
        var img = JSON.parse(req.body.img)
    }else{
        var img =[]
    }
    var json = new Topic({
        interspaceId:req.body.interspaceid,
        userId:req.body.userid,
        title:req.body.title,    //标题
        topicInfo:req.body.topicinfo,   //话题简介
        isSource:1,
        imgArr:img,        //图片
        isDelete:0,
        member:[req.body.userid],     // 成员
    })
    json.save(function(err,topic){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = topic;
            functions.apiReturn(res,ret,req.query._requestId);
        }
    })
})


/**
 * 发布话题
 */
router.post("/addtopic",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    if(req.body.img){
        var img = JSON.parse(req.body.img)
    }else{
        var img =[]
    }
    var json = new Topic({
        interspaceId:req.body.interspaceid,
        userId:req.body.userid,
        topicId:req.body.topicid,
        title:req.body.title,    //标题
        topicInfo:req.body.topicinfo,   //话题简介
        isSource:0,
        imgArr:img,        //图片
        goodUserids:[]
    })
    json.save(function(err,topic){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            Topic.update({_id:req.topicid},{$addToSet:{member:req.body.userid},$inc:{topicNum:1}},function(err,updatetopic){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    var ret = errors.error0;
                    ret.data = topic;
                    functions.apiReturn(res,ret,req.query._requestId);
                }
            })
        }
    })
})

/**
 * 社群列表
 */
router.get("/topiclist/:page/:pagesize/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Topic.find({isSource:1,isDelete:0}).sort({createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,topics){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var data = []
            var async = require('async')
            async.each(topics, function(topic, callback) {
                var userids = topic.member
                User.find({_id:{$in:userids}},function(err,users){
                    if(err){
                        callback(err)
                    }else{
                        var headimgs = []
                        for(var i=0;i<users.length;i++){
                            headimgs.push(users[i].headimgUrl)
                        }
                        var obj = {
                            headimgUrls:headimgs
                        }
                        var json = eval('('+(JSON.stringify(topic)+JSON.stringify(obj)).replace(/}{/,',')+')');
                        data.push(json)
                        callback(null)
                    }
                })
            }, function(err) {
                //所有的异步成功执行完成，err等于null
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    console.log(functions.sortByKey(data,'createTime',1))
                    var ret = errors.error0;
                    ret.data = functions.sortByKey(data,'createTime',1);
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            });
        }
    })
})

/**
 * 一个话题的所有内容
 */
router.get("/topicinfo/:page/:pagesize/:topicid/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Topic.find({$or:[{_id:req.params.topicid},{topicId:req.params.topicid}]}).sort({isSource:-1,createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,topics){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var userids = []
            var enterpriseids = []   //入驻企业id
            for(var i=0;i<topics.length;i++){
                userids.push(topics[i].userId)
            }
            User.find({_id:{$in:userids}},function(err,users){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    for (var j=0;j<users.length;j++){
                        if((users[j].enterpriseId) && (users[j].enterpriseId != '')){
                            enterpriseids.push(users[j].enterpriseId)
                        }

                    }
                    //发布者的企业
                    Enterprise.find({_id:{$in:enterpriseids}},function(err,prises){
                        if(err){
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res,ret1,req.params._requestId);
                        }else{
                            var userinfo = []
                            for(var x=0;x<users.length;x++){
                                var obj = {
                                    userid:users[x]._id,
                                    nickName:users[x].nickName,              //姓名
                                    headimgUrl:users[x].headimgUrl,            //头像
                                    sex:users[x].sex,                   //性别
                                    enterpriseName:'',
                                }
                                for(var y=0;y<prises.length;y++){
                                    if(users[x].enterpriseId == prises[y]._id){
                                        obj.enterpriseName = prises[y].priseName
                                    }
                                }
                                userinfo.push(obj)
                            }
                            var result = []
                            for(var m=0;m<topics.length;m++){
                                for(var n=0;n<userinfo.length;n++){
                                    if(userinfo[n].userid == topics[m].userId){
                                        var json = eval('('+(JSON.stringify(topics[m])+JSON.stringify(userinfo[n])).replace(/}{/,',')+')');
                                        result.push(json)
                                    }
                                }
                            }
                            var resultdata = []
                            //判断是否点赞
                            for(var a=0;a<result.length;a++){
                                var isgoodobj = {
                                    isgood:0
                                }
                                for(var b=0;b<result[a].goodUserids.length;b++){
                                    if(result[a].goodUserids[b] == req.params.userid){
                                        isgoodobj.isgood = 1
                                        break;
                                    }
                                }
                                var newjson = eval('('+(JSON.stringify(result[a])+JSON.stringify(isgoodobj)).replace(/}{/,',')+')');
                                resultdata.push(newjson)
                            }

                            var ret = errors.error0;
                            ret.data = resultdata;
                            functions.apiReturn(res,ret,req.body._requestId);
                        }
                    })
                }
            })
        }
    })
})

/**
 * 成员列表
 */
router.get("/topicmember/:topicid/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Topic.findOne({_id:req.params.topicid},function(err,topic){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var isMember = 0
            for(var i=0;i<topic.member.length;i++){
                if(topic.member[i] == req.params.userid){
                    isMember = 1
                    break;
                }
            }
            User.find({_id:{$in:topic.member}},function(err,users){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    var enterpriseids = []
                    for (var j=0;j<users.length;j++){
                        if((users[j].enterpriseId) && (users[j].enterpriseId != '')){
                            enterpriseids.push(users[j].enterpriseId)
                        }

                    }
                    Enterprise.find({_id:{$in:enterpriseids}},function(err,prises) {
                        if (err) {
                            var ret1 = errors.error3;
                            ret1.data = err;
                            functions.apiReturn(res, ret1, req.params._requestId);
                        } else {
                            var userinfo = []
                            for (var x = 0; x < users.length; x++) {
                                var obj = {
                                    userid: users[x]._id,
                                    nickName: users[x].nickName,              //姓名
                                    headimgUrl: users[x].headimgUrl,            //头像
                                    sex: users[x].sex,                   //性别
                                    enterpriseName: ''
                                }
                                for (var y = 0; y < prises.length; y++) {
                                    if (users[x].enterpriseId == prises[y]._id) {
                                        obj.enterpriseName = prises[y].priseName
                                    }
                                }
                                userinfo.push(obj)
                            }
                            var ret = errors.error0;
                            ret.data = {
                                isMember:isMember,
                                result :userinfo
                            };
                            functions.apiReturn(res,ret,req.body._requestId);
                        }
                    })
                }
            })
        }
    })
})

/**
 * 加入话题成员
 */
router.post("/addtopicmember",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Topic.update({_id:req.body.topicid},{$addToSet:{member:req.body.userid}},function(err,topic){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res, ret1, req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = topic;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 话题一级评论
 */
router.post("/topiccomment",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    var comment = new Topiccomment({
        topicId:req.body.topicid,               //话题id
        topicOwnerId:req.body.topicuserid,         //发布帖子人userid
        type:1,                   //类型，1一级评论2二级评论
        userId:req.body.userid,                   //用户id
        txyId:req.body.txyid,                    //腾讯云id
        content:req.body.comment,                 //内容
        isread:0,                //1已读0未读
        createTime:Date.now(),             //评论时间
    })
    comment.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            Topic.update({_id:req.body.topicid},{'$inc':{'commentNum':1}},function(err,data){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    var ret = errors.error0;
                    ret.data = docs;
                    functions.apiReturn(res,ret,req.body._requestId);
                }
            })

        }
    })
})

/**
 * 点赞
 */
router.post("/addgood",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    // goodNum:{type:Number,default:0},   //点赞数
    // goodUserids:Array,     //点赞
    Topic.update({_id:req.body.topicid},{$inc:{'goodNum':1},$addToSet:{goodUserids:req.body.userid}},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 话题二级评论
 */
router.post("/addsecondcomment",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    console.log(req.body)
    var obj = {
        topicId:req.body.topicid,               //话题id
        topicOwnerId:req.body.topicuserid,         //发布帖子人userid
        topicUserId:req.body.firstcommentuserid,         //发布一级评论的userid
        commentId:req.body.firstcommentid,             //一级评论的id
        type:2,                   //类型，1一级评论2二级评论
        userId:req.body.userid,                   //用户id
        txyId:req.body.txyid,                    //腾讯云id
        content:req.body.comment,                 //内容
        isread:0,                //1已读0未读
        createTime:Date.now(),             //评论时间
    }
    var nextcomment = new Topiccomment(obj);
    nextcomment.save(function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            Topiccomment.findOne({_id:req.body.firstcommentid},'nextComment',function(err,comment){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.body._requestId);
                }else{
                    console.log(comment)
                    if(comment.nextComment.length < 2){
                        Topiccomment.update({_id:req.body.firstcommentid},{'$addToSet':{'nextComment':obj}},function(err,doc){
                            if(err){
                                var ret1 = errors.error3;
                                ret1.data = err;
                                functions.apiReturn(res,ret1,req.body._requestId);
                            }else{
                                var ret = errors.error0;
                                ret.data = docs;
                                functions.apiReturn(res,ret,req.body._requestId);
                            }
                        })
                    }else{
                        var ret = errors.error0;
                        ret.data = docs;
                        functions.apiReturn(res,ret,req.body._requestId);
                    }
                }
            })
        }
    })

})

/**
 * 资讯列表
 */
router.get("/messagelist/:page/:pagesize/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    var start = (parseInt(req.params.page) - 1) * parseInt(req.params.pagesize);
    Message.find({}).sort({createTime:-1}).skip(start).limit(parseInt(req.params.pagesize)).exec(function(err,message){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var ret = errors.error0;
            ret.data = message;
            functions.apiReturn(res,ret,req.params._requestId);
        }
    })
})

/**
 * 查看话题的一级评论
 */
router.get("/topicfirstcomment/:topicid/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Topiccomment.find({topicId:req.params.topicid,type:'1'},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            if(docs.length > 0){
                var userids = new Array()
                for(var i=0;i<docs.length;i++){
                    userids.push(docs[i].userId)
                    for(var j=0;j<docs[i].nextComment.length;j++){
                        userids.push(docs[i].nextComment[j].userId)
                    }
                }
                User.find({_id:{$in:userids}},'nickName headimgUrl',function(err,usersinfo){
                    if(err){
                        var ret1 = errors.error3;
                        ret1.data = err;
                        functions.apiReturn(res,ret1,req.body._requestId);
                    }else{
                        var data = new Array()
                        for(var x=0;x<docs.length;x++){
                            for(var y=0;y<usersinfo.length;y++){
                                //console.log(docs[x].userId+'---'+usersinfo[y]._id)
                                if(docs[x].userId == usersinfo[y]._id){

                                    var json = {
                                        nickName:usersinfo[y].nickName,
                                        headimgUrl:usersinfo[y].headimgUrl
                                    }
                                    var newjson = eval('('+(JSON.stringify(docs[x])+JSON.stringify(json)).replace(/}{/,',')+')');
                                    data.push(newjson)
                                }
                            }
                        }
                        var reldata = new Array()
                        for(var x=0;x<data.length;x++){
                            var nextcomment = new Array()
                            for(var m=0;m<docs[x].nextComment.length;m++){
                                for(var y=0;y<usersinfo.length;y++) {
                                    if(docs[x].nextComment[m].userId == usersinfo[y]._id){
                                        var json = {
                                            nickName:usersinfo[y].nickName,
                                            headimgUrl:usersinfo[y].headimgUrl
                                        }
                                        var newjson = eval('('+(JSON.stringify(docs[x].nextComment[m])+JSON.stringify(json)).replace(/}{/,',')+')');
                                        nextcomment.push(newjson)
                                    }
                                }
                            }
                            var nextcommentobj = {
                                nextcomment:nextcomment
                            }
                            var newjson = eval('('+(JSON.stringify(data[x])+JSON.stringify(nextcommentobj)).replace(/}{/,',')+')');
                            reldata.push(newjson)
                        }
                        var ret = errors.error0;
                        ret.data = reldata;
                        functions.apiReturn(res,ret,req.body._requestId);
                    }
                })
            }else{
                var ret = errors.error0;
                ret.data = [];
                functions.apiReturn(res,ret,req.body._requestId);
            }

        }
    })
})

/**
 * 查看话题的二级评论
 */
router.get("/topicsecondcomment/:firstcommentid/:userid/:sign",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Topiccomment.find({commentId:req.params.firstcommentid},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.params._requestId);
        }else{
            var userids = []
            var comment = []
            for(var i=0;i<docs.length;i++){
                userids.push(docs[i].userId)
                var obj = {
                    nickName:'',
                    headImgUrl:''
                }
                var json = eval('('+(JSON.stringify(docs[i])+JSON.stringify(obj)).replace(/}{/,',')+')');
                comment.push(json)
            }
            User.find({_id:{$in:userids}},function(err,users){
                if(err){
                    var ret1 = errors.error3;
                    ret1.data = err;
                    functions.apiReturn(res,ret1,req.params._requestId);
                }else{
                    for(var x=0;x<comment.length;x++){
                        for(var y=0;y<users.length;y++){
                            if(comment[x].userId == users[y]._id){
                                comment[x].nickName = users[y].nickName
                                comment[x].headImgUrl = users[y].headimgUrl
                            }
                        }
                    }
                    var ret = errors.error0;
                    ret.data = comment;
                    functions.apiReturn(res,ret,req.params._requestId);
                }
            })
        }
    })
})

/**
 * 取消点赞
 */
router.post("/canclegood",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.params._requestId);
    }
},function (req, res, next) {
    Topic.update({_id:req.body.topicid},{$inc:{'goodNum':-1},$pull:{goodUserids:req.body.userid}},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 成员退出社群
 */
router.post("/memberquit",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    Topic.update({_id:req.body.topicid},{$pull:{member:req.body.userid}},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

/**
 * 解散群
 */
router.post("/deletetopic",functions.recordRequest,function(req,res,next){
    if (functions.signCheck(req,res)){
        next();
    }else{
        functions.apiReturn(res,errors.error1,req.body._requestId);
    }
},function (req, res, next) {
    
    console.log(req.body.topicid)
    Topic.update({_id:req.body.topicid},{isDelete:1},function(err,docs){
        if(err){
            var ret1 = errors.error3;
            ret1.data = err;
            functions.apiReturn(res,ret1,req.body._requestId);
        }else{
            console.log(docs)
            var ret = errors.error0;
            ret.data = docs;
            functions.apiReturn(res,ret,req.body._requestId);
        }
    })
})

var daytm = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
var daytime = [daytm]
for(var i=1;i<8;i++){
    var tm = daytm - i*24*60*60*1000;
    daytime.push(tm)
}
var weektime = [daytm]
for(var i=1;i<8;i++){
    var tm = daytm - i*7*24*60*60*1000;
    weektime.push(tm)
}
var monthtm = daytm - 30*24*60*60*1000
var monthtime = [daytm]
for(var i=1;i<8;i++){
    var tm = daytm - i*30*24*60*60*1000;
    monthtime.push(tm)
}
router.get("/dsfgr",function(req,res){
    Visit.find({},function(err,visit){
        if(err){
            res.render('nodata')
        }else{
            var dayvisit = []
            var weekvisit = []
            var monthvisit = []

            for(var x=0;x<daytime.length;x++){
                var dayobj = {
                    users:0,
                    service:0,
                    appindex:0,
                    circle:0,
                    time: functions.timeFormat(daytime[x])
                }


                for(var j=0;j<visit.length;j++){
                    if((visit[j].createTime < daytime[x]) && (visit[j].createTime > (daytime[x]-24*60*60*1000))){
                        if(visit[j].functionClass == 'users'){
                            dayobj.users += 1
                        }else if(visit[j].functionClass == 'appindex'){
                            dayobj.appindex += 1
                        }else if(visit[j].functionClass == 'service'){
                            dayobj.service += 1
                        }else if(visit[j].functionClass == 'circle'){
                            dayobj.circle += 1

                        }
                    }
                }
                dayvisit.push(dayobj)

            }
            for(var x=0;x<weektime.length;x++){
                var weekobj = {
                    users:0,
                    service:0,
                    appindex:0,
                    circle:0,
                    time: functions.timeFormat(daytime[x])

                }
                for(var j=0;j<visit.length;j++){
                    if((visit[j].createTime < weektime[x]) && (visit[j].createTime > (weektime[x]-7*24*60*60*1000))){
                        if(visit[j].functionClass == 'users'){
                            weekobj.users += 1
                        }else if(visit[j].functionClass == 'appindex'){
                            weekobj.appindex += 1
                        }else if(visit[j].functionClass == 'service'){
                            weekobj.service += 1
                        }else if(visit[j].functionClass == 'circle'){
                            weekobj.circle += 1

                        }
                    }
                }
                weekvisit.push(weekobj)
            }

            for(var x=0;x<monthtime.length;x++){
                var monthobj = {
                    users:0,
                    service:0,
                    appindex:0,
                    circle:0,
                    time: functions.timeFormat(daytime[x])

                }
                for(var j=0;j<visit.length;j++){

                    if((visit[j].createTime < monthtime[x]) && (visit[j].createTime > (monthtime[x]-30*24*60*60*1000))){
                        if(visit[j].functionClass == 'users'){
                            monthobj.users += 1
                        }else if(visit[j].functionClass == 'appindex'){
                            monthobj.appindex += 1
                        }else if(visit[j].functionClass == 'service'){
                            monthobj.service += 1
                        }else if(visit[j].functionClass == 'circle'){
                            monthobj.circle += 1

                        }
                    }
                }
                monthvisit.push(monthobj)

            }

            var visitdata = {
                dayvisit:dayvisit,
                weekvisit:weekvisit,
                monthvisit:monthvisit
            }
           res.send(visitdata)
        }
    })
})


module.exports = router;