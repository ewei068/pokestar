import {age,live,envelope,ease,random,TAU,withAlpha,path,oval,ring,shock,spark,halo,ribbon,clamp,texture,orb} from './parts';
import type {Draw,Point,Ctx} from './parts';
import type {Colors} from '../matrixVfxKit';

const embers=(ctx:Ctx,ms:number,birth:number,seed:number,count:number,origin:Point)=>{
  for(let i=0;i<count;i++){
    const s=seed+i*43,u=age(ms,birth+random(s)*150,220+random(s+1)*130);if(!live(u))continue;
    const x=origin[0]+(random(s+2)-.5)*u*1.8,y=origin[1]-u*(.4+random(s+3)*.8)+u*u*.23;
    texture(ctx,i%3===0?'coal':i%3===1?'ember':'fleck',x,y,(.14+random(s+4)*.17)*(1-u*.45),Math.sin(i)*.4,envelope(u));
  }
};
export const firePhysical:Draw=(ctx,ms,seed,c)=>{
  const u=age(ms,10,470);if(live(u)){
    const hit=ease(u/.57),y=-1.05+hit*.84;
    const size=(.85+random(seed)*.16)*(1-ease((u-.65)/.35));
    halo(ctx,0,y,.66,'#ff9d38',envelope(u)*.24);
    orb(ctx,{main:'#df6538',light:'#ffe68c',dark:'#743449'},0,y,size,ms,envelope(u),'molten');
    if(u<.58)for(let i=0;i<4;i++)texture(ctx,'ember',Math.sin(i)*.18,y-.3-i*.12,.22,0,envelope(u)*(.5-i*.08));
  }
  shock(ctx,ms,240,c,.67,.42);embers(ctx,ms,250,seed,19,[0,.16]);
};
export const fireStatus:Draw=(ctx,ms,seed,_c)=>{
  // Burn-like sequence: each flame stays at its x position and rises/falls on its own beat.
  for(let i=0;i<10;i++) {
    const u=age(ms,25+i*42+random(seed+i)*15,265);if(!live(u))continue;
    const x=-.65+i*.145,y=.28-Math.sin(u*Math.PI)*.19;
    texture(ctx,'fleck',x,y,.36+Math.sin(u*Math.PI)*.10,0,envelope(u));
  }
};

const droplet=(ctx:Ctx,x:number,y:number,size:number,c:Colors,a:number)=>{
  withAlpha(ctx,a,()=>{oval(ctx,x,y,size,size*1.2,c.dark);oval(ctx,x,y-size*.12,size*.76,size*.92,c.main);oval(ctx,x-size*.2,y-size*.36,size*.23,size*.27,c.light);});
};
const spray=(ctx:Ctx,ms:number,birth:number,seed:number,c:Colors,count:number,origin:Point,power=1)=>{
  for(let i=0;i<count;i++){
    const s=seed+i*73,u=age(ms,birth+random(s)*95,260+random(s+1)*130);if(!live(u))continue;
    const vx=(random(s+2)-.5)*2*power,vy=-.65-random(s+3)*.65;
    droplet(ctx,origin[0]+vx*u,origin[1]+vy*u+u*u*1.05,.025+random(s+4)*.055,c,envelope(u));
  }
};
export const waterPhysical:Draw=(ctx,ms,seed,c)=>{
  shock(ctx,ms,65,c,.93,.85);
  const contact=age(ms,75,330);
  if(live(contact)) {
    ctx.save();ctx.scale(1,1-.25*ease(contact));
    texture(ctx,'splash',0,.06,1.1+ease(contact)*.36,0,envelope(contact)*.88);ctx.restore();
  }
  for(let i=0;i<7;i++){
    const u=age(ms,65+i*11,270);if(!live(u))continue;
    const a=i*TAU/7,curve=(p:number):Point=>[Math.cos(a)*p*.85,Math.sin(a)*p*.65-p*(1-p)*.3];
    ribbon(ctx,curve,u*1.4,.55,.085,c.main,envelope(u));ribbon(ctx,curve,u*1.4,.55,.026,c.light,envelope(u));
  }
  spray(ctx,ms,135,seed,c,22,[0,.08],1.2);
};
export const waterSpecial:Draw=(ctx,ms,seed,c)=>{
  // A curling crest is reconstructed at every frame, then collapses into detached foam.
  const u=age(ms,10,650);if(live(u)){
    const rise=ease(u/.32),crash=ease((u-.58)/.33),h=1.35*rise*(1-crash*.88),y=.55;
    withAlpha(ctx,envelope(u)*.94,()=>{
      ctx.translate(-.26+u*.6,0);
      ctx.fillStyle=c.dark;ctx.beginPath();ctx.moveTo(-.85,y);
      ctx.bezierCurveTo(-1,y-h*.7,-.67,y-h*1.17,-.08,y-h);
      ctx.bezierCurveTo(.64,y-h*.86,.95,y-h*.25,.3,y-h*.25);
      ctx.bezierCurveTo(.55,y-h*.61,-.05,y-h*.83,-.08,y-h*.2);
      ctx.quadraticCurveTo(.18,y-.08,.85,y);ctx.closePath();ctx.fill();
      ctx.fillStyle='#55afd0';ctx.beginPath();ctx.moveTo(-.76,y-.04);
      ctx.bezierCurveTo(-.84,y-h*.66,-.58,y-h*.97,-.1,y-h*.92);
      ctx.bezierCurveTo(.22,y-h*.86,.49,y-h*.63,.48,y-h*.47);
      ctx.bezierCurveTo(.06,y-h*.84,-.27,y-h*.66,-.25,y-h*.18);
      ctx.quadraticCurveTo(-.05,y-.05,.7,y-.04);ctx.closePath();ctx.fill();
      for(let i=0;i<10;i++){
        const a=-2.7+i*.24,x=-.13+Math.cos(a)*(.6-crash*.13),py=y-h*.49+Math.sin(a)*h*.5;
        oval(ctx,x,py,.075+Math.sin(i+ms*.02)*.018,.052,c.light);
      }
      for(let i=0;i<4;i++)path(ctx,[[-.64+i*.105,y-.12],[-.64+i*.06,y-h*.45],[-.43+i*.08,y-h*.66]],'#d2faff',.015,.65);
    });
  }
  spray(ctx,ms,300,seed,c,24,[.12,.34],1.15);
  for(let i=0;i<3;i++){const v=age(ms,375+i*60,240);if(live(v))ring(ctx,0,.54,.2+ease(v)*.66,c.main,.027,envelope(v)*.7,.22);}
};
export const waterStatus:Draw=(ctx,ms,_seed,c)=>{
  for(let j=0;j<3;j++){
    const u=age(ms,20+j*110,470);if(!live(u))continue;
    const curve=(p:number):Point=>{const a=p*TAU*1.35+ms*.002+j;return [Math.cos(a)*(.45+p*.23),.45-p*.85+Math.sin(a)*.16];};
    ribbon(ctx,curve,clamp(u*1.6),.42,.055,c.main,envelope(u)*.82);
    ribbon(ctx,curve,clamp(u*1.6),.42,.018,c.light,envelope(u));
  }
  for(let i=0;i<12;i++){
    const u=age(ms,40+i*40,250);if(!live(u))continue;
    const a=i*2.4+u*2;droplet(ctx,Math.cos(a)*.58,.43-u*.82+Math.sin(a)*.2,.035,c,envelope(u));
  }
};
/** Piecewise electrical channels use stepped time so branches flicker, never swim. */
const bolt=(ctx:Ctx,from:Point,to:Point,seed:number,ms:number,c:Colors,width:number,a:number)=>{
  const frame=Math.floor(ms/55),points:Point[]=[];
  for(let i=0;i<=8;i++){
    const u=i/8,j=i===0||i===8?0:(random(seed+frame*31+i*47)-.5)*.25;
    points.push([from[0]+(to[0]-from[0])*u+j,from[1]+(to[1]-from[1])*u]);
  }
  path(ctx,points,c.main,width*2,a*.5);path(ctx,points,c.light,width,a);
  if(random(seed+7)>.3) {
    const mid=points[3],sign=random(seed+11)>.5?1:-1;
    path(ctx,[mid,[mid[0]+sign*.11,mid[1]+.09],[mid[0]+sign*.075,mid[1]+.14],
      [mid[0]+sign*.2,mid[1]+.24]],c.main,width*.5,a*.7);
  }
};
export const electricPhysical:Draw=(ctx,ms,seed,c)=>{
  shock(ctx,ms,70,c,.88,.87);
  for(let i=0;i<10;i++){
    const u=age(ms,60+random(seed+i*71)*195,235);if(!live(u))continue;const a=i*TAU/10;
    bolt(ctx,[Math.cos(a)*.14,Math.sin(a)*.14],[Math.cos(a)*(.22+u*.75),Math.sin(a)*(.22+u*.75)],seed+i*51,ms,c,.025,envelope(u));
  }
  for(let i=0;i<8;i++){const u=age(ms,250+i*25,160);if(live(u))spark(ctx,(random(seed+i)-.5)*1.3,(random(seed+i+2)-.5)*1.2,.06,c.light,envelope(u));}
};
export const electricSpecial:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<4;i++){
    const u=age(ms,45+i*105,180);if(!live(u))continue;
    const x=(random(seed+i*41)-.5)*.65,endpoint:Point=[x*.5,.37];
    bolt(ctx,[x-.16,-1.1],endpoint,seed+i*97,ms,c,.052,envelope(u));
    halo(ctx,...endpoint,.34,c.light,envelope(u)*.37);
    for(let j=0;j<3;j++)bolt(ctx,endpoint,[endpoint[0]+(j-1)*.33,.53],seed+j*41,ms,c,.022,envelope(u));
  }
  for(let i=0;i<2;i++) {
    const u=age(ms,100+random(seed+i*73)*300,140);if(!live(u))continue;
    const x=(i?1:-1)*(.35+random(seed+i*41)*.3);
    bolt(ctx,[x,-.85],[x*.5,.25],seed+i*313,ms,c,.022,envelope(u));
  }

};
export const electricStatus:Draw=(ctx,ms,seed,c)=>{
  for(let j=0;j<4;j++){
    const u=age(ms,j*115,340);if(!live(u))continue;
    const r=.15+ease(u)*.76,pts:Point[]=[],frame=Math.floor(ms/60);
    for(let i=0;i<=32;i++){
      const a=i*TAU/32,rr=r*(1+(random(seed+frame*13+(i%32)*17)-.5)*.13);
      pts.push([Math.cos(a)*rr,Math.sin(a)*rr*.78]);
    }
    path(ctx,pts,c.main,.055,envelope(u)*.6);path(ctx,pts,c.light,.024,envelope(u));
    for(let i=0;i<3;i++){const a=i*TAU/3+j;bolt(ctx,[Math.cos(a)*r*.7,Math.sin(a)*r*.56],[Math.cos(a)*r,Math.sin(a)*r*.8],seed+i,ms,c,.012,envelope(u));}
  }
};
