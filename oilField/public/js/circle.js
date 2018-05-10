
const canvas=document.querySelector('#myCanvas');
const paint=canvas.getContext('2d');
const can=document.querySelector('#circle');
const ctx=can.getContext('2d');
var n=0;

canvas.width = can.width = 460
canvas.height = can.height = 460

// window.onresize=function(){
//   if($('.left-cir').width()<480||$('.left-cir').height()<480)
//     canvas.width =can.width =$('.left-cir').width()-20
//     canvas.height=can.height=$('.left-cir').height()-20
// }
// console.log('+++++')
// console.log(length)
t=setInterval(move,1000);
circle()
function move() {
  paint.clearRect(0,0,canvas.width,canvas.height);
  paint.save();
  paint.beginPath();
  paint.translate(230,230);
  paint.rotate(0);
  paint.arc(-2,-180,10,0,Math.PI*2);
  paint.fillStyle='#f5a501';
  paint.fill();
  paint.closePath();
  paint.restore();

  paint.save();
  paint.beginPath();
  paint.translate(230,230);
  paint.rotate(-Math.PI/2);
  paint.arc(0,0,180,0,Math.PI/180*n*6);
  paint.strokeStyle='#f5a501';
  paint.lineWidth=20;
  paint.stroke();
  paint.closePath();
  paint.restore();

  paint.save();
  paint.beginPath();
  paint.translate(230,230);
  paint.rotate(Math.PI/180*n*6);
  paint.arc(0,-180,10,0,Math.PI*2);
  paint.fillStyle='#f5a501';
  paint.fill();
  paint.closePath();
  paint.restore();
  n++;
  if(n*6==360){
    n=0
  }
}
function circle() {
  ctx.shadowOffsetX=0;
  ctx.shadowOffsetY=0;
  ctx.shadowBlur=10;
  ctx.shadowColor="#ccc";

  ctx.save();
  ctx.beginPath();
  ctx.translate(230,230);
  ctx.rotate(-Math.PI/2);
  ctx.arc(0,0,180,0,Math.PI*2);
  ctx.strokeStyle='#666085';
  ctx.lineWidth=20;
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}
