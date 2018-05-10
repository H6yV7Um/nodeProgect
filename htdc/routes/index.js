var express = require('express');
var router = express.Router();
var functions = require("../common/functions");
var redisPrefix = require("../common/redisPrefix");
var redisClient = require("../common/redisClient");
var md5 = require('md5');
var async = require('async')
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Visit = mongoose.model("Visit");
var Circle = mongoose.model("Circle");


/**
 * 数据统计
 */
router.get("/gatherdata",function(req,res){
    var daytm = new Date(new Date().setHours(0, 0, 0, 0)).getTime();;
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
    var monthtm = daytm
    var monthtime = [monthtm]
    for(var i=1;i<8;i++){
        var tm = daytm - i*30*24*60*60*1000;
        monthtime.push(tm)
    }

  // User.find({},function(err,users){
  //   if(err){
  //     res.render('nodata')
  //   }else{
  //       var dayusers = []
  //       var weekusers = []
  //       var monthusers = []
  //
  //         for(var x=0;x<daytime.length;x++){
  //             var dayobj = {
  //                 allusers:0,
  //                 registerusers:0,
  //                 time: daytime[x]
  //             }
  //
  //
  //             for(var j=0;j<users.length;j++){
  //
  //               if(users[j].createTime < daytime[x]){
  //                 dayobj.allusers += 1
  //               }
  //               if((users[j].createTime < daytime[x]) && (users[j].createTime > (daytime[x]-24*60*60*1000))){
  //                   dayobj.registerusers += 1
  //               }
  //
  //             }
  //             dayusers.push(dayobj)
  //
  //       }
  //       for(var x=0;x<weektime.length;x++){
  //           var weekobj = {
  //               allusers:0,
  //               registerusers:0,
  //               time: weektime[x]
  //           }
  //           for(var j=0;j<users.length;j++){
  //               if(users[j].createTime < weektime[x]){
  //                   weekobj.allusers += 1
  //               }
  //               if((users[j].createTime < weektime[x]) && (users[j].createTime > (weektime[x]-7*24*60*60*1000))){
  //                   weekobj.registerusers += 1
  //               }
  //           }
  //           weekusers.push(weekobj)
  //       }
  //
  //       for(var x=0;x<monthtime.length;x++){
  //           var monthobj = {
  //               allusers:0,
  //               registerusers:0,
  //               time: monthtime[x]
  //           }
  //           for(var j=0;j<users.length;j++){
  //               if(users[j].createTime < monthtime[x]){
  //                   monthobj.allusers += 1
  //               }
  //               if((users[j].createTime < monthtime[x]) && (users[j].createTime > (monthtime[x]-30*24*60*60*1000))){
  //                   monthobj.registerusers += 1
  //               }
  //           }
  //           monthusers.push(monthobj)
  //
  //       }
  //
  //       var usersdata = {
  //           dayusers:dayusers,
  //           weekusers:weekusers,
  //           monthusers:monthusers
  //       }
  //       redisClient.set(redisPrefix.USERS_NUM, JSON.stringify(usersdata),function(e,data){
  //           res.status(200).json({
  //               error:0,
  //               message:'success',
  //               data:data
  //           });
  //       })
  //   }
  // })


    // redisClient.get(redisPrefix.CIRCLE_NUM,function(e,data){
    //     res.status(200).json({
    //         error:0,
    //         message:'success',
    //         data:JSON.parse(data)
    //     });
    // })

    Circle.find({},function(err,circles){
        if(!err){
            var daycircles = []
            var weekcircles = []
            var monthcircles = []
            for(var x=0;x<daytime.length;x++){
                var dayobj = {
                    circles:0,
                    time: daytime[x]
                }
                for(var m=0;m<circles.length;m++){
                    if((circles[m].createTime < daytime[x]) && (circles[m].createTime > (daytime[x]-24*60*60*1000))){
                        dayobj.circles += 1
                    }
                }
                daycircles.push(dayobj)
            }
            for(var x=0;x<weektime.length;x++){
                var weekobj = {
                    circles:0,
                    time: weektime[x]
                }
                for(var m=0;m<circles.length;m++){
                    if((circles[m].createTime < weektime[x]) && (circles[m].createTime > (weektime[x]-7*24*60*60*1000))){
                        weekobj.circles += 1
                    }
                }

                weekcircles.push(weekobj)
            }



            for(var x=0;x<monthtime.length;x++){
                var monthobj = {
                    circles:0,
                    time: monthtime[x]
                }
                for(var m=0;m<circles.length;m++){
                    if((circles[m].createTime < monthtime[x]) && (circles[m].createTime > (monthtime[x]-30*24*60*60*1000))){
                        monthobj.circles += 1
                    }
                }
                monthcircles.push(monthobj)
            }

            var circledata = {
                daycircles:daycircles,
                weekcircles:weekcircles,
                monthcircles:monthcircles
            }
            redisClient.set(redisPrefix.CIRCLE_NUM, JSON.stringify(circledata),function(e,data){
                res.status(200).json({
                    error:0,
                    message:'success',
                    data:data
                });
            })

        }
    })

    // Circle.find({},function(err,circles){
    //   if(!err){
    //       var daycircles = []
    //       var weekcircles = []
    //       var monthcircles = []
    //       for(var x=0;x<daytime.length;x++){
    //           var dayobj = {
    //               circles:0,
    //               time: daytime[x]
    //           }
    //           for(var m=0;m<circles.length;m++){
    //               if((circles[m].createTime < daytime[x]) && (circles[m].createTime > (daytime[x]-24*60*60*1000))){
    //                   dayobj.circles += 1
    //               }
    //           }
    //           daycircles.push(dayobj)
    //       }
    //       for(var x=0;x<weektime.length;x++){
    //           var weekobj = {
    //               circles:0,
    //               time: weektime[x]
    //           }
    //           for(var m=0;m<circles.length;m++){
    //               if((circles[m].createTime < weektime[x]) && (circles[m].createTime > (weektime[x]-24*60*60*1000))){
    //                   weekobj.circles += 1
    //               }
    //           }
    //
    //           weekcircles.push(weekobj)
    //       }
    //
    //
    //
    //           for(var x=0;x<monthtime.length;x++){
    //               var monthobj = {
    //                   circles:0,
    //                   time: monthtime[x]
    //               }
    //               for(var m=0;m<circles.length;m++){
    //                   if((circles[m].createTime < monthtime[x]) && (circles[m].createTime > (monthtime[x]-30*24*60*60*1000))){
    //                       monthobj.circles += 1
    //                   }
    //               }
    //               monthcircles.push(monthobj)
    //           }
    //
    //           var circledata = {
    //               daycircles:daycircles,
    //               weekcircles:weekcircles,
    //               monthcircles:monthcircles
    //           }
    //             redisClient.set(redisPrefix.CIRCLE_NUM, JSON.stringify(circledata),function(e,data){
    //                 res.status(200).json({
    //                     error:0,
    //                     message:'success',
    //                     data:data
    //                 });
    //             })
    //
    //   }
    // })
})

router.get("/appdata",function(req,res){
    var userinfo = req.session.adminuser;
    var leftNav = functions.createLeftNavByCodes('#a', userinfo.arr);
    if(userinfo) {
        redisClient.get(redisPrefix.CIRCLE_NUM,function(e,circle) {
            var circlenums = JSON.parse(circle)
            redisClient.get(redisPrefix.USERS_NUM, function (e, users) {
                var usersnum = JSON.parse(users)
                redisClient.get(redisPrefix.PAGE_NUM, function (e, pages) {
                    var pagesnum = JSON.parse(pages)
                    var cdcircles = [], cwcircles = [], cmcircles = []
                    var cdtime = [], cwtime = [], cmtime = []
                    for (var i = 0; i < circlenums.daycircles.length; i++) {
                        cdcircles.push(circlenums.daycircles[i].circles)
                        cdtime.push(functions.timeFormat(circlenums.daycircles[i].time))
                    }
                    for (var j = 0; j < circlenums.weekcircles.length; j++) {
                        cwcircles.push(circlenums.weekcircles[j].circles)
                        cwtime.push(functions.timeFormat(circlenums.weekcircles[j].time))
                    }
                    for (var x = 0; x < circlenums.monthcircles.length; x++) {
                        cmcircles.push(circlenums.monthcircles[x].circles)
                        cmtime.push(functions.timeFormat(circlenums.monthcircles[x].time))
                    }

                    var udallusers = [], uwallusers = [], umallusers = []
                    var udregusers = [], uwregusers = [], umregusers = []
                    var udtime = [], uwtime = [], umtime = []
                    for (var a = 0; a < usersnum.dayusers.length; a++) {
                        udallusers.push(usersnum.dayusers[a].allusers)
                        udregusers.push(usersnum.dayusers[a].registerusers)
                        udtime.push(functions.timeFormat(usersnum.dayusers[a].time))
                    }
                    for (var b = 0; b < usersnum.weekusers.length; b++) {
                        uwallusers.push(usersnum.weekusers[b].allusers)
                        uwregusers.push(usersnum.weekusers[b].registerusers)
                        uwtime.push(functions.timeFormat(usersnum.weekusers[b].time))
                    }
                    for (var c = 0; c < usersnum.monthusers.length; c++) {
                        umallusers.push(usersnum.monthusers[c].allusers)
                        umregusers.push(usersnum.monthusers[c].registerusers)
                        umtime.push(functions.timeFormat(usersnum.monthusers[c].time))
                    }
                    var pdusers = [], pwusers = [], pmusers = []
                    var pdservice = [], pwservice = [], pmservice = []
                    var pdappindex = [], pwappindex = [], pmappindex = []
                    var pdcircle = [], pwcircle = [], pmcircle = []
                    var pdtime = [], pwtime = [], pmtime = []
                    for (var d = 0; d < pagesnum.dayvisit.length; d++) {
                        pdusers.push(pagesnum.dayvisit[d].users)
                        pdservice.push(pagesnum.dayvisit[d].service)
                        pdappindex.push(pagesnum.dayvisit[d].appindex)
                        pdcircle.push(pagesnum.dayvisit[d].circle)
                        pdtime.push(functions.timeFormat(pagesnum.dayvisit[d].time))
                    }
                    for (var g = 0; g < pagesnum.weekvisit.length; g++) {
                        pwusers.push(pagesnum.weekvisit[g].users)
                        pwservice.push(pagesnum.weekvisit[g].service)
                        pwappindex.push(pagesnum.weekvisit[g].appindex)
                        pwcircle.push(pagesnum.weekvisit[g].circle)
                        pwtime.push(functions.timeFormat(pagesnum.weekvisit[g].time))
                    }
                    for (var f = 0; f < pagesnum.monthvisit.length; f++) {
                        pmusers.push(pagesnum.monthvisit[f].users)
                        pmservice.push(pagesnum.monthvisit[f].service)
                        pmappindex.push(pagesnum.monthvisit[f].appindex)
                        pmcircle.push(pagesnum.monthvisit[f].circle)
                        pmtime.push(functions.timeFormat(pagesnum.monthvisit[f].time))
                    }


                    console.log(pwcircle)
                    console.log(pmcircle)

                    var cdData = [cdtime.reverse(), cdcircles.reverse()]
                    var cwData = [cwtime.reverse(), cwcircles.reverse()]
                    var cmData = [cmtime.reverse(), cmcircles.reverse()]
                    var data1 = [cdData, cwData, cmData]

                    var udaytime=udtime.reverse()
                    var uweektime=uwtime.reverse()
                    var umonthtime=umtime.reverse()
                    var udallData = [udaytime, udallusers.reverse()]
                    var uwallData = [uweektime, uwallusers.reverse()]
                    var umallData = [umonthtime, umallusers.reverse()]
                    var udregData = [udaytime, udregusers.reverse()]
                    var uwregData = [uweektime, uwregusers.reverse()]
                    var umregData = [umonthtime, umregusers.reverse()]
                    var data2 = [udallData, uwallData, umallData, udregData, uwregData, umregData]
                    var pdaytime=pdtime.reverse()
                    var pweektime=pwtime.reverse()
                    var pmonthtime=pmtime.reverse()
                    var pduData = [pdaytime, pdusers.reverse()]
                    var pwuData = [pweektime, pwusers.reverse()]
                    var pmuData = [pmonthtime, pmusers.reverse()]

                    var pdsData = [pdaytime, pdservice.reverse()]
                    var pwsData = [pweektime, pwservice.reverse()]
                    var pmsData = [pmonthtime, pmservice.reverse()]

                    var pdaData = [pdaytime, pdappindex.reverse()]
                    var pwaData = [pweektime, pwappindex.reverse()]
                    var pmaData = [pmonthtime, pmappindex.reverse()]

                    var pdcData = [pdaytime, pdcircle.reverse()]
                    var pwcData = [pweektime, pwcircle.reverse()]
                    var pmcData = [pmonthtime, pmcircle.reverse()]

                    var data3 = [pduData, pwuData, pmuData, pdsData, pwsData, pmsData, pdaData, pwaData, pmaData, pdcData, pwcData, pmcData]
                    res.render('appdata', {
                        leftNav: leftNav,
                        circlenums: circlenums,
                        usersnum: usersnum,
                        data1: JSON.stringify(data1),
                        data2: JSON.stringify(data2),
                        data3: JSON.stringify(data3),
                        userinfo: userinfo.adminuserInfo
                    })
                })
            })
        })
    }else{
        res.render('login')
    }
})


/**
 * 统计用户行为测试
 */
router.get("/testlushengying",function(req,res){
    var daytm = new Date(new Date().setHours(0, 0, 0, 0)).getTime();;
    var daytime = [daytm]
    for(var i=1;i<8;i++){
        var tm = daytm - i*24*60*60*1000;
        daytime.push(tm)
    }
    var weektime = [daytm - 7*24*60*60*1000]
    for(var i=1;i<8;i++){
        var tm = daytm - i*7*24*60*60*1000;
        weektime.push(tm)
    }
    var monthtm = daytm - 30*24*60*60*1000
    var monthtime = [monthtm]
    for(var i=1;i<8;i++){
        var tm = daytm - i*30*24*60*60*1000;
        monthtime.push(tm)
    }

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
                    time: daytime[x]
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
                  time: daytime[x]
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
                  time: daytime[x]
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
          redisClient.set(redisPrefix.PAGE_NUM, JSON.stringify(visitdata),function(e,data){
              res.status(200).json({
                  error:0,
                  message:'success',
                  data:data
              });
          })
      }
    })

})
module.exports = router;
