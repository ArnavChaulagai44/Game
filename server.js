const http=require('http'),fs=require('fs'),url=require('url'),WebSocket=require('ws');
const server=http.createServer((req,res)=>{
 if(req.url==='/'){res.writeHead(200,{'Content-Type':'text/html'});res.end(fs.readFileSync('./index.html'))}
 else{res.writeHead(404);res.end('Not found')}
});
const wss=new WebSocket.Server({server,path:'/ws'}),rooms=new Map();
function roomOf(code){if(!rooms.has(code))rooms.set(code,{players:{},enemies:[],next:1});return rooms.get(code)}
function broadcast(room){
 for(const id in room.players){const p=room.players[id],players={};for(const k in room.players)if(k!==id){const q=room.players[k];players[k]={x:q.x,y:q.y,hp:q.hp,name:q.name,score:q.score}}
 room.players[id].ws.send(JSON.stringify({type:'state',you:{x:p.x,y:p.y,hp:p.hp,score:p.score},players,enemies:room.enemies}))}
}
wss.on('connection',(ws,req)=>{
 const q=new URL(req.url,'http://x'),code=(q.searchParams.get('room')||'MAIN').toUpperCase(),name=(q.searchParams.get('name')||'Ranger').slice(0,14),room=roomOf(code),id=String(room.next++);
 const p={x:150+Math.random()*500,y:120+Math.random()*350,hp:100,score:0,name,ws,cool:0};room.players[id]=p;
 ws.on('message',raw=>{try{const m=JSON.parse(raw);if(m.type==='input'){const s=5;let l=Math.hypot(m.dx,m.dy)||1;p.x=Math.max(20,Math.min(1200,p.x+m.dx/l*s));p.y=Math.max(70,Math.min(700,p.y+m.dy/l*s));if(m.shoot&&p.cool<=0){p.cool=5;}}}catch{}});
 ws.on('close',()=>{delete room.players[id];if(!Object.keys(room.players).length)rooms.delete(code)});
});
setInterval(()=>{for(const room of rooms.values()){for(const id in room.players){if(room.players[id].cool>0)room.players[id].cool--}broadcast(room)}},100);
server.listen(process.env.PORT||3000,()=>console.log('Golden Ranger Online running on port '+(process.env.PORT||3000)));
