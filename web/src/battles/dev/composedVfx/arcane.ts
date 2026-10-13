import {age,live,envelope,ease,random,TAU,withAlpha,path,oval,ring,shock,spark,part,debris,halo,ribbon,slash,clamp,texture} from './parts';
import type {Draw,Point,Ctx} from './parts';
import type {Colors} from '../matrixVfxKit';

export const normalSpecial:Draw=(ctx,ms,_seed,c)=>{
  for(let i=0;i<4;i++){
    const u=age(ms,20+i*57,410);if(!live(u))continue;
    const curve=(p:number):Point=>{const a=i*TAU/4+p*TAU*1.1,r=.85*(1-p)+.07;return [Math.cos(a)*r,Math.sin(a)*r*.8];};
    ribbon(ctx,curve,u*1.25,.46,.12,c.dark,envelope(u)*.7);
    ribbon(ctx,curve,u*1.25,.46,.07,c.light,envelope(u));
  }
  const peak=age(ms,260,350);if(live(peak)){
    halo(ctx,0,0,.24+peak*.54,'#fff2d5',envelope(peak)*.55);
    for(let i=0;i<6;i++){const a=i*TAU/6; spark(ctx,Math.cos(a)*peak*.86,Math.sin(a)*peak*.65,.06*(1-peak*.5),c.light,envelope(peak),a);}
  }
  shock(ctx,ms,350,c,.7,.84);
};
export const normalStatus:Draw=(ctx,ms,seed,c)=>{
  // A quiet protective contour draws itself; two soft pulses breathe inside it.
  const u=age(ms,20,690);if(!live(u))return;
  const contour=(p:number):Point=>[Math.cos(p*TAU-Math.PI/2)*.71,Math.sin(p*TAU-Math.PI/2)*.84];
  ribbon(ctx,contour,clamp(u*3),1,.045,c.dark,envelope(u)*.68);
  ribbon(ctx,contour,clamp(u*3),1,.025,c.light,envelope(u));
  for(let i=0;i<2;i++){const v=age(ms,190+i*190,270);if(live(v)){
    oval(ctx,0,0,.3+v*.28,.43+v*.24,c.light,envelope(v)*.13);
    ring(ctx,0,0,.3+v*.26,c.light,.027,envelope(v)*.6,1.15);
  }}
  for(let i=0;i<7;i++) {const v=age(ms,95+i*58,270);if(live(v))spark(ctx,(random(seed+i*73)-.5)*1.04,.45-v*.96,.045,c.light,envelope(v));}
};
export const psychicPhysical:Draw=(ctx,ms,_seed,c)=>{
  const u=age(ms,5,570);if(live(u)){
    const split=ease((u-.38)/.4),a=envelope(u),size=1.21;
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*split*.28,split*.08);ctx.rotate(side*split*.16);
      ctx.beginPath();ctx.rect(side<0?-1:0,-1,1,2);ctx.clip();
      part(ctx,'brain',c,0,0,size,0,a);ctx.restore();
    }
  }
  slash(ctx,ms,125,-.82,{...c,light:'#fff2fa',main:'#f294c8'},.073,[0,0],1.14);
  for(let i=0;i<10;i++){const u=age(ms,240+i*17,240);if(live(u)){const a=i*2.4;spark(ctx,Math.cos(a)*u*.9,Math.sin(a)*u*.7,.035,c.light,envelope(u));}}
};
export const psychicSpecial:Draw=(ctx,ms,seed,c)=>{
  for(let j=0;j<7;j++){
    const u=age(ms,15+j*47+random(seed+j*43)*25,410+random(seed+j*71)*90);if(!live(u))continue;
    const points:Point[]=[],r=.12+ease(u)*(.8+random(seed+j)*.16);
    for(let i=0;i<=72;i++){
      const a=i*TAU/72,warp=Math.sin(a*5-ms*.013+j)*.065*(1-u*.4);
      points.push([Math.cos(a)*(r+warp),Math.sin(a)*(r+warp)*.82]);
    }
    path(ctx,points,c.dark,.10,envelope(u)*.3);path(ctx,points,j%2?c.light:c.main,.058,envelope(u)*.88);
  }
  halo(ctx,0,0,.67,c.main,envelope(age(ms,60,620))*.12);
};
export const psychicStatus:Draw=(ctx,ms,_seed,c)=>{
  const u=age(ms,15,710);if(!live(u))return;
  const open=ease(u*4)*(1-ease((u-.83)/.17));
  withAlpha(ctx,envelope(u),()=>{
    ctx.save();ctx.scale(1,Math.max(.01,open));
    ctx.fillStyle=c.dark;ctx.beginPath();ctx.moveTo(-.68,0);ctx.quadraticCurveTo(0,-.66,.68,0);ctx.quadraticCurveTo(0,.66,-.68,0);ctx.fill();
    ctx.fillStyle=c.light;ctx.beginPath();ctx.moveTo(-.56,0);ctx.quadraticCurveTo(0,-.48,.56,0);ctx.quadraticCurveTo(0,.48,-.56,0);ctx.fill();
    const scan=Math.sin(ms*.008)*.1;
    oval(ctx,scan,0,.22,.25,c.main);oval(ctx,scan,0,.09,.2,c.dark);oval(ctx,scan-.06,-.09,.05,.05,'#ffffff');ctx.restore();
  });
  for(let i=0;i<3;i++){const v=age(ms,190+i*120,290);if(live(v))ring(ctx,0,0,.39+v*.55,c.main,.035,envelope(v)*.65,.79);}
};
/** Multiple evolving lobes make a fog bank; each lobe has a different lifespan and drift. */
const fog=(ctx:Ctx,ms:number,seed:number,c:Colors,cutAt=Infinity)=>{
  for(let i=0;i<11;i++){
    const s=seed+i*71,u=age(ms,random(s)*100+i*9,440+random(s+1)*100);if(!live(u))continue;
    const disperse=ease((ms-cutAt)/260),dir=i%2?1:-1;
    const x=(random(s+2)-.5)*1.05+dir*u*.13+dir*disperse*.64;
    const y=(random(s+3)-.5)*.74+Math.sin(u*4+i)*.1+disperse*(random(s+4)-.5)*.7;
    const size=(.24+random(s+5)*.2)*(1+u*.3);
    halo(ctx,x,y,size,c.dark,envelope(u)*.19*(1-disperse));
    oval(ctx,x,y,size*.73,size*.48,i%2?c.main:c.dark,envelope(u)*.2*(1-disperse));
  }
};
export const ghostPhysical:Draw=(ctx,ms,seed,c)=>{
  fog(ctx,ms,seed,c,270);
  slash(ctx,ms,225,-.68,{...c,main:'#926ad2',light:'#eee0ff'},.085,[0,0],1.19);
  for(let i=0;i<10;i++){
    const u=age(ms,300+i*16,230);if(!live(u))continue;
    const dir=i%2?1:-1,x=dir*u*(.35+random(seed+i)*.65),y=(i-5)*.085-u*.2;
    ribbon(ctx,p=>[x-p*.17,y+p*.1],1,.8,.025,c.main,envelope(u)*.6);
  }
};
export const ghostSpecial:Draw=(ctx,ms,_seed,c)=>{
  for(let i=0;i<15;i++) {
    const u=age(ms,15+i*16,295);if(!live(u))continue;
    const a=i*2.4+u*.8,r=1-ease(u),x=Math.cos(a)*r,y=Math.sin(a)*r*.79;
    halo(ctx,x,y,.105,c.main,envelope(u)*.7);oval(ctx,x,y,.034,.044,c.light,envelope(u));
  }
  const u=age(ms,65,660);if(!live(u))return;
  const gather=ease(u/.58),burst=ease((u-.61)/.39),r=(.08+gather*.5)*(1-burst*.58);
  halo(ctx,0,0,r*1.24,'#8a6cbc',envelope(u)*(1-burst)*.65);
  for(let i=0;i<10;i++) {
    const angle=i*TAU/10+ms*.003,spread=r*.44+burst*.72;
    const x=Math.cos(angle)*spread,y=Math.sin(angle)*spread*.82;
    const size=r*(.52+Math.sin(ms*.011+i)*.075)*(1-burst*.25);
    halo(ctx,x,y,size*1.2,c.main,envelope(u)*.3);
    oval(ctx,x,y,size,size*.83,i%3?c.main:c.dark,envelope(u)*(1-burst)*.31);
    const curve=(p:number):Point=>[x+Math.cos(angle+p*2)*size*.7,y+Math.sin(angle+p*2)*size*.55];
    ribbon(ctx,curve,1,1,.024,c.light,envelope(u)*(1-burst)*.3);
  }
};

export const ghostStatus:Draw=(ctx,ms,seed,c)=>{
  fog(ctx,ms+60,seed,c);
  const u=age(ms,50,650);if(!live(u))return;
  const a=envelope(u),bob=Math.sin(ms*.01)*.06;
  // Draw the spirit in horizontal bands whose offsets ripple, including its scalloped tail.
  for(let band=0;band<12;band++){
    const y=-.67+band*.11,offset=Math.sin(ms*.012+band*.6)*(.012+Math.max(0,band-6)*.007);
    ctx.save();ctx.beginPath();ctx.rect(-1,y,2,.115);ctx.clip();
    part(ctx,'ghost',c,offset,bob,1.16,0,a);ctx.restore();
  }
  for(let i=0;i<6;i++){const v=age(ms,200+i*52,250);if(live(v))oval(ctx,(random(seed+i)-.5)*.7,.36-v*.75,.022,.045,c.light,envelope(v)*.6);}
};
export const darkPhysical:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<12;i++) {
    const s=seed+i*47,u=age(ms,10+random(s+4)*410,250);if(!live(u))continue;
    const length=.48+random(s+5)*.8,width=.015+random(s+3)*.01;
    ctx.save();ctx.translate((random(s+1)-.5)*.5,(random(s+2)-.5));ctx.rotate((random(s)-.5)*.10);
    const line=(p:number):Point=>[(-.95+1.9*p)*length,0];
    ribbon(ctx,line,u*1.8,.8,width,c.dark,envelope(u));
    ribbon(ctx,line,u*1.8,.8,width*.32,'#d2bfdc',envelope(u));ctx.restore();
  }
  debris(ctx,ms,260,seed,c,'shard',13,[0,.1],.82);
};

export const darkSpecial:Draw=(ctx,ms,_seed,c)=>{
  // An imploding void shears into outgoing crescents. Its interior never becomes an icon.
  const u=age(ms,20,650);if(!live(u))return;
  const gather=ease(u/.5),release=ease((u-.55)/.45),r=(.1+gather*.45)*(1-release);
  halo(ctx,0,0,r*1.7,c.dark,envelope(u)*.4);oval(ctx,0,0,r,r*.83,c.dark,envelope(u));
  for(let j=0;j<5;j++){
    const v=age(ms,35+j*42,430);if(!live(v))continue;
    const curve=(p:number):Point=>{const a=j*TAU/5+p*4+ms*.003,rr=v<.55?.95-ease(v/.55)*.64:.31+ease((v-.55)/.45)*.65;return [Math.cos(a)*rr,Math.sin(a)*rr*.8];};
    ribbon(ctx,curve,1,.68,.11,c.dark,envelope(v));ribbon(ctx,curve,1,.68,.021,c.light,envelope(v)*.7);
  }
};
export const darkStatus:Draw=(ctx,ms,_seed,c)=>{
  for(let layer=0;layer<7;layer++){
    const u=age(ms,layer*45,440);if(!live(u))continue;
    const dir=layer%2?1:-1;
    for(let i=0;i<8;i++){
      const x=dir*(-.8+u*1.4)+(i-3.5)*.17,y=(layer-3)*.15+Math.sin(u*4+i)*.06;
      halo(ctx,x,y,.38,c.dark,envelope(u)*.16);
      oval(ctx,x,y,.28+Math.sin(ms*.01+i)*.02,.13,c.main,envelope(u)*.15);
    }
    ribbon(ctx,p=>[dir*(-1+p*2), (layer-2)*.17+Math.sin(p*5+ms*.007)*.055],u*1.5,.65,.014,c.light,envelope(u)*.2);
  }
};
export const fairyPhysical:Draw=(ctx,ms,seed,c)=>{
  const bright={...c,light:'#fff8dc',main:'#e6a0cd'},u=age(ms,15,435);
  if(live(u)) {
    const hit=ease(u/.56),x=.83*(1-hit),y=-.83*(1-hit);
    const size=.4*(1-ease((u-.64)/.36));
    spark(ctx,x,y,size,bright.dark,envelope(u),u*.55);spark(ctx,x,y,size*.86,bright.light,envelope(u),u*.55);
    ribbon(ctx,p=>[.85-p*.85,-.85+p*.85],hit,.3,.035,bright.main,envelope(u)*.6);
  }
  shock(ctx,ms,230,bright,.8,.78);
  for(let i=0;i<13;i++) {
    const v=age(ms,245+random(seed+i*41)*95,260);if(!live(v))continue;
    const a=i*2.4;texture(ctx,'star',Math.cos(a)*v*.9,Math.sin(a)*v*.7,.13+random(seed+i)*.06,a,envelope(v));
  }
};

export const fairySpecial:Draw=(ctx,ms,seed,c)=>{
  for(let i=0;i<3;i++){
    const u=age(ms,20+i*110,420);if(!live(u))continue;
    const curve=(p:number):Point=>{const a=i*TAU/3+p*TAU*1.15,r=.15+Math.sin(p*Math.PI)*.67;return [Math.cos(a)*r,Math.sin(a)*r*.83];};
    ribbon(ctx,curve,u*1.25,.43,.065,c.main,envelope(u)*.85);
    ribbon(ctx,curve,u*1.25,.43,.018,'#fff1de',envelope(u));
    const [x,y]=curve(clamp(u*1.25));texture(ctx,'star',x,y,.29,ms*.001,envelope(u));
  }
  for(let i=0;i<15;i++){
    const u=age(ms,130+i*27,240);if(!live(u))continue;
    const a=i*2.4+u*1.5,r=.19+u*.68;
    texture(ctx,'star',Math.cos(a)*r,Math.sin(a)*r*.78,.1+random(seed+i)*.06,a,envelope(u));
  }
};
export const dragonPhysical:Draw=(ctx,ms,seed,c)=>{
  const u=age(ms,20,540);if(live(u)){
    const hit=ease(u/.39),shake=Math.sin(ms*.18)*.045*Math.sin(clamp((u-.35)/.35)*Math.PI);
    part(ctx,'claw',c,shake,-.79+hit*.9,1.58-hit*.31,0,envelope(u));
  }
  shock(ctx,ms,175,c,1,.63);debris(ctx,ms,210,seed,c,'scale',13,[0,.22],.84);
};
export const dragonSpecial:Draw=(ctx,ms,seed,c)=>{
  // A tapered storm funnel: each ribbon has its own rotating phase, width, and height.
  for(let j=0;j<6;j++){
    const u=age(ms,20+j*32,480);if(!live(u))continue;
    const curve=(p:number):Point=>{const y=.65-p*1.37,r=.15+p*.67,a=p*7+ms*.018+j*1.5;return [Math.cos(a)*r,y+Math.sin(a)*r*.21];};
    ribbon(ctx,curve,clamp(u*1.6),.5,.055+j*.004,j%2?c.main:c.dark,envelope(u)*.83);
    ribbon(ctx,curve,clamp(u*1.6),.5,.012,'#a1e9ff',envelope(u)*.75);
  }
  for(let i=0;i<14;i++){
    const u=age(ms,70+i*27,270);if(!live(u))continue;const a=ms*.02+i*2.4,r=.2+u*.64;
    part(ctx,'shard',{...c,light:'#bcf0ff'},Math.cos(a)*r,.63-u*1.3+Math.sin(a)*.1,.065+random(seed+i)*.05,a,envelope(u),i);
  }
  // Ground arcs discharge from the funnel foot, with larger blue sparks and a rotating rim.
  for(let i=0;i<12;i++) {
    const v=age(ms,100+i*38,200);if(!live(v))continue;
    const dir=i%2?1:-1,x=dir*(.12+v*(.75+random(seed+i)*.25));
    const points:Point[]=[[0,.55],[x*.35,.4],[x*.5,.65],[x*.7,.48],[x,.56]];
    path(ctx,points,'#508af0',.065,envelope(v));path(ctx,points,'#c2faff',.025,envelope(v));
    spark(ctx,x,.56,.065+random(seed+i+12)*.045,'#c2faff',envelope(v));
  }
  const ground=age(ms,95,540);
  if(live(ground))ring(ctx,0,.57,.15+Math.sin(ground*Math.PI)*.48,'#78cfff',.036,envelope(ground)*.8,.28);

};
export const dragonStatus:Draw=(ctx,ms,_seed,c)=>{
  const u=age(ms,10,700);if(!live(u))return;
  const rear=ease((u-.08)/.43),angle=.4-rear*.6;
  // Head and voice share a local coordinate frame: the roar always leaves the open mouth.
  ctx.save();ctx.translate(-.19,.14-rear*.2);ctx.rotate(angle);
  texture(ctx,'dragon',0,0,1.45,0,envelope(u));
  const mouth:Point=[.36,.24];
  for(let j=0;j<3;j++) {
    const v=age(ms,295+j*100,255);if(!live(v))continue;
    const curve=(p:number):Point=>{const a=-.66+p*1.32,r=.04+ease(v)*.69;return [mouth[0]+Math.cos(a)*r,mouth[1]+Math.sin(a)*r*.8];};
    ribbon(ctx,curve,1,1,.045,c.main,envelope(v));ribbon(ctx,curve,1,1,.016,c.light,envelope(v));
  }
  ctx.restore();
};
