var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require("./config");
var autoIncrement = require('mongoose-auto-increment');

module.exports = function () {
    var dbUri = "mongodb://" + config.mongo.mongoUser + ":" + config.mongo.mongoPassword + "@" + config.mongo.mongoHost + ":" + config.mongo.mongoPort + "/" + config.mongo.mongoDbName;
    var opts = {
        auth:{
            authMechanism: "SCRAM-SHA-1",
            authSource: "admin"
        }
    };
    var connection = mongoose.createConnection(dbUri,opts);
    autoIncrement.initialize(connection);
     //var db = mongoose.connect(dbUri,function(err){
     //    console.log(err)
     //});
    var db = mongoose.connect(dbUri,opts );

    require("../models/adminuser.server.model");
    require("../models/ticket.server.model");
    require("../models/request.server.model");


    return db;
}