import { age,live,envelope,ease,random,TAU,withAlpha,path,poly,ring,shock,spark,part,debris,halo,clamp } from './parts';
import type { Draw,Point } from './parts';

export const groundPhysical:Draw=(ctx,ms,seed,c)=>{
  // Cracks propagate from the strike. Branches start only after their parent reaches them.
  for(let i=0;i<7;i++){
    const a=i*TAU/7+random(seed+i)*.35, u=age(ms,95+i*9,440);if(!live(u))continue;
    const reach=ease(u*1.8), points:Point[]=[];
    for(let j=0;j<=8;j++) {const d=j/8*reach;points.push([Math.cos(a)*d+(random(seed+i*17+j)-.5)*.12*d, .12+Math.sin(a)*d*.6]);}
    path(ctx,points,c.dark,.045,envelope(u));path(ctx,points,c.light,.012,envelope(u));
    if(u>.2) {const p=points[5];path(ctx,[p,[p[0]+Math.cos(a+.7)*.3*reach,p[1]+Math.sin(a+.7)*.22*reach]],c.dark,.024,envelope(u));}
  }
  shock(ctx,ms,105,c,1.08,.58);debris(ctx,ms,130,seed,c,'rock',15,[0,.14],.8);
};
export const groundSpecial:Draw=(ctx,ms,seed,c)=>{
  // Each mud finger has its own emergence, apex, and collapse; there is no group transform.
  for(let i=0;i<9;i++){
    const s=seed+i*47,u=age(ms,45+i*34,420);if(!live(u))continue;
    const x=(random(s)-.5)*1.3, h=Math.sin(Math.PI*u)*(.5+random(s+2)*.9)*.74,w=.09+random(s+3)*.1;
    withAlpha(ctx,envelope(u),()=>{
      poly(ctx,[[x-w,.53],[x-w*.9,.28-h*.45],[x-.025,.5-h],[x+w*.55,.35-h*.65],[x+w,.53]],c.dark);
      poly(ctx,[[x-w*.4,.49],[x-.02,.52-h*.9],[x+w*.45,.5]],c.main);
      path(ctx,[[x-w*.3,.37],[x-.02,.54-h*.84]],c.light,.025);
    });
    part(ctx,'rock',c,x+Math.sin(i)*u*.2,.5-h-.07,.15+random(s+4)*.13,u*4,envelope(u),i);
  }
  debris(ctx,ms,225,seed,c,'rock',19,[0,.33],1);
};
export const groundStatus:Draw=(ctx,ms,seed,c)=>{
  for(let layer=0;layer<3;layer++){
    const u=age(ms,layer*80,550);if(!live(u))continue;
    // Sand grains form a horizontal eddy then settle under their own gravity.
    for(let i=0;i<34;i++){
      const s=seed+layer*313+i*29,a=i*TAU/34+u*(2+layer),r=.3+layer*.2;
      const x=Math.cos(a)*r,y=.13+Math.sin(a)*r*.4-u*.19+u*u*.18;
      withAlpha(ctx,envelope(u)*(.55+random(s)*.45),()=>{ctx.fillStyle=i%4?c.main:c.light;ctx.fillRect(x,y,.025+random(s+1)*.039,.038);});
    }
    ring(ctx,0,.18,.25+ease(u)*.6,c.main,.028,envelope(u)*.35,.26);
  }
};
export const rockPhysical:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<5;i++){
    const s=seed+i*71,birth=15+i*59,u=age(ms,birth,510);if(!live(u))continue;
    const hit=.43,x=(random(s)-.5)*1.25,size=.37+random(s+1)*.4;
    const y=u<hit?-1.24+Math.pow(u/hit,2)*1.6:.36-Math.sin((u-hit)/(1-hit)*Math.PI)*.23;
    if(u<.62)part(ctx,'rock',c,x,y,size*(1-Math.max(0,u-.43)*1.5),u*.8,envelope(u),i);
    debris(ctx,ms,birth+hit*510,seed+i*167,c,'rock',7,[x,.36],.65);
    const dust=age(ms,birth+220,240);if(live(dust))ring(ctx,x,.45,.04+ease(dust)*.29,c.main,.028,envelope(dust)*.6,.25);
  }
};
export const rockSpecial:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<6;i++){
    const s=seed+i*47,u=age(ms,20+i*17,600);if(!live(u))continue;
    const a=i*TAU/6+random(s)*.2,collapse=ease((u-.46)/.3),r=(.64+random(s+2)*.2)*(1-collapse);
    const x=Math.cos(a)*r,y=Math.sin(a)*r*.65-Math.sin(collapse*Math.PI)*.28;
    const size=(.3+random(s+3)*.22)*(1-ease((u-.73)/.27));
    halo(ctx,x,y,size*.8,'#c3b1ff',envelope(u)*.23);
    part(ctx,'rock',c,x,y,size,a*.25+u*.3,envelope(u),i);
    spark(ctx,x-size*.25,y-size*.23,.065,'#e6d8ff',envelope(u));
  }
  shock(ctx,ms,460,{...c,light:'#e7d7ff'},.76);debris(ctx,ms,450,seed,c,'rock',11,[0,.1],.85);
};
export const rockStatus:Draw=(ctx,ms,seed,c)=>{
  // A loose suspended perimeter: depth changes determine foreground order.
  const stones=Array.from({length:7},(_,i)=>{const a=i*TAU/7+ms*.0012;return {i,a,z:Math.sin(a)};}).sort((a,b)=>a.z-b.z);
  for(const {i,a,z} of stones){
    const u=age(ms,i*22,600);if(!live(u))continue;
    const r=.82*ease(u*4),x=Math.cos(a)*r,y=z*r*.47+Math.sin(ms*.007+i)*.045;
    part(ctx,'rock',c,x,y,(.28+random(seed+i)*.15)*(1+z*.12),a*.3,envelope(u),i);
    spark(ctx,x-.055,y-.06,.045,c.light,envelope(u)*.8);
  }
};
export const steelPhysical:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<3;i++){
    const b=30+i*90,u=age(ms,b,610-i*65);if(!live(u))continue;
    const x=(i-1)*.49+(random(seed+i)-.5)*.25,fall=ease(u*3.6),y=-1.25+fall*(1.36+random(seed+i*31)*.12);
    part(ctx,'metal',c,x,y,1.03+(i===1?.23:0),(i-1)*.17,envelope(u),i);
    if(u>.27&&u<.55)for(let j=0;j<7;j++){
      const a=age(ms,b+165+j*6,200);if(!live(a))continue;
      const dx=(j-3)*.11;path(ctx,[[x+dx*a,.58-a*.24],[x+dx*(a+.2),.59-a*.32]],'#fff0b7',.025,envelope(a));
    }
    const hit=age(ms,b+160,270);if(live(hit))ring(ctx,x,.59,.05+ease(hit)*.36,c.dark,.03,envelope(hit)*.55,.22);
  }
};
export const steelSpecial:Draw=(ctx,ms,seed,c)=>{
  // Three metal flux blades sweep through the same magnetic focus on separate beats.
  for(let i=0;i<3;i++){
    const u=age(ms,30+i*95,440);if(!live(u))continue;
    const angle=i*TAU/3+u*(2.8+random(seed+i)*.8)+random(seed+i*31)*.3,r=.15+Math.sin(u*Math.PI)*(.48+random(seed+i*41)*.22);
    ctx.save();ctx.rotate(angle);
    part(ctx,'metal',c,r,0,.6,u*2,envelope(u),i);
    path(ctx,[[r,-.44],[r,-.7],[r-.15,-.81]],c.light,.025,envelope(u));ctx.restore();
    ring(ctx,0,0,.2+u*.55,c.main,.023,envelope(u)*.5,.52);
  }
  halo(ctx,0,0,.54,c.light,Math.sin(clamp(ms/730)*Math.PI)*.25);
  for(let i=0;i<10;i++){const u=age(ms,230+i*24,260);if(live(u)){const a=i*2.4;spark(ctx,Math.cos(a)*u*.9,Math.sin(a)*u*.65,.04,c.light,envelope(u));}}
};
export const steelStatus:Draw=(ctx,ms,_seed,c)=>{
  const u=age(ms,20,710);if(!live(u))return;
  const build=ease(u*3.5);withAlpha(ctx,envelope(u),()=>{
    const shield:Point[]=[[0,-.78],[.61,-.48],[.53,.35],[0,.79],[-.53,.35],[-.61,-.48]];
    ctx.save();ctx.scale(build,1);poly(ctx,shield,c.dark);
    poly(ctx,[[0,-.65],[.47,-.4],[.4,.3],[0,.63],[-.4,.3],[-.47,-.4]],c.main);
    poly(ctx,[[0,-.6],[0,.55],[-.34,.26],[-.39,-.36]],'#9ab7c1');
    path(ctx,[[0,-.56],[0,.55]],c.light,.024);
    // The highlight travels over the shield surface, clipped to its silhouette.
    ctx.beginPath();shield.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
    const sx=-1.15+clamp((u-.27)/.53)*2.4;
    poly(ctx,[[sx-.2,-1],[sx+.02,-1],[sx+.8,1],[sx+.58,1]],'#d9f7ff');ctx.restore();
    spark(ctx,.38,.26,.075,c.light,Math.sin(clamp((u-.5)*3)*Math.PI));
  });
};
export const icePhysical:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<8;i++){
    const s=seed+i*53,b=10+i*39,u=age(ms,b,340);if(!live(u))continue;
    const x=(random(s)-.5)*1.38,hit=clamp(u/.63),y=-1.15+hit*hit*1.55;
    if(u<.71)part(ctx,'shard',c,x,y,.29+random(s+1)*.42,-.2,envelope(u),i);
    debris(ctx,ms,b+210,s,c,'shard',6,[x,.37],.6);
  }
};
export const iceSpecial:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<7;i++){
    const u=age(ms,45+i*32,490);if(!live(u))continue;
    const a=i*TAU/7,build=ease(u*3),fracture=ease((u-.66)/.34);
    ctx.save();ctx.translate(Math.cos(a)*(.2+fracture*.6),Math.sin(a)*(.2+fracture*.6));ctx.rotate(a+Math.PI/2);
    part(ctx,'shard',c,0,-.14*build,(.73+random(seed+i)*.25)*build*(1-fracture*.65),fracture*.5,envelope(u),i);ctx.restore();
  }
  halo(ctx,0,0,.7,'#b5faff',envelope(age(ms,70,620))*.2);
  debris(ctx,ms,410,seed,c,'shard',18,[0,0],1);
};
export const iceStatus:Draw=(ctx,ms,_seed,c)=>{
  const u=age(ms,20,710);if(!live(u))return;const grow=ease(u*2.8),a=envelope(u);
  withAlpha(ctx,a,()=>{
    ctx.save();ctx.translate(0,.42);ctx.scale(1,grow);ctx.translate(0,-.42);
    poly(ctx,[[-.62,-.44],[-.34,-.72],[.63,-.72],[.63,.36],[.36,.64],[-.62,.64]],'#6fbace');
    withAlpha(ctx,.8,()=>poly(ctx,[[-.56,-.39],[.36,-.39],[.36,.58],[-.56,.58]],'#d6fbfc'));
    poly(ctx,[[-.62,-.44],[-.34,-.72],[.63,-.72],[.36,-.44]],'#ecffff');
    path(ctx,[[.36,.64],[.36,-.44],[.63,-.72]],c.dark,.025);
    path(ctx,[[-.45,.42],[-.45,-.25],[-.25,-.25]],'#ffffff',.075);ctx.restore();
  });
  // Frost branches grow from the corners before they evaporate.
  for(let i=0;i<6;i++){const v=age(ms,100+i*50,350);if(!live(v))continue;
    const a=i*TAU/6,x=Math.cos(a)*.68,y=Math.sin(a)*.65;
    path(ctx,[[x,y],[x*.74,y*.74]],c.light,.022,envelope(v));spark(ctx,x,y,.055,c.light,envelope(v));}
};
