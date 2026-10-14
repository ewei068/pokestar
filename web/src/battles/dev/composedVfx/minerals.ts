import { tileEffectRecipes } from '../recipes/index';
import { age,live,envelope,ease,random,TAU,withAlpha,path,poly,ring,shock,spark,part,debris,halo,clamp } from './parts';
import type { Draw,Point } from './parts';

export const groundPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["ground-physical"];
  // Cracks propagate from the strike. Branches start only after their parent reaches them.
  for(let i=0;i<recipe.crackCount;i++){
    const a=i*TAU/recipe.crackCount+random(seed+i)*.35, u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const reach=ease(u*recipe.propagationSpeed), points:Point[]=[];
    for(let j=0;j<=8;j++) {const d=j/8*reach;points.push([Math.cos(a)*d+(random(seed+i*17+j)-.5)*.12*d, .12+Math.sin(a)*d*.6]);}
    path(ctx,points,c.dark,recipe.width,envelope(u));path(ctx,points,c.light,recipe.highlightWidth,envelope(u));
    if(u>.2) {const p=points[5];path(ctx,[p,[p[0]+Math.cos(a+.7)*.3*reach,p[1]+Math.sin(a+.7)*.22*reach]],c.dark,.024,envelope(u));}
  }
  shock(ctx,ms,recipe.pressureStartMs,c,recipe.pressureSize,recipe.pressureAspect);debris(ctx,ms,recipe.debrisStartMs,seed,c,'rock',recipe.debrisCount,[0,.14],recipe.debrisPower);
};
export const groundSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["ground-special"];
  // Each mud finger has its own emergence, apex, and collapse; there is no group transform.
  for(let i=0;i<recipe.fingerCount;i++){
    const s=seed+i*47,u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const x=(random(s)-.5)*recipe.spread, h=Math.sin(Math.PI*u)*(recipe.height+random(s+2)*recipe.heightJitter)*recipe.heightScale,w=recipe.width+random(s+3)*recipe.widthJitter;
    withAlpha(ctx,envelope(u),()=>{
      poly(ctx,[[x-w,.53],[x-w*.9,.28-h*.45],[x-.025,.5-h],[x+w*.55,.35-h*.65],[x+w,.53]],c.dark);
      poly(ctx,[[x-w*.4,.49],[x-.02,.52-h*.9],[x+w*.45,.5]],c.main);
      path(ctx,[[x-w*.3,.37],[x-.02,.54-h*.84]],c.light,.025);
    });
    part(ctx,recipe.rockPart,c,x+Math.sin(i)*u*.2,.5-h-.07,.15+random(s+4)*.13,u*4,envelope(u),i);
  }
  debris(ctx,ms,recipe.debrisStartMs,seed,c,'rock',recipe.debrisCount,[0,.33],1);
};
export const groundStatus:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["ground-status"];
  for(let layer=0;layer<recipe.layerCount;layer++){
    const u=age(ms,layer*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    // Sand grains form a horizontal eddy then settle under their own gravity.
    for(let i=0;i<recipe.grainCount;i++){
      const s=seed+layer*313+i*29,a=i*TAU/recipe.grainCount+u*(2+layer),r=recipe.radius+layer*recipe.layerRadius;
      const x=Math.cos(a)*r,y=.13+Math.sin(a)*r*.4-u*.19+u*u*.18;
      withAlpha(ctx,envelope(u)*(.55+random(s)*.45),()=>{ctx.fillStyle=i%4?c.main:c.light;ctx.fillRect(x,y,recipe.grainSize+random(s+1)*recipe.grainSizeJitter,.038);});
    }
    ring(ctx,0,.18,.25+ease(u)*.6,c.main,.028,envelope(u)*.35,.26);
  }
};
export const rockPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["rock-physical"];
  for(let i=0;i<recipe.rockCount;i++){
    const s=seed+i*71,birth=recipe.startMs+i*recipe.staggerMs,u=age(ms,birth,recipe.lifetimeMs);if(!live(u))continue;
    const hit=recipe.contactProgress,x=(random(s)-.5)*recipe.spread,size=recipe.size+random(s+1)*recipe.sizeJitter;
    const y=u<hit?recipe.startY+Math.pow(u/hit,2)*recipe.fallDistance:.36-Math.sin((u-hit)/(1-hit)*Math.PI)*recipe.bounceHeight;
    if(u<.62)part(ctx,recipe.rockPart,c,x,y,size*(1-Math.max(0,u-.43)*1.5),u*.8,envelope(u),i);
    debris(ctx,ms,birth+hit*recipe.lifetimeMs,seed+i*167,c,'rock',recipe.fragmentCount,[x,.36],recipe.fragmentPower);
    const dust=age(ms,birth+220,240);if(live(dust))ring(ctx,x,.45,.04+ease(dust)*.29,c.main,.028,envelope(dust)*.6,.25);
  }
};
export const rockSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["rock-special"];
  for(let i=0;i<recipe.rockCount;i++){
    const s=seed+i*47,u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const a=i*TAU/recipe.rockCount+random(s)*.2,collapse=ease((u-recipe.collapseStart)/recipe.collapseDuration),r=(recipe.radius+random(s+2)*recipe.radiusJitter)*(1-collapse);
    const x=Math.cos(a)*r,y=Math.sin(a)*r*.65-Math.sin(collapse*Math.PI)*.28+Math.sin(ms*recipe.bobSpeed+i*1.4)*recipe.bobHeight*(1-collapse);
    const size=(recipe.size+random(s+3)*recipe.sizeJitter)*(1-ease((u-.73)/.27));
    halo(ctx,x,y,size*.8,'#c3b1ff',envelope(u)*.23);
    part(ctx,recipe.rockPart,c,x,y,size,a*.25+u*.3,envelope(u),i);
    spark(ctx,x-size*.25,y-size*.23,.065,'#e6d8ff',envelope(u));
  }
  shock(ctx,ms,recipe.pressureStartMs,{...c,light:'#e7d7ff'},.76);debris(ctx,ms,recipe.debrisStartMs,seed,c,'rock',recipe.debrisCount,[0,.1],.85);
};
export const rockStatus:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["rock-status"];
  // A loose suspended perimeter: depth changes determine foreground order.
  const stones=Array.from({length:recipe.rockCount},(_,i)=>{const a=i*TAU/recipe.rockCount+ms*recipe.orbitSpeed;return {i,a,z:Math.sin(a)};}).sort((a,b)=>a.z-b.z);
  for(const {i,a,z} of stones){
    const u=age(ms,i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const r=recipe.radius*ease(u*4),x=Math.cos(a)*r,y=z*r*.47+Math.sin(ms*recipe.bobSpeed+i)*recipe.bobHeight;
    part(ctx,recipe.rockPart,c,x,y,(recipe.size+random(seed+i)*recipe.sizeJitter)*(1+z*.12),a*.3,envelope(u),i);
    spark(ctx,x-.055,y-.06,.045,c.light,envelope(u)*.8);
  }
};
export const steelPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["steel-physical"];
  for(let i=0;i<recipe.beamCount;i++){
    const b=recipe.startMs+i*recipe.staggerMs,u=age(ms,b,recipe.lifetimeMs-i*recipe.lifetimeStepMs);if(!live(u))continue;
    const x=(i-1)*recipe.spacing+(random(seed+i)-.5)*recipe.positionJitter,fall=ease(u*recipe.fallSpeed),y=recipe.startY+fall*(recipe.fallDistance+random(seed+i*31)*.12);
    part(ctx,recipe.metalPart,c,x,y,recipe.size+(i===1?recipe.centerSizeBonus:0),(i-1)*.17,envelope(u),i);
    if(u>.27&&u<.55)for(let j=0;j<7;j++){
      const a=age(ms,b+165+j*6,200);if(!live(a))continue;
      const dx=(j-3)*.11;path(ctx,[[x+dx*a,.58-a*.24],[x+dx*(a+.2),.59-a*.32]],'#fff0b7',.025,envelope(a));
    }
    const hit=age(ms,b+160,270);if(live(hit))ring(ctx,x,.59,.05+ease(hit)*.36,c.dark,.03,envelope(hit)*.55,.22);
  }
};
export const steelSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["steel-special"];
  // Three metal flux blades sweep through the same magnetic focus on separate beats.
  for(let i=0;i<recipe.beamCount;i++){
    const u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const angle=i*TAU/recipe.beamCount+u*(recipe.rotation+random(seed+i)*recipe.rotationJitter)+random(seed+i*31)*.3,r=recipe.radius+Math.sin(u*Math.PI)*(recipe.orbitRadius+random(seed+i*41)*recipe.orbitJitter);
    ctx.save();ctx.rotate(angle);
    part(ctx,recipe.metalPart,c,r,0,recipe.size,u*2,envelope(u),i);
    path(ctx,[[r,-.44],[r,-.7],[r-.15,-.81]],c.light,.025,envelope(u));ctx.restore();
    ring(ctx,0,0,.2+u*.55,c.main,.023,envelope(u)*.5,.52);
  }
  halo(ctx,0,0,.54,c.light,Math.sin(clamp(ms/730)*Math.PI)*.25);
  for(let i=0;i<recipe.sparkCount;i++){const u=age(ms,recipe.sparkStartMs+i*recipe.sparkStaggerMs,recipe.sparkLifetimeMs);if(live(u)){const a=i*2.4;spark(ctx,Math.cos(a)*u*.9,Math.sin(a)*u*.65,.04,c.light,envelope(u));}}
};
export const steelStatus:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["steel-status"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const build=ease(u*recipe.buildSpeed);withAlpha(ctx,envelope(u),()=>{
    const shield:Point[]=[[0,-.78],[.61,-.48],[.53,.35],[0,.79],[-.53,.35],[-.61,-.48]];
    ctx.save();ctx.scale(build,1);poly(ctx,shield,c.dark);
    poly(ctx,[[0,-.65],[.47,-.4],[.4,.3],[0,.63],[-.4,.3],[-.47,-.4]],c.main);
    poly(ctx,[[0,-.6],[0,.55],[-.34,.26],[-.39,-.36]],recipe.faceColor);
    path(ctx,[[0,-.56],[0,.55]],c.light,.024);
    // The highlight travels over the shield surface, clipped to its silhouette.
    ctx.beginPath();shield.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
    const sx=-1.15+clamp((u-recipe.highlightStart)/recipe.highlightDuration)*recipe.highlightTravel;
    poly(ctx,[[sx-.2,-1],[sx+.02,-1],[sx+.8,1],[sx+.58,1]],recipe.highlightColor);ctx.restore();
    spark(ctx,.38,.26,.075,c.light,Math.sin(clamp((u-.5)*3)*Math.PI));
  });
};
export const icePhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["ice-physical"];
  for(let i=0;i<recipe.shardCount;i++){
    const s=seed+i*53,b=recipe.startMs+i*recipe.staggerMs,u=age(ms,b,recipe.lifetimeMs);if(!live(u))continue;
    const x=(random(s)-.5)*recipe.spread,hit=clamp(u/recipe.contactProgress),y=recipe.startY+hit*hit*recipe.fallDistance;
    if(u<.71)part(ctx,recipe.shardPart,c,x,y,recipe.size+random(s+1)*recipe.sizeJitter,-.2,envelope(u),i);
    debris(ctx,ms,b+recipe.fragmentDelayMs,s,c,'shard',recipe.fragmentCount,[x,.37],.6);
  }
};
export const iceSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["ice-special"];
  for(let i=0;i<recipe.shardCount;i++){
    const u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const a=i*TAU/recipe.shardCount,build=ease(u*recipe.buildSpeed),fracture=ease((u-recipe.fractureStart)/recipe.fractureDuration);
    ctx.save();ctx.translate(Math.cos(a)*(.2+fracture*.6),Math.sin(a)*(.2+fracture*.6));ctx.rotate(a+Math.PI/2);
    part(ctx,recipe.shardPart,c,0,-.14*build,(recipe.size+random(seed+i)*recipe.sizeJitter)*build*(1-fracture*.65),fracture*.5,envelope(u),i);ctx.restore();
  }
  halo(ctx,0,0,.7,'#b5faff',envelope(age(ms,70,620))*.2);
  debris(ctx,ms,recipe.debrisStartMs,seed,c,'shard',recipe.debrisCount,[0,0],1);
};
export const iceStatus:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["ice-status"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;const grow=ease(u*recipe.growthSpeed),a=envelope(u);
  withAlpha(ctx,a,()=>{
    ctx.save();ctx.translate(0,recipe.groundY);ctx.scale(1,grow);ctx.translate(0,-recipe.groundY);
    poly(ctx,[[-.62,-.44],[-.34,-.72],[.63,-.72],[.63,.36],[.36,.64],[-.62,.64]],recipe.bodyColor);
    withAlpha(ctx,.8,()=>poly(ctx,[[-.56,-.39],[.36,-.39],[.36,.58],[-.56,.58]],recipe.faceColor));
    poly(ctx,[[-.62,-.44],[-.34,-.72],[.63,-.72],[.36,-.44]],recipe.topColor);
    path(ctx,[[.36,.64],[.36,-.44],[.63,-.72]],c.dark,.025);
    path(ctx,[[-.45,.42],[-.45,-.25],[-.25,-.25]],'#ffffff',.075);ctx.restore();
  });
  // Frost branches grow from the corners before they evaporate.
  for(let i=0;i<recipe.frostCount;i++){const v=age(ms,recipe.frostStartMs+i*recipe.frostStaggerMs,recipe.frostLifetimeMs);if(!live(v))continue;
    const a=i*TAU/recipe.frostCount,x=Math.cos(a)*.68,y=Math.sin(a)*.65;
    path(ctx,[[x,y],[x*.74,y*.74]],c.light,.022,envelope(v));spark(ctx,x,y,.055,c.light,envelope(v));}
};
