var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require("./config");
var autoIncrement = require('mongoose-auto-increment');

module.exports = function () {
    var dbUri = "mongodb://" + config.mongo.mongoUser + ":" + config.mongo.mongoPassword + "@" + config.mongo.mongoHost + ":" + config.mongo.mongoPort + "/" + config.mongo.mongoDbName;
    var opts = {
        auth: {
            authMechanism: 'SCRAM-SHA-1',
            authSource: 'admin'
        }
    };
    var connection = mongoose.createConnection(dbUri, opts);
    autoIncrement.initialize(connection);
    // var db = mongoose.connect(dbUri,function(err){
    //     console.log(err)
    // });

    var db = mongoose.connect(dbUri, opts);
     require("../models/request.server.model");
     require("../models/group.server.model");
     require("../models/user.server.model");
     require("../models/interspace.server.model");
     require("../models/advertisement.server.model");
     require("../models/shop.server.model");
     require("../models/goods.server.model");
     require("../models/goodsclass.server.model");
     require("../models/circle.server.model");
     require("../models/comment.server.model");
     require("../models/teacher.server.model");
     require("../models/course.server.model");
     require("../models/track.server.model");
    require("../models/system.server.model");
    require("../models/company.server.model");
    require("../models/ctype.server.model");
    require("../models/cshop.server.model");
    require("../models/cgoods.server.model");
    require("../models/activity.server.model");
    require("../models/office.server.model");
    require("../models/station.server.model");
    require("../models/roadshow.server.model");
    require("../models/boardroom.server.model");
    require("../models/enterprise.server.model");
    require("../models/officeorder.server.model");
    require("../models/lock.server.model");
    require("../models/lockauthority.server.model");
    require("../models/lockrecord.server.model");
    require("../models/media.server.model");
    require("../models/mediaserver.server.model");
    require("../models/invitejob.server.model");
    require("../models/applyforjob.server.model");
    require("../models/print.server.model");
    require("../models/staffapplyfor.server.model");
    require("../models/integralgoods.server.model");
    require("../models/integralgoodsorder.server.model");
    require("../models/adminuser.server.model");
    require("../models/finance.server.model");
    require("../models/withdraw.server.model");
    require("../models/systemconfig.server.model");
    require("../models/mediaorder.server.model");
    require("../models/trackinterspace.server.model");
    require("../models/coffeeshop.server.model");
    require("../models/gym.server.model");
    require("../models/gymcoach.server.model");
    require("../models/link.server.model");
    require("../models/topic.server.model");
    require("../models/topiccomment.server.model");
    require("../models/integraldetail.server.model");
    require("../models/message.server.model");
    require("../models/policy.server.model");
    require("../models/policyclass.server.model");
    require("../models/coupon.server.model");
    require("../models/integralconf.server.model");
    require("../models/visit.server.model");
    require("../models/serviceclass.server.model");
    require("../models/service.server.model");
    require("../models/instructions.server.model");
    require("../models/coffeenotice.server.model");
    return db;
}