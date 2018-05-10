var express = require('express');
var router = express.Router();
var redisPrefix = require("../common/redisPrefix");
var getAccessToken = require("../common/wechat/getAccessToken");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Order = mongoose.model("Order");
var Album = mongoose.model("Album");
var AlbumUser = mongoose.model("AlbumUser");
var Finance = mongoose.model("Finance");
var Withdraw = mongoose.model("Withdraw");
var PatchPhoto = mongoose.model("PatchPhoto");
var Photo = mongoose.model("Photo");
var FlockAlbum = mongoose.model("FlockAlbum");
var Flock = mongoose.model("Flock");
var Admin = mongoose.model("Admin");
var Feedback = mongoose.model("Feedback");
var BugTrack = mongoose.model("BugTrack");

router.use(function(req, res, next) {
	getAccessToken(function (err,data) {
		console.log('获取token:====================');
		console.log(data);
	})
	next();
})




/* 获取我的群信息 */
router.get('/index', function (req, res, next) {


	res.json((new Date(Date.now())).format("yyyy-MM-dd hh:mm:ss"));
});




router.get('/usersorders',function (req, res, next) {
	User.find({},function (err, data) {

		Order.find({},function (err1, data1) {
			res.json({
				user:data,
				order:data1
			});
		})
	})

})

router.get('/flock',function (req, res, next) {
	Flock.find({},function (err, data) {
		res.json(data);
	})
})

router.get('/album',function (req, res, next) {
	Album.find({},function (err, data) {
		res.json(data);
	})
})

router.get('/flockalbum',function (req, res, next) {
	FlockAlbum.find({},function (err, data) {
		res.json(data);
	})
})

router.get('/patchphoto',function (req, res, next) {
	PatchPhoto.find({},function (err, data) {
		res.json(data);
	})
})

router.get('/feedback',function (req, res, next) {
	Feedback.find({},function (err, data) {
		res.json(data);
	})
})

router.get("/user", function (req, res,next) {
	User.find({},function (e,v) {
		res.json(v);
	})
})

router.get("/setadmin", function (req, res,next) {
	User.find({openId:{$in:['59382504b0752d0ece524f7c','ocwf90K5T3JpIySiSacUQwesVGPM']}},function (e,v) {
		for (var i =0; i<v.length;i++){
			var admin = new Admin({
				nickName:v[i].nickName,                                //姓名
				gender:v[i].gender,                                  //性别
				language:v[i].language,                                //语言
				city:v[i].city,                                    //城市
				province:v[i].province,                                //省
				country:v[i].country,                                 //国家
				avatarUrl:v[i].avatarUrl,                               //头像
				openId:v[i].openId,                                  //openid
				createTime:Date.now(),                              //创建时间
			});
			admin.save(function () {
				Admin.find({},function (err,data) {
					res.json(data);
				})
			})

		}
	})
})

router.get("/withdraw", function (req, res,next) {
	Withdraw.find({},function (e,v) {
		res.json(v);
	})


})

router.get("/finance", function (req, res,next) {
	Finance.find({},function (e,v) {
		res.json(v);
	})
})

router.get("/order", function (req, res,next) {
	Order.find({},function (e,v) {
		res.json(v);
	})


})

router.get("/bugtrack", function (req, res,next) {
	BugTrack.find({},function (e,v) {
		res.json(v);
	})
})

router.get("/updateuser",function (req, res, next) {
	User.update({openId:'ocwf90FWLr4y1FDkfaBwvxdTjx5U'},{vipLevel:3},function (e,v) {
		res.json(v);
	})
})



router.get("/clearall",function (req, res, next) {
	var Album = mongoose.model("Album");
	var AlbumUser = mongoose.model("AlbumUser");
	var Finance = mongoose.model("Finance");
	var Flock = mongoose.model("Flock");
	var FlockAlbum = mongoose.model("FlockAlbum");
	var FlockUser = mongoose.model("FlockUser");
	var Order = mongoose.model("Order");
	var PatchPhoto = mongoose.model("PatchPhoto");
	var Photo = mongoose.model("Photo");
	var User = mongoose.model("User");
	var Withdraw = mongoose.model("Withdraw");

	Album.remove({},function () {});
	AlbumUser.remove({},function () {});
	Finance.remove({},function () {});
	Flock.remove({},function () {});
	FlockAlbum.remove({},function () {});
	FlockUser.remove({},function () {});
	Order.remove({},function () {});
	PatchPhoto.remove({},function () {});
	Photo.remove({},function () {});
	User.remove({},function () {});
	Withdraw.remove({},function () {});

	res.json("deleted");
});

module.exports = router;
