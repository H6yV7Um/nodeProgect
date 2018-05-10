var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Flock = mongoose.model("Flock");
var Album = mongoose.model("Album");
var PatchPhoto = mongoose.model("PatchPhoto");
var Photo = mongoose.model("Photo");
var FlockAlbum = mongoose.model("FlockAlbum");
var config = require("../common/config");
var functions = require("../common/functions");
var formidable = require('formidable');
var fs = require('fs');
var errors = require("../common/errors");

/**
 * 创建图片patch,正式上传图片前调用此接口
 */
router.post("/createpatch", function (req, res, next) {
	var patchId = req.body.patchId;
	var albumId = req.body.albumId;
	var albumName = req.body.albumName;
	var description = req.body.description;


	Album.findOne({_id: mongoose.Types.ObjectId(albumId)}, function (err, data) {
		if (err) {
			res.status(200).json(errors.error3);
		} else {
			User.findOne({openId: req.$wxUserInfo.openId}, function (err1, data1) {
				if (err1) {
					res.status(200).json(errors.error3);
				} else {
					var pp = new PatchPhoto({
						patchId: patchId,                              //批次Id,由客户端生成;格式为:当前时间戳+4位随机数.
						albumId: albumId,                              //相册objectId
						albumName: albumName,                            //相册名字
						creatorOpenId: req.$wxUserInfo.openId,                        //创建者openid
						creatorName: req.$wxUserInfo.nickName,                          //创建者昵称
						creatorHeadPic: req.$wxUserInfo.avatarUrl,                       //创建者头像
						creatorVipLevel: data1.vipLevel,
						description: description,                          //说点什么
						isLinkAlbum: data.isLinkAlbum,                             //是否是联动相册.0不是,是群相册;1是
						price: data.price,                                   //价格（元）.若为0,则是免费
						photos: [],                                //图片
						likes: [],                   //点赞者.数组,格式为[{openId:xxxx,nickName:xxx}]
						comments: [],                 //评论..数组,格式为[{openId:xxxx,nickName:xxx,comment:xxxx}]
						isShow:1,
						createTime: Date.now(),                           //创建时间
					});
					pp.save(function (e, v) {
						if (e) {
							res.status(200).json(errors.error3);
						} else {
							res.status(200).json(errors.error0);
						}
					})
				}
			});
		}
	})

});


/**
 * 上传照片到相册,patchId由客户端生成,格式为:当前时间戳+4位随机数
 */
router.post("/uploadimages/:albumId/:patchId", function (req, res, next) {
	/*相册id*/
	var albumId = req.params.albumId;
	/*批次id*/
	var patchId = req.params.patchId;
	if (albumId && patchId) {//如果两个参数都存在

		/*上传业务*/
		var form = new formidable.IncomingForm();                   //创建上传表单
		form.encoding = 'utf-8';		                            //设置编辑
		form.uploadDir = config.siteRoot + '/uploads/';	            //设置上传目录
		form.keepExtensions = true;	                                //保留后缀
		form.maxFieldsSize = 2 * 1024 * 1024;                        //文件大小
		var files = [], fields = [], docs = [];

		form.on('error', function (err) {
			if (err) {
				console.log("上传图片出错啦");
			}
		}).on('field', function (field, value) {
			fields.push([field, value]);
		}).on('file', function (field, file) {
			files.push([field, file]);
			docs.push(file);
			var extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
			if (file.size > 2 * 2048 * 2048) {               //如果图片大于2M
				fs.unlink(file.path, function () {
				});
				res.status(200).json(errors.error6);
			} else if ((extension !== '.jpg') && (extension !== '.png') && (extension !== '.gif') && (extension !== '.jpeg')) {                                 //如果上传的图片格式不是jpg,png,gif
				fs.unlink(file.path, function () {
				});
				res.status(200).json(errors.error7);
			} else {                                     //开始上传
				/*生成文件名*/
				var fileId = albumId + '/' + Math.round(+new Date() / 1000) + functions.randomnum(4) + extension;

				functions.uploadPicToWxyt(file.path, fileId, function (err, ret) {
					if (!err) {
						// 上传成功，删除源文件
						fs.unlink(file.path, function () {
						});
						/*保存到相册中*/
						var downloadUrl = config.wxytUrl + '/' + fileId;
						var photo = new Photo({
							albumId: albumId,                              //相册objectId
							downloadUrl: downloadUrl,                               //相册下载地址
							fileId: fileId,                    //图片key值
							patchId: patchId,                //上传批次
							createTime: Date.now(),                                 //创建时间
						});
						//保存入photo表
						photo.save(function (e, v) {
						});

						//刷新PatchPhoto表
						PatchPhoto.update({patchId: patchId}, {$addToSet: {photos: downloadUrl}}, function (e, v) {
							//查看此相册关联的群，刷新群图集缓存
							FlockAlbum.find({albumId: albumId}, function (err1, data1) {
								var ids = [];
								for (var i = 0; i < data1.length; i++) {
									ids.push(data1[i].openGId);
								}
								Flock.update({openGId: {$in: ids}}, {$inc: {photoNum: 1}, updateTime:Date.now()}, function (e, v) {
									for (var i = 0; i < data1.length; i++) {
										functions.buildFlockInfoCache(data1[i].openGId, function () {
										});
									}
								});
							});
						});
						//刷新Album表
						Album.update({_id: mongoose.Types.ObjectId(albumId)}, {
							$inc: {photoNum: 1},
							$set: {coverPic: downloadUrl}
						}, function (e, v) {
						});


						//处理返回值
						res.status(200).json({
							error: 0,
							message: "success",
							data: downloadUrl,
						});
					} else {
						res.status(200).json(err);
					}
				});
			}

		}).on('end', function () {

		});

		form.parse(req, function (err, fields, files) {
			err && console.log('formidabel error : ' + err);
		});
	} else {
		res.status(200).json(errors.error9);
	}
});

/**
 * 删除图片接口
 */
router.post("/deleteimage", function (req, res, next) {

	var fileUrl = req.body.fileUrl;
	var tmp = fileUrl.split('/');
	var t = tmp.pop();
	var albumId = tmp.pop();
	var fileId = albumId + '/' + t;
	/*console.log("++++++++++++++++++++++");
	console.log(albumId);
	console.log(fileId);*/

	var openId = req.$wxUserInfo.openId;
	Album.findOne({_id: mongoose.Types.ObjectId(albumId)}, function (err, data) {
		if (err) {
			res.status(200).json(errors.error3);
		} else {

			if (data) { //如果相册存在

				if (data.creatorOpenId == openId) {

					functions.deletePicFromWxyt(fileId, function (err1, data1) {
						/*console.log("=======================");
						console.log(err1);
						console.log(data1);*/

						if (err1) {
							res.status(200).json(errors.error9);
						} else {

							Photo.findOne({fileId: fileId}, function (err2, data2) {
								if (err2 && !data2) {
									res.status(200).json(errors.error3);
								} else {

										var patchId = data2.patchId;
										//更新PatchPhoto表
										PatchPhoto.findOneAndUpdate({patchId: patchId}, {$pull: {photos: data2.downloadUrl}}, function (e, v) {
											var removeOnePhotoRefreshFlock = function (albumId) {
												//查看此相册关联的群，刷新群图集缓存
												FlockAlbum.find({albumId: albumId}, function (err1, data1) {
													var ids = [];
													for (var i in data1) {
														ids.push(data1[i].openGId);
													}
													Flock.update({openGId: {$in: ids}}, {$inc: {photoNum: -1}, updateTime:Date.now()}, function (e, v) {
														for (var i in data1) {
															functions.buildFlockInfoCache(data1[i].openGId, function () {
															});
														}
													});
												});
											}

											//只剩下一张图片了
											if (v.photos.length == 1) {
												PatchPhoto.remove({patchId: patchId}, function () {
													removeOnePhotoRefreshFlock(albumId);
												});
											} else {
												removeOnePhotoRefreshFlock(albumId);
											}

										});
										//Photo表中删除数据
										Photo.remove({fileId: fileId}, function (err4, data4) {
										});

								}
							});
							//更新Album表
							Album.update({_id: mongoose.Types.ObjectId(albumId)}, {
								$inc: {photoNum: -1},
							}, function (e, v) {
							});

							res.status(200).json(errors.error0);
						}
					});
				} else {
					res.status(200).json(errors.error8);
				}
			} else {
				res.status(200).json(errors.error8);
			}
		}
	})
});


module.exports = router;
