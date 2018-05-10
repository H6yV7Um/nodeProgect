
var fs = require('fs');

var officegen = require('officegen');

var xlsx = officegen ( 'xlsx' );

var makeXlsx = function(tableheader,data,name,filename){
    console.log(filename)
    xlsx.on ( 'finalize', function ( written ) {
        console.log ( 'Finish to create an Excel file.\nTotal bytes created: ' + written + '\n' );
    });

    xlsx.on ( 'error', function ( err ) {
        console.log ( err );
    });

    sheet = xlsx.makeNewSheet ();
    sheet.name = 'Excel Test';

// The direct option - two-dimensional array:
    sheet.data[0] = tableheader;
    for(var i=1;i<data.length-1;i++){
        sheet.data[i] = [name,((data[i].amount)/100).toFixed(2),data[i].channel,data[i].createTime]
    }

// Using setCell:
//     sheet.setCell ( 'E7', 340 );
//     sheet.setCell ( 'I1', -3 );
//     sheet.setCell ( 'I2', 31.12 );
//     sheet.setCell ( 'G102', 'Hello World!' );

    var out = fs.createWriteStream ( './uploads/out.xlsx' );

    out.on ( 'error', function ( err ) {
       
    });

    xlsx.generate ( out );

}

module.exports = {
    makeXlsx:makeXlsx
}