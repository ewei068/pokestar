import { tileEffectRecipes } from '../recipes/index';
import { elementsRecipes } from '../recipes/elements';
import {age,live,envelope,ease,random,TAU,withAlpha,path,oval,ring,shock,spark,halo,ribbon,clamp,texture,orb} from './parts';
import type {Draw,Point,Ctx} from './parts';
import type {Colors} from '../matrixVfxKit';

const embers=(ctx:Ctx,ms:number,birth:number,seed:number,count:number,origin:Point)=>{
  const recipe = elementsRecipes.embers;
  for(let i=0;i<count;i++){
    const s=seed+i*43,u=age(ms,birth+random(s)*recipe.birthJitterMs,recipe.lifetimeMs+random(s+1)*recipe.lifetimeJitterMs);if(!live(u))continue;
    const x=origin[0]+(random(s+2)-.5)*u*recipe.spread,y=origin[1]-u*(recipe.rise+random(s+3)*recipe.riseJitter)+u*u*recipe.gravity;
    texture(ctx,i%3===0?'coal':i%3===1?'ember':'fleck',x,y,(recipe.size+random(s+4)*recipe.sizeJitter)*(1-u*.45),Math.sin(i)*.4,envelope(u));
  }
};
export const firePhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["fire-physical"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(live(u)){
    const hit=ease(u/recipe.contactProgress),y=recipe.startY+hit*recipe.fallDistance;
    const size=(recipe.size+random(seed)*recipe.sizeJitter)*(1-ease((u-.65)/.35));
    halo(ctx,0,y,recipe.haloSize,recipe.haloColor,envelope(u)*.24);
    orb(ctx,{main:recipe.main,light:recipe.light,dark:recipe.dark},0,y,size,ms,envelope(u),'molten');
    if(u<.58)for(let i=0;i<recipe.tailCount;i++)texture(ctx,recipe.emberTexture,Math.sin(i)*.18,y-.3-i*.12,.22,0,envelope(u)*(.5-i*.08));
  }
  shock(ctx,ms,recipe.pressureStartMs,c,recipe.pressureSize,recipe.pressureAspect);embers(ctx,ms,recipe.emberStartMs,seed,recipe.emberCount,[0,.16]);
};
export const fireStatus:Draw=(ctx,ms,seed,_c)=>{
  const recipe = tileEffectRecipes["fire-status"];
  // Burn-like sequence: each flame stays at its x position and rises/falls on its own beat.
  for(let i=0;i<recipe.flameCount;i++) {
    const u=age(ms,recipe.startMs+i*recipe.staggerMs+random(seed+i)*recipe.birthJitterMs,recipe.lifetimeMs);if(!live(u))continue;
    const x=recipe.startX+i*recipe.spacing,y=recipe.baseY-Math.sin(u*Math.PI)*recipe.bobHeight;
    texture(ctx,recipe.fleckTexture,x,y,recipe.size+Math.sin(u*Math.PI)*recipe.growth,0,envelope(u));
  }
};

const droplet=(ctx:Ctx,x:number,y:number,size:number,c:Colors,a:number)=>{
  withAlpha(ctx,a,()=>{oval(ctx,x,y,size,size*1.2,c.dark);oval(ctx,x,y-size*.12,size*.76,size*.92,c.main);oval(ctx,x-size*.2,y-size*.36,size*.23,size*.27,c.light);});
};
const spray=(ctx:Ctx,ms:number,birth:number,seed:number,c:Colors,count:number,origin:Point,power=1)=>{
  const recipe = elementsRecipes.spray;
  for(let i=0;i<count;i++){
    const s=seed+i*73,u=age(ms,birth+random(s)*recipe.birthJitterMs,recipe.lifetimeMs+random(s+1)*recipe.lifetimeJitterMs);if(!live(u))continue;
    const vx=(random(s+2)-.5)*2*power,vy=-recipe.rise-random(s+3)*recipe.riseJitter;
    droplet(ctx,origin[0]+vx*u,origin[1]+vy*u+u*u*recipe.gravity,recipe.size+random(s+4)*recipe.sizeJitter,c,envelope(u));
  }
};
export const waterPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["water-physical"];
  shock(ctx,ms,recipe.pressureStartMs,c,recipe.pressureSize,recipe.pressureAspect);
  const contact=age(ms,recipe.splashStartMs,recipe.splashLifetimeMs);
  if(live(contact)) {
    ctx.save();ctx.scale(1,1-.25*ease(contact));
    texture(ctx,recipe.splashTexture,0,.06,recipe.splashSize+ease(contact)*recipe.splashGrowth,0,envelope(contact)*.88);ctx.restore();
  }
  for(let i=0;i<recipe.ribbonCount;i++){
    const u=age(ms,recipe.ribbonStartMs+i*recipe.ribbonStaggerMs,recipe.ribbonLifetimeMs);if(!live(u))continue;
    const a=i*TAU/recipe.ribbonCount,curve=(p:number):Point=>[Math.cos(a)*p*.85,Math.sin(a)*p*.65-p*(1-p)*.3];
    ribbon(ctx,curve,u*1.4,.55,.085,c.main,envelope(u));ribbon(ctx,curve,u*1.4,.55,.026,c.light,envelope(u));
  }
  spray(ctx,ms,recipe.sprayStartMs,seed,c,recipe.dropletCount,[0,.08],recipe.sprayPower);
};
export const waterSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["water-special"];
  // A curling crest is reconstructed at every frame, then collapses into detached foam.
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(live(u)){
    const rise=ease(u/recipe.riseDuration),crash=ease((u-recipe.crashStart)/recipe.crashDuration),h=recipe.height*rise*(1-crash*.88),y=recipe.baseY;
    withAlpha(ctx,envelope(u)*.94,()=>{
      ctx.translate(recipe.startX+u*recipe.travel,0);
      ctx.fillStyle=c.dark;ctx.beginPath();ctx.moveTo(-.85,y);
      ctx.bezierCurveTo(-1,y-h*.7,-.67,y-h*1.17,-.08,y-h);
      ctx.bezierCurveTo(.64,y-h*.86,.95,y-h*.25,.3,y-h*.25);
      ctx.bezierCurveTo(.55,y-h*.61,-.05,y-h*.83,-.08,y-h*.2);
      ctx.quadraticCurveTo(.18,y-.08,.85,y);ctx.closePath();ctx.fill();
      ctx.fillStyle=recipe.main;ctx.beginPath();ctx.moveTo(-.76,y-.04);
      ctx.bezierCurveTo(-.84,y-h*.66,-.58,y-h*.97,-.1,y-h*.92);
      ctx.bezierCurveTo(.22,y-h*.86,.49,y-h*.63,.48,y-h*.47);
      ctx.bezierCurveTo(.06,y-h*.84,-.27,y-h*.66,-.25,y-h*.18);
      ctx.quadraticCurveTo(-.05,y-.05,.7,y-.04);ctx.closePath();ctx.fill();
      for(let i=0;i<recipe.foamCount;i++){
        const a=-2.7+i*.24,x=-.13+Math.cos(a)*(.6-crash*.13),py=y-h*.49+Math.sin(a)*h*.5;
        oval(ctx,x,py,.075+Math.sin(i+ms*.02)*.018,.052,c.light);
      }
      for(let i=0;i<4;i++)path(ctx,[[-.64+i*.105,y-.12],[-.64+i*.06,y-h*.45],[-.43+i*.08,y-h*.66]],'#d2faff',.015,.65);
    });
  }
  spray(ctx,ms,recipe.sprayStartMs,seed,c,recipe.dropletCount,[.12,.34],recipe.sprayPower);
  for(let i=0;i<recipe.ringCount;i++){const v=age(ms,recipe.ringStartMs+i*recipe.ringStaggerMs,recipe.ringLifetimeMs);if(live(v))ring(ctx,0,.54,.2+ease(v)*.66,c.main,.027,envelope(v)*.7,.22);}
};
export const waterStatus:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["water-status"];
  for(let j=0;j<recipe.streamCount;j++){
    const u=age(ms,recipe.startMs+j*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const curve=(p:number):Point=>{const a=p*TAU*1.35+ms*.002+j;return [Math.cos(a)*(.45+p*.23),.45-p*.85+Math.sin(a)*.16];};
    ribbon(ctx,curve,clamp(u*1.6),.42,recipe.width,c.main,envelope(u)*.82);
    ribbon(ctx,curve,clamp(u*1.6),.42,recipe.highlightWidth,c.light,envelope(u));
  }
  for(let i=0;i<recipe.dropletCount;i++){
    const u=age(ms,recipe.dropletStartMs+i*recipe.dropletStaggerMs,recipe.dropletLifetimeMs);if(!live(u))continue;
    const a=i*2.4+u*2;droplet(ctx,Math.cos(a)*.58,.43-u*.82+Math.sin(a)*.2,recipe.dropletSize,c,envelope(u));
  }
};
/** Piecewise electrical channels use stepped time so branches flicker, never swim. */
const bolt=(ctx:Ctx,from:Point,to:Point,seed:number,ms:number,c:Colors,width:number,a:number)=>{
  const recipe = elementsRecipes.bolt;
  const frame=Math.floor(ms/recipe.flickerMs),points:Point[]=[];
  for(let i=0;i<=8;i++){
    const u=i/8,j=i===0||i===8?0:(random(seed+frame*31+i*47)-.5)*recipe.jitter;
    points.push([from[0]+(to[0]-from[0])*u+j,from[1]+(to[1]-from[1])*u]);
  }
  path(ctx,points,c.main,width*2,a*.5);path(ctx,points,c.light,width,a);
  if(random(seed+7)>recipe.branchChanceThreshold) {
    const mid=points[3],sign=random(seed+11)>.5?1:-1;
    path(ctx,[mid,[mid[0]+sign*.11,mid[1]+.09],[mid[0]+sign*.075,mid[1]+.14],
      [mid[0]+sign*.2,mid[1]+.24]],c.main,width*recipe.branchWidth,a*recipe.branchOpacity);
  }
};
export const electricPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["electric-physical"];
  shock(ctx,ms,recipe.pressureStartMs,c,recipe.pressureSize,recipe.pressureAspect);
  for(let i=0;i<recipe.boltCount;i++){
    const u=age(ms,recipe.startMs+random(seed+i*71)*recipe.birthJitterMs,recipe.lifetimeMs);if(!live(u))continue;const a=i*TAU/recipe.boltCount;
    bolt(ctx,[Math.cos(a)*.14,Math.sin(a)*.14],[Math.cos(a)*(.22+u*.75),Math.sin(a)*(.22+u*.75)],seed+i*51,ms,c,recipe.width,envelope(u));
  }
  for(let i=0;i<recipe.sparkCount;i++){const u=age(ms,recipe.sparkStartMs+i*recipe.sparkStaggerMs,recipe.sparkLifetimeMs);if(live(u))spark(ctx,(random(seed+i)-.5)*1.3,(random(seed+i+2)-.5)*1.2,recipe.sparkSize,c.light,envelope(u));}
};
export const electricSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["electric-special"];
  for(let i=0;i<recipe.boltCount;i++){
    const u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const x=(random(seed+i*41)-.5)*recipe.spread,endpoint:Point=[x*.5,.37];
    bolt(ctx,[x-.16,-1.1],endpoint,seed+i*97,ms,c,recipe.width,envelope(u));
    halo(ctx,...endpoint,.34,c.light,envelope(u)*.37);
    for(let j=0;j<recipe.branchCount;j++)bolt(ctx,endpoint,[endpoint[0]+(j-1)*.33,.53],seed+j*41,ms,c,recipe.smallWidth,envelope(u));
  }
  for(let i=0;i<recipe.smallBoltCount;i++) {
    const u=age(ms,recipe.smallStartMs+random(seed+i*73)*recipe.smallBirthJitterMs,recipe.smallLifetimeMs);if(!live(u))continue;
    const x=(i?1:-1)*(.35+random(seed+i*41)*.3);
    bolt(ctx,[x,-.85],[x*.5,.25],seed+i*313,ms,c,recipe.smallWidth,envelope(u));
  }

};
export const electricStatus:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["electric-status"];
  for(let j=0;j<recipe.ringCount;j++){
    const u=age(ms,j*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const r=recipe.startRadius+ease(u)*recipe.growth,pts:Point[]=[],frame=Math.floor(ms/recipe.flickerMs);
    for(let i=0;i<=32;i++){
      const a=i*TAU/32,rr=r*(1+(random(seed+frame*13+(i%32)*17)-.5)*recipe.jaggedness);
      pts.push([Math.cos(a)*rr,Math.sin(a)*rr*.78]);
    }
    path(ctx,pts,c.main,recipe.width,envelope(u)*.6);path(ctx,pts,c.light,recipe.highlightWidth,envelope(u));
    for(let i=0;i<recipe.branchCount;i++){const a=i*TAU/recipe.branchCount+j;bolt(ctx,[Math.cos(a)*r*.7,Math.sin(a)*r*.56],[Math.cos(a)*r,Math.sin(a)*r*.8],seed+i,ms,c,.012,envelope(u));}
  }
};
