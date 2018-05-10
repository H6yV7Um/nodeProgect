/**
 * Created by GengHaibin on 2017/12/09
 */
var express = require('express');
var orm = require("orm");
var config = require("./config");
var userModel = require("../models/user.server.model");
var roleModel = require("../models/role.server.model");
var siteModel = require("../models/site.server.model");
var siteDataModel = require("../models/siteData.server.model");
var wellGroupModel = require("../models/wellGroup.server.model");
var wellGroupDataModel = require("../models/wellGroupData.server.model");
var wellModel = require("../models/well.server.model");
var wellDataModel = require("../models/wellData.server.model");
var factorModel = require("../models/factor.server.model");
var manageSiteModel= require("../models/manageSite.server.model");
var abnormalModel= require("../models/abnormal.server.model");

module.exports = function () {
	//var uri = "mysql://"+config.mysql.user+":"+config.mysql.password+"@"+config.mysql.host+"/"+config.mysql.database;
	var _db = orm.express(config.mysql,{
		define: function (db, models, next) {
            models.Role = roleModel(db);
            models.User = userModel(db);
            models.Site = siteModel(db);
            models.SiteData = siteDataModel(db);
            models.WellGroup = wellGroupModel(db);
            models.WellGroupData = wellGroupDataModel(db);
            models.Well = wellModel(db);
            models.WellData = wellDataModel(db);
            models.Factor = factorModel(db);
            models.ManageSite = manageSiteModel(db);
            models.Abnormal = abnormalModel(db);
			next();
		}
	});
	return _db;
};