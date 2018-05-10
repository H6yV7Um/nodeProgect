var mongoose = require("mongoose");
//var date = require("../common/date")
var Lockrecord = mongoose.model("Lockrecord");
var Lock = mongoose.model("Lock");

var tcpserver = function () {
	var net = require('net');
	var sockets = [];
	var server = net.createServer();

	server.on('connection', function (socket) {
		//socket.setEncoding('utf8');
		socket.setKeepAlive(true, 10000);               //保持连接10 seconds
		sockets.push(socket);
		var nowtime = formatDate(Date.now())
		var date = nowtime.split("-")
		var buf = new Buffer(6)
		for(var i=0;i<date.length;i++){
			buf.fill(parseInt(date[i], 16),i)
		}
		replyData(21,buf,32,00,'FF',function(data) {
			socket.write(data);
		})
		// console.log(Date.now())
		// console.log('CONNECTED:       ' +socket.remoteAddress + '    :     ' + socket.remotePort);
		// console.log(socket);
		//新的连接
		socket.on('data', function(data) {
			judgeTCPinstruct(data,function(newdata){
				//console.log(newdata)
				socket.write(newdata);
			})
			// var length = Buffer.byteLength(data)
			// var buf = new Buffer(data)
			// console.log(buf.slice(0,1));
			// console.log(buf.slice(length-1,length));
			//socket.write(data);
		});
		socket.on('close', function() {
			//console.log('connection closed');
			var index = sockets.indexOf(socket);
			sockets.splice(index, 1);
			//console.log('sockets length:', sockets.length);
		});
	});

	server.on('error', function(err) {
		console.log('Server error:', err.message);
	});
	server.on('close', function() {
		console.log('Server closed');
	});
	server.listen(8124, function() {

		console.log('TCP service created');
	});
}
/**
 * 验证数据及判断指令
 * @param data
 * @param fn
 */
var judgeTCPinstruct = function(data,fn){
	var length = Buffer.byteLength(data)
	var buf = new Buffer(data)
	//console.log(buf)
	var startbite = buf.slice(0,1).toString('hex');
	var endbite = buf.slice(length-1,length).toString('hex')
	var reldatalength = length - 4
	var datalength = parseInt(buf.slice(1,3).toString('hex'),16)
	var verifydatastr = JSON.stringify(buf.slice(2,length-2))
	var verifydata = JSON.parse(verifydatastr).data
	var newdata = 0;
	for(var i=0;i<verifydata.length;i++){
		newdata = newdata^verifydata[i]
	}
	var finalverifydata = newdata.toString(16)
	if((startbite == '02') && (endbite == '03') && (reldatalength == datalength) && (finalverifydata == buf.slice(length-2,length-1).toString('hex'))){
		var instruct = buf.slice(10,12).toString('hex')
		//02 00 1d 00 81 39 96 15 28 11 45 03 00 01 ff ff ff ff 17 02 04 11 54 33 00 81 39 96 15 28 01 2d 03
		//console.log(instruct)
		switch(instruct){
			case '4518':
				//console.log('心跳指令')
				replyData(15,null,45,08,00,function(data){
					fn(data)
				})
				break;
			case '5506':
				console.log('开门指令')
				opendoor(buf,length)
				// replyData(15,null,function(data){
				// 	fn(data)
				// })
				break;
		}

	}
}
/**
 * 回复数据
 * @param length
 * @param data
 * @param fn
 */
var replyData = function(length,data,instruct1,instruct2,state,fn){
	switch((length-4).toString(16).length){
		case 1:
			var datalength = '000'+(length-4).toString(16)
			break;
		case 2:
			var datalength = '00'+(length-4).toString(16)
			break;
		case 3:
			var datalength = '0'+(length-4).toString(16)
			break;
	}
	var buffer = new Buffer(length);
	buffer.fill(02)
	buffer.fill(parseInt(datalength.substring(0,2)
		, 16), 1)
	buffer.fill(parseInt(datalength.substring(2,4)
		, 16), 2)
	buffer.fill(parseInt('FF', 16), 3, 9)
	buffer.fill(parseInt('11', 16), 9)
	buffer.fill(parseInt(instruct1, 16), 10)
	buffer.fill(parseInt(instruct2, 16), 11)
	buffer.fill(parseInt(state, 16), 12)
	buffer.fill(parseInt('FF', 16), length-2)
	buffer.fill(03, length-1)

	if(!data){

	}else{
		data.copy(buffer,13)

	}
	fn(buffer)
}
var formatDate = function(date) {
	var date = new Date(date);
	var Y = (date.getFullYear().toString()).substring(2,4) + '-';
	var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	var D = (date.getDate() < 10 ? '0'+(date.getDate()) : date.getDate()) + '-';
	var h = (date.getHours() < 10 ? '0'+(date.getHours()) : date.getHours()) + '-';
	var m = (date.getMinutes() < 10 ? '0'+(date.getMinutes()) : date.getMinutes()) + '-';
	var s = (date.getSeconds() < 10 ? '0'+(date.getSeconds()) : date.getSeconds());
	return Y+M+D+h+m+s;
	//return (myyear + "-" + mymonth + "-" + myweekday);
}
/**
 * 处理开门指令
 */
var opendoor = function(data,length){
	var datastr = data.slice(13,length-2).toString()
    //591fe1eb4ccbd66f3e96cd6e/84357108|84357108060000852953A50E6E085F243473430AB949753DF997C1DE5E6CF60AC27A
	console.log(datastr)
	var userinfo = datastr.split('|')[0]
	var mac = data.slice(3,9).toString('hex')
	Lock.find({mac:mac},function(err,macs){
		console.log(macs)
		var interspaceId = macs[0].interspaceId
		console.log(interspaceId)
        var obj = {
            interspaceId:interspaceId,
            lockMac:mac,           //设备mac地址（唯一）
            userId:datastr.substring(1,25),       //用户id
            cardNo:userinfo.split('/')[1],       //开锁记录号
            openStatus:parseInt(data.slice(12,13).toString('hex'),16),        //1开启2未开启
            createTime:Date.now(),    //发布时间
        }
        var record = new Lockrecord(obj)
        record.save(function(err,docs){
            console.log(err)
        })
	})

}


module.exports = tcpserver;