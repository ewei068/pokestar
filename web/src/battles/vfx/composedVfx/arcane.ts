import { tileEffectRecipes } from '../recipes/index';
import { arcaneRecipes } from '../recipes/arcane';
import {age,live,envelope,ease,random,TAU,withAlpha,path,oval,ring,shock,spark,part,debris,halo,ribbon,slash,clamp,texture} from './parts';
import type {Draw,Point,Ctx} from './parts';
import type {Colors} from '../math';

export const normalSpecial:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["normal-special"];
  for(let i=0;i<recipe.streamCount;i++){
    const u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const curve=(p:number):Point=>{const a=i*TAU/recipe.streamCount+p*TAU*1.1,r=recipe.spiralRadius*(1-p)+recipe.innerRadius;return [Math.cos(a)*r,Math.sin(a)*r*.8];};
    ribbon(ctx,curve,u*1.25,.46,recipe.width,c.dark,envelope(u)*.7);
    ribbon(ctx,curve,u*1.25,.46,recipe.highlightWidth,c.light,envelope(u));
  }
  const peak=age(ms,recipe.peakStartMs,recipe.peakLifetimeMs);if(live(peak)){
    halo(ctx,0,0,.24+peak*.54,'#fff2d5',envelope(peak)*.55);
    for(let i=0;i<recipe.sparkCount;i++){const a=i*TAU/recipe.sparkCount; spark(ctx,Math.cos(a)*peak*.86,Math.sin(a)*peak*.65,.06*(1-peak*.5),c.light,envelope(peak),a);}
  }
  shock(ctx,ms,recipe.pressureStartMs,c,.7,.84);
};
export const normalStatus:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["normal-status"];
  // A quiet protective contour draws itself; two soft pulses breathe inside it.
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const contour=(p:number):Point=>[Math.cos(p*TAU-Math.PI/2)*.71,Math.sin(p*TAU-Math.PI/2)*.84];
  ribbon(ctx,contour,clamp(u*3),1,recipe.width,c.dark,envelope(u)*.68);
  ribbon(ctx,contour,clamp(u*3),1,recipe.highlightWidth,c.light,envelope(u));
  for(let i=0;i<recipe.pulseCount;i++){const v=age(ms,recipe.pulseStartMs+i*recipe.pulseStaggerMs,recipe.pulseLifetimeMs);if(live(v)){
    oval(ctx,0,0,.3+v*.28,.43+v*.24,c.light,envelope(v)*.13);
    ring(ctx,0,0,.3+v*.26,c.light,.027,envelope(v)*.6,1.15);
  }}
  for(let i=0;i<recipe.sparkCount;i++) {const v=age(ms,recipe.sparkStartMs+i*recipe.sparkStaggerMs,recipe.sparkLifetimeMs);if(live(v))spark(ctx,(random(seed+i*73)-.5)*1.04,.45-v*.96,.045,c.light,envelope(v));}
};
export const psychicPhysical:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["psychic-physical"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(live(u)){
    const split=ease((u-recipe.splitStart)/recipe.splitDuration),a=envelope(u),size=recipe.size;
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*split*.28,split*.08);ctx.rotate(side*split*.16);
      ctx.beginPath();ctx.rect(side<0?-1:0,-1,1,2);ctx.clip();
      part(ctx,recipe.brainPart,c,0,0,size,0,a);ctx.restore();
    }
  }
  slash(ctx,ms,recipe.cutStartMs,recipe.cutAngle,{...c,light:'#fff2fa',main:'#f294c8'},recipe.cutWidth,[0,0],recipe.cutLength);
  for(let i=0;i<recipe.sparkCount;i++){const u=age(ms,recipe.sparkStartMs+i*recipe.sparkStaggerMs,recipe.sparkLifetimeMs);if(live(u)){const a=i*2.4;spark(ctx,Math.cos(a)*u*.9,Math.sin(a)*u*.7,.035,c.light,envelope(u));}}
};
export const psychicSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["psychic-special"];
  for(let j=0;j<recipe.waveCount;j++){
    const u=age(ms,recipe.startMs+j*recipe.staggerMs+random(seed+j*43)*recipe.birthJitterMs,recipe.lifetimeMs+random(seed+j*71)*recipe.lifetimeJitterMs);if(!live(u))continue;
    const points:Point[]=[],r=recipe.startRadius+ease(u)*(recipe.growth+random(seed+j)*recipe.growthJitter);
    for(let i=0;i<=72;i++){
      const a=i*TAU/72,warp=Math.sin(a*5-ms*.013+j)*recipe.warp*(1-u*.4);
      points.push([Math.cos(a)*(r+warp),Math.sin(a)*(r+warp)*.82]);
    }
    path(ctx,points,c.dark,recipe.width,envelope(u)*.3);path(ctx,points,j%2?c.light:c.main,recipe.highlightWidth,envelope(u)*.88);
  }
  halo(ctx,0,0,.67,c.main,envelope(age(ms,60,620))*.12);
};
export const psychicStatus:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["psychic-status"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const open=ease(u*recipe.openSpeed)*(1-ease((u-recipe.closeStart)/recipe.closeDuration));
  withAlpha(ctx,envelope(u),()=>{
    ctx.save();ctx.scale(1,Math.max(.01,open));
    ctx.fillStyle=c.dark;ctx.beginPath();ctx.moveTo(-.68,0);ctx.quadraticCurveTo(0,-.66,.68,0);ctx.quadraticCurveTo(0,.66,-.68,0);ctx.fill();
    ctx.fillStyle=c.light;ctx.beginPath();ctx.moveTo(-.56,0);ctx.quadraticCurveTo(0,-.48,.56,0);ctx.quadraticCurveTo(0,.48,-.56,0);ctx.fill();
    const scan=Math.sin(ms*recipe.scanSpeed)*recipe.scanDistance;
    oval(ctx,scan,0,.22,.25,c.main);oval(ctx,scan,0,.09,.2,c.dark);oval(ctx,scan-.06,-.09,.05,.05,'#ffffff');ctx.restore();
  });
  for(let i=0;i<recipe.ringCount;i++){const v=age(ms,recipe.ringStartMs+i*recipe.ringStaggerMs,recipe.ringLifetimeMs);if(live(v))ring(ctx,0,0,.39+v*.55,c.main,.035,envelope(v)*.65,.79);}
};
/** Multiple evolving lobes make a fog bank; each lobe has a different lifespan and drift. */
const fog=(ctx:Ctx,ms:number,seed:number,c:Colors,cutAt=Infinity)=>{
  const recipe = arcaneRecipes.fog;
  for(let i=0;i<recipe.lobeCount;i++){
    const s=seed+i*71,u=age(ms,random(s)*recipe.birthJitterMs+i*recipe.staggerMs,recipe.lifetimeMs+random(s+1)*recipe.lifetimeJitterMs);if(!live(u))continue;
    const disperse=ease((ms-cutAt)/recipe.disperseDurationMs),dir=i%2?1:-1;
    const x=(random(s+2)-.5)*recipe.spreadX+dir*u*.13+dir*disperse*.64;
    const y=(random(s+3)-.5)*recipe.spreadY+Math.sin(u*4+i)*.1+disperse*(random(s+4)-.5)*.7;
    const size=(recipe.size+random(s+5)*recipe.sizeJitter)*(1+u*.3);
    halo(ctx,x,y,size,c.dark,envelope(u)*recipe.haloOpacity*(1-disperse));
    oval(ctx,x,y,size*.73,size*.48,i%2?c.main:c.dark,envelope(u)*recipe.bodyOpacity*(1-disperse));
  }
};
export const ghostPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["ghost-physical"];
  fog(ctx,ms,seed,c,recipe.disperseMs);
  slash(ctx,ms,recipe.cutStartMs,recipe.cutAngle,{...c,main:'#926ad2',light:'#eee0ff'},recipe.cutWidth,[0,0],recipe.cutLength);
  for(let i=0;i<recipe.wispCount;i++){
    const u=age(ms,recipe.wispStartMs+i*recipe.wispStaggerMs,recipe.wispLifetimeMs);if(!live(u))continue;
    const dir=i%2?1:-1,x=dir*u*(.35+random(seed+i)*.65),y=(i-5)*.085-u*.2;
    ribbon(ctx,p=>[x-p*.17,y+p*.1],1,.8,recipe.wispWidth,c.main,envelope(u)*.6);
  }
};
export const ghostSpecial:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["ghost-special"];
  for(let i=0;i<recipe.moteCount;i++) {
    const u=age(ms,recipe.moteStartMs+i*recipe.moteStaggerMs,recipe.moteLifetimeMs);if(!live(u))continue;
    const a=i*2.4+u*.8,r=1-ease(u),x=Math.cos(a)*r,y=Math.sin(a)*r*.79;
    halo(ctx,x,y,.105,c.main,envelope(u)*.7);oval(ctx,x,y,.034,.044,c.light,envelope(u));
  }
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const gather=ease(u/recipe.gatherDuration),burst=ease((u-recipe.burstStart)/recipe.burstDuration),r=(recipe.size+gather*recipe.growth)*(1-burst*.58);
  halo(ctx,0,0,r*1.24,'#8a6cbc',envelope(u)*(1-burst)*.65);
  for(let i=0;i<recipe.lobeCount;i++) {
    const angle=i*TAU/recipe.lobeCount+ms*.003,spread=r*.44+burst*.72;
    const x=Math.cos(angle)*spread,y=Math.sin(angle)*spread*.82;
    const size=r*(.52+Math.sin(ms*.011+i)*.075)*(1-burst*.25);
    halo(ctx,x,y,size*1.2,c.main,envelope(u)*.3);
    oval(ctx,x,y,size,size*.83,i%3?c.main:c.dark,envelope(u)*(1-burst)*.31);
    const curve=(p:number):Point=>[x+Math.cos(angle+p*2)*size*.7,y+Math.sin(angle+p*2)*size*.55];
    ribbon(ctx,curve,1,1,.024,c.light,envelope(u)*(1-burst)*.3);
  }
};

export const ghostStatus:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["ghost-status"];
  fog(ctx,ms+recipe.fogOffsetMs,seed,c);
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const a=envelope(u),bob=Math.sin(ms*recipe.bobSpeed)*recipe.bobHeight;
  // Draw the spirit in horizontal bands whose offsets ripple, including its scalloped tail.
  for(let band=0;band<recipe.bandCount;band++){
    const y=-.67+band*.11,offset=Math.sin(ms*recipe.rippleSpeed+band*.6)*(recipe.rippleStrength+Math.max(0,band-6)*recipe.tailRippleStrength);
    ctx.save();ctx.beginPath();ctx.rect(-1,y,2,.115);ctx.clip();
    texture(ctx,recipe.ghostTexture,offset,bob,recipe.size,0,a);ctx.restore();
  }
  for(let i=0;i<recipe.moteCount;i++){const v=age(ms,recipe.moteStartMs+i*recipe.moteStaggerMs,recipe.moteLifetimeMs);if(live(v))oval(ctx,(random(seed+i)-.5)*.7,.36-v*.75,.022,.045,c.light,envelope(v)*.6);}
};
export const darkPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["dark-physical"];
  for(let i=0;i<recipe.cutCount;i++) {
    const s=seed+i*47,u=age(ms,recipe.startMs+random(s+4)*recipe.birthJitterMs,recipe.lifetimeMs);if(!live(u))continue;
    const length=recipe.length+random(s+5)*recipe.lengthJitter,width=recipe.width+random(s+3)*recipe.widthJitter;
    ctx.save();ctx.translate((random(s+1)-.5)*.5,(random(s+2)-.5));ctx.rotate((random(s)-.5)*recipe.angleJitter);
    const line=(p:number):Point=>[(-.95+1.9*p)*length,0];
    ribbon(ctx,line,u*1.8,.8,width,c.dark,envelope(u));
    ribbon(ctx,line,u*1.8,.8,width*.32,'#d2bfdc',envelope(u));ctx.restore();
  }
  debris(ctx,ms,recipe.debrisStartMs,seed,c,'shard',recipe.debrisCount,[0,.1],.82);
};

export const darkSpecial:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["dark-special"];
  // An imploding void shears into outgoing crescents. Its interior never becomes an icon.
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const gather=ease(u/recipe.gatherDuration),release=ease((u-recipe.releaseStart)/recipe.releaseDuration),r=(recipe.startRadius+gather*recipe.growth)*(1-release);
  halo(ctx,0,0,r*1.7,c.dark,envelope(u)*.4);oval(ctx,0,0,r,r*.83,c.dark,envelope(u));
  for(let j=0;j<recipe.streamCount;j++){
    const v=age(ms,recipe.streamStartMs+j*recipe.streamStaggerMs,recipe.streamLifetimeMs);if(!live(v))continue;
    const curve=(p:number):Point=>{const a=j*TAU/recipe.streamCount+p*4+ms*.003,rr=v<.55?.95-ease(v/.55)*.64:.31+ease((v-.55)/.45)*.65;return [Math.cos(a)*rr,Math.sin(a)*rr*.8];};
    ribbon(ctx,curve,1,.68,recipe.width,c.dark,envelope(v));ribbon(ctx,curve,1,.68,recipe.highlightWidth,c.light,envelope(v)*.7);
  }
};
export const darkStatus:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["dark-status"];
  for(let layer=0;layer<recipe.layerCount;layer++){
    const u=age(ms,layer*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const dir=layer%2?1:-1;
    for(let i=0;i<recipe.lobeCount;i++){
      const x=dir*(-.8+u*recipe.travel)+(i-3.5)*recipe.spacing,y=(layer-3)*.15+Math.sin(u*4+i)*.06;
      halo(ctx,x,y,recipe.haloRadius,c.dark,envelope(u)*.16);
      oval(ctx,x,y,recipe.lobeRadius+Math.sin(ms*.01+i)*.02,recipe.lobeHeight,c.main,envelope(u)*.15);
    }
    ribbon(ctx,p=>[dir*(-1+p*2), (layer-2)*.17+Math.sin(p*5+ms*.007)*.055],u*1.5,.65,.014,c.light,envelope(u)*.2);
  }
};
export const fairyPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["fairy-physical"];
  const bright={...c,light:'#fff8dc',main:'#e6a0cd'},u=age(ms,recipe.startMs,recipe.lifetimeMs);
  if(live(u)) {
    const hit=ease(u/recipe.contactProgress),x=recipe.startX*(1-hit),y=recipe.startY*(1-hit);
    const size=recipe.size*(1-ease((u-.64)/.36));
    spark(ctx,x,y,size,bright.dark,envelope(u),u*.55);spark(ctx,x,y,size*.86,bright.light,envelope(u),u*.55);
    ribbon(ctx,p=>[.85-p*.85,-.85+p*.85],hit,.3,.035,bright.main,envelope(u)*.6);
  }
  shock(ctx,ms,recipe.pressureStartMs,bright,.8,.78);
  for(let i=0;i<recipe.moteCount;i++) {
    const v=age(ms,recipe.moteStartMs+random(seed+i*41)*recipe.birthJitterMs,recipe.moteLifetimeMs);if(!live(v))continue;
    const a=i*2.4;texture(ctx,recipe.starTexture,Math.cos(a)*v*.9,Math.sin(a)*v*.7,.13+random(seed+i)*.06,a,envelope(v));
  }
};

export const fairySpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["fairy-special"];
  for(let i=0;i<recipe.streamCount;i++){
    const u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const curve=(p:number):Point=>{const a=i*TAU/recipe.streamCount+p*TAU*1.15,r=.15+Math.sin(p*Math.PI)*.67;return [Math.cos(a)*r,Math.sin(a)*r*.83];};
    ribbon(ctx,curve,u*1.25,.43,recipe.width,c.main,envelope(u)*.85);
    ribbon(ctx,curve,u*1.25,.43,recipe.highlightWidth,'#fff1de',envelope(u));
    const [x,y]=curve(clamp(u*1.25));texture(ctx,recipe.starTexture,x,y,recipe.starSize,ms*.001,envelope(u));
  }
  for(let i=0;i<recipe.moteCount;i++){
    const u=age(ms,recipe.moteStartMs+i*recipe.moteStaggerMs,recipe.moteLifetimeMs);if(!live(u))continue;
    const a=i*2.4+u*1.5,r=.19+u*.68;
    texture(ctx,recipe.starTexture,Math.cos(a)*r,Math.sin(a)*r*.78,recipe.moteSize+random(seed+i)*recipe.moteSizeJitter,a,envelope(u));
  }
};
export const dragonPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["dragon-physical"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(live(u)){
    const hit=ease(u/recipe.contactProgress),shake=Math.sin(ms*recipe.shakeSpeed)*recipe.shakeStrength*Math.sin(clamp((u-.35)/.35)*Math.PI);
    part(ctx,recipe.clawPart,c,shake,recipe.startY+hit*recipe.fallDistance,recipe.size-hit*recipe.sizeContraction,0,envelope(u));
  }
  shock(ctx,ms,recipe.pressureStartMs,c,1,.63);debris(ctx,ms,recipe.debrisStartMs,seed,c,'scale',recipe.debrisCount,[0,.22],.84);
};
export const dragonSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["dragon-special"];
  // A tapered storm funnel: each ribbon has its own rotating phase, width, and height.
  for(let j=0;j<recipe.streamCount;j++){
    const u=age(ms,recipe.startMs+j*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const curve=(p:number):Point=>{const y=.65-p*1.37,r=.15+p*.67,a=p*7+ms*.018+j*1.5;return [Math.cos(a)*r,y+Math.sin(a)*r*.21];};
    ribbon(ctx,curve,clamp(u*1.6),.5,recipe.width+j*.004,j%2?c.main:c.dark,envelope(u)*.83);
    ribbon(ctx,curve,clamp(u*1.6),.5,recipe.highlightWidth,'#a1e9ff',envelope(u)*.75);
  }
  for(let i=0;i<recipe.shardCount;i++){
    const u=age(ms,recipe.shardStartMs+i*recipe.shardStaggerMs,recipe.shardLifetimeMs);if(!live(u))continue;const a=ms*.02+i*2.4,r=.2+u*.64;
    part(ctx,recipe.shardPart,{...c,light:'#bcf0ff'},Math.cos(a)*r,.63-u*1.3+Math.sin(a)*.1,.065+random(seed+i)*.05,a,envelope(u),i);
  }
  // Ground arcs discharge from the funnel foot, with larger blue sparks and a rotating rim.
  for(let i=0;i<recipe.boltCount;i++) {
    const v=age(ms,recipe.boltStartMs+i*recipe.boltStaggerMs,recipe.boltLifetimeMs);if(!live(v))continue;
    const dir=i%2?1:-1,x=dir*(.12+v*(.75+random(seed+i)*.25));
    const points:Point[]=[[0,.55],[x*.35,.4],[x*.5,.65],[x*.7,.48],[x,.56]];
    path(ctx,points,'#508af0',.065,envelope(v));path(ctx,points,'#c2faff',.025,envelope(v));
    spark(ctx,x,.56,.065+random(seed+i+12)*.045,'#c2faff',envelope(v));
  }
  const ground=age(ms,recipe.groundStartMs,recipe.groundLifetimeMs);
  if(live(ground))ring(ctx,0,.57,.15+Math.sin(ground*Math.PI)*.48,'#78cfff',.036,envelope(ground)*.8,.28);

};
export const dragonStatus:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["dragon-status"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const rear=ease((u-recipe.rearStart)/recipe.rearDuration),angle=recipe.angle-rear*recipe.rearAngle;
  // Head and voice share a local coordinate frame: the roar always leaves the open mouth.
  ctx.save();ctx.translate(-.19,.14-rear*.2);ctx.rotate(angle);
  texture(ctx,recipe.dragonTexture,0,0,recipe.size,0,envelope(u));
  const mouth:Point=[recipe.mouthX,recipe.mouthY];
  for(let j=0;j<recipe.roarCount;j++) {
    const v=age(ms,recipe.roarStartMs+j*recipe.roarStaggerMs,recipe.roarLifetimeMs);if(!live(v))continue;
    const curve=(p:number):Point=>{const a=-.66+p*1.32,r=.04+ease(v)*.69;return [mouth[0]+Math.cos(a)*r,mouth[1]+Math.sin(a)*r*.8];};
    ribbon(ctx,curve,1,1,recipe.roarWidth,c.main,envelope(v));ribbon(ctx,curve,1,1,.016,c.light,envelope(v));
  }
  ctx.restore();
};
