import {age,live,envelope,ease,random,TAU,withAlpha,path,oval,ring,spark,part,debris,ribbon,slash,clamp} from './parts';
import type {Draw,Point,Ctx} from './parts';
import type {Colors} from '../matrixVfxKit';

/** The inner root stays fixed while the outer wing tip sweeps through an arc. */
const wing=(ctx:Ctx,c:Colors,x:number,y:number,size:number,angle:number,side:number,a:number)=>{
  ctx.save();ctx.translate(x,y);ctx.scale(side*size,size);ctx.rotate(angle);
  part(ctx,'wing',c,.48,-.39,1.2,0,a);ctx.restore();
};
export const flyingPhysical:Draw=(ctx,ms,seed,c)=>{
  const u=age(ms,10,500);if(live(u)){
    const strike=ease((u-.12)/.36);
    wing(ctx,c,-.89,-.42,1,-.12+strike*1.37,1,envelope(u));
  }
  debris(ctx,ms,205,seed,c,'feather',17,[.2,.15],.65);
};
export const flyingSpecial:Draw=(ctx,ms,seed,c)=>{
  // Curved air sheets sweep left-to-right; feathers get entrained in the same flow.
  for(let i=0;i<5;i++){
    const u=age(ms,30+i*64,340);if(!live(u))continue;
    const curve=(p:number):Point=>[-1.1+p*2.2,(i-2)*.18+Math.sin(p*TAU+i*.6)*.19];
    ribbon(ctx,curve,u*1.6,.7,.12-i*.012,c.main,envelope(u)*.68);
    ribbon(ctx,curve,u*1.6,.7,.045,c.light,envelope(u));
  }
  for(let i=0;i<10;i++){
    const s=seed+i*53,u=age(ms,85+i*37,300);if(!live(u))continue;
    part(ctx,'feather',c,-1.04+u*2.05,(random(s)-.5)*1.05+Math.sin(u*6+i)*.12,
      .12+random(s+2)*.09,-.9+u*2,envelope(u),i);
  }
};
export const flyingStatus:Draw=(ctx,ms,seed,c)=>{
  const u=age(ms,10,720);if(!live(u))return;
  const lift=ease(u*2.8),angle=.8-lift*.95;
  for(const side of [-1,1]) {
    wing(ctx,c,side*.11,.25,.68,angle,side,envelope(u));
    const x=side*(.11+.68*(1.02*Math.cos(angle)+.81*Math.sin(angle)));
    const y=.25+.68*(1.02*Math.sin(angle)-.81*Math.cos(angle));
    debris(ctx,ms,205,seed+(side+1)*71,c,'feather',6,[x,y+.2],.35);
  }
};

export const bugPhysical:Draw=(ctx,ms,seed,c)=>{
  const sharp={...c,main:'#93be39',light:'#f6ffd4'};
  slash(ctx,ms,20,.74,sharp,.075,[0,0],1.2);slash(ctx,ms,125,-.74,sharp,.075,[0,0],1.2);
  for(let i=0;i<20;i++){
    const u=age(ms,175+random(seed+i)*95,290);if(!live(u))continue;
    const a=i*TAU/12;
    part(ctx,'shard',sharp,Math.cos(a)*u*.93,Math.sin(a)*u*.67,.11*(1-u*.5),a+u*2,envelope(u),i);
  }
};
export const bugSpecial:Draw=(ctx,ms,_seed,_c)=>{
  // An amber insect pulse: concentric serrated membranes beat, shed flecks, and break apart.
  const amber={main:'#9ba822',light:'#faffad',dark:'#4f692b'};
  for(let j=0;j<3;j++){
    const u=age(ms,40+j*130,380);if(!live(u))continue;
    const pts:Point[]=[];
    for(let i=0;i<=64;i++){
      const a=i*TAU/64,r=(.15+ease(u)*.8)*(1+.08*Math.sin(a*12-ms*.023));
      pts.push([Math.cos(a)*r,Math.sin(a)*r*.7]);
    }
    path(ctx,pts,amber.dark,.07,envelope(u)*.7);path(ctx,pts,amber.light,.025,envelope(u));
  }
  for(let i=0;i<20;i++){
    const u=age(ms,90+i*22,230),a=i*2.4+ms*.002;if(!live(u))continue;
    const x=Math.cos(a)*(.15+u*.8),y=Math.sin(a)*(.1+u*.56);
    path(ctx,[[x-.035,y],[x,y-.025],[x+.035,y]],i%2?amber.main:amber.light,.028,envelope(u));
  }
};
export const bugStatus:Draw=(ctx,ms,_seed,c)=>{
  const u=age(ms,10,720);if(!live(u))return;
  const r=.85*ease(u*3),a=envelope(u);
  const point=(i:number,layer:number):Point=>{
    const theta=i*TAU/8+.13, wobble=Math.sin(ms*.02+i*2+layer)*.05*(1-ease((u-.3)*2));
    return [Math.cos(theta)*(r+wobble)*layer/3,Math.sin(theta)*(r+wobble)*layer/3*.78];
  };
  for(let i=0;i<8;i++)path(ctx,[[0,0],point(i,3)],'#677647',.025,a);
  for(let layer=1;layer<=3;layer++){
    // Every span sags inward, then springs taut at a different moment.
    const reveal=clamp((ms-45-layer*42)/240),points:Point[]=[];
    for(let step=0;step<=64*reveal;step++){
      const segment=Math.floor(step/8),q=step%8/8,p=point(segment,layer),next=point(segment+1,layer);
      const sag=1-Math.sin(q*Math.PI)*(.17+Math.sin(ms*.014+layer)*.03);
      points.push([(p[0]*(1-q)+next[0]*q)*sag,(p[1]*(1-q)+next[1]*q)*sag]);
    }
    if(points.length>1){path(ctx,points,c.dark,.045,a*.55);path(ctx,points,'#f3f5ca',.023,a);}
  }
  for(let i=0;i<8;i++){const v=age(ms,170+i*41,250);if(live(v)){const [x,y]=point(i,2);spark(ctx,x,y,.045,c.light,envelope(v));}}
};
export const grassPhysical:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<12;i++){
    const s=seed+i*59,u=age(ms,15+i*33,265);if(!live(u))continue;
    const y=(random(s)-.5)*1.25,curve=(p:number):Point=>[-1.12+p*2.28,y-Math.sin(p*Math.PI)*.28];
    ribbon(ctx,curve,u,.32,.017,c.light,envelope(u)*.65);
    const [x,py]=curve(u);part(ctx,'leaf',c,x,py,.25+random(s+2)*.18,.8+u*1.3,envelope(u),i);
  }
};
export const grassSpecial:Draw=(ctx,ms,seed,c)=>{
  const u=age(ms,30,670);if(!live(u))return;
  const focus=1-ease((u-.22)/.76),width=.03+.69*focus;
  // Ground pressure sits behind the column; contact spray stays in front.
  for(let front=0;front<3;front++) {
    const v=age(ms,110+front*100,330);if(!live(v))continue;
    ring(ctx,0,.31,.15+ease(v)*.96,c.main,.075,envelope(v)*.8,.35);
    ring(ctx,0,.31,.15+ease(v)*.96,'#f4ffc8',.027,envelope(v),.35);
  }
  // A bright column contracts; individual helical sparks continue after its center closes.
  withAlpha(ctx,envelope(u)*.88,()=>{
    const g=ctx.createLinearGradient(-width,0,width,0);g.addColorStop(0,'transparent');g.addColorStop(.25,'#78c95e');g.addColorStop(.43,'#eaffaf');g.addColorStop(.5,'#ffffee');g.addColorStop(.57,'#eaffaf');g.addColorStop(.75,'#78c95e');g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(-width,-1.03,width*2,1.34);
  });
  for(let i=0;i<17;i++){
    const v=age(ms,20+i*28,230);if(!live(v))continue;
    const a=i*2.4+v*5,r=.22+focus*.54;
    spark(ctx,Math.cos(a)*r,.31-v*1.34,.045+random(seed+i)*.025,i%2?c.light:'#a3de56',envelope(v));
  }
  // The broad beam hits a ground-level bloom; expanding fronts and spray carry its scale.
  const contact=age(ms,100,560);
  if(live(contact)) {
    oval(ctx,0,.31,.22+Math.sin(contact*Math.PI)*.62,.13,c.light,envelope(contact)*.9);
    for(let i=0;i<26;i++) {
      const key=seed+i*67,v=age(ms,115+random(key)*260,265);if(!live(v))continue;
      const a=i*2.4,x=Math.cos(a)*v*(.75+random(key+1)*.55);
      const y=.31-Math.sin(v*Math.PI)*(.22+random(key+2)*.48)+Math.sin(a)*v*.22;
      spark(ctx,x,y,.045+random(key+3)*.045,i%3?c.light:'#b3ee61',envelope(v));
    }
  }

};
export const grassStatus:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<27;i++){
    const s=seed+i*37,u=age(ms,5+i*12,410+random(s)*140);if(!live(u))continue;
    const theta=i*2.4+u*4.1,x=Math.cos(theta)*(.25+random(s+2)*.54),y=-.8+u*1.28;
    if(i%4===0)part(ctx,'leaf',c,x,y,.12+random(s+3)*.07,theta,envelope(u),i);
    else {oval(ctx,x,y,.022+random(s+4)*.018,.032,i%3?c.light:'#97c66c',envelope(u));
      if(i%3===0)path(ctx,[[x,y],[x+.015,y-.09]],c.main,.013,envelope(u)*.4);}
  }
  for(let i=0;i<3;i++){const u=age(ms,210+i*110,290);if(live(u))ring(ctx,0,.5,.2+u*.55,c.main,.016,envelope(u)*.3,.28);}
};
