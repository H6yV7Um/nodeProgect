/**
 * Created by GengHaibin on 2017/12/09
 */
var express = require('express');
var orm = require("orm");
var config = require("./config");
var marketingModel = require("../models/marketing.server.model");
var benefitModel = require("../models/benefit.server.model");
var userModel = require("../models/user.server.model");
var banneradsModel = require("../models/bannerads.server.model");

module.exports = function () {
	//var uri = "mysql://"+config.mysql.user+":"+config.mysql.password+"@"+config.mysql.host+"/"+config.mysql.database;
	var _db = orm.express(config.mysql,{
		define: function (db, models, next) {
			models.Marketing = marketingModel(db);
			models.Benefit = benefitModel(db);
            models.User = userModel(db);
            models.Bannerads = banneradsModel(db);
			next();
		}
	});
	return _db;
};