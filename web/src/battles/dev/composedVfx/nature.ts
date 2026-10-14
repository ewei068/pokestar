import { tileEffectRecipes } from '../recipes/index';
import { sharedRecipes } from '../recipes/shared';
import {age,live,envelope,ease,random,TAU,withAlpha,path,oval,ring,spark,part,debris,ribbon,slash,clamp} from './parts';
import type {Draw,Point,Ctx} from './parts';
import type {Colors} from '../matrixVfxKit';

/** The inner root stays fixed while the outer wing tip sweeps through an arc. */
const wing=(ctx:Ctx,c:Colors,x:number,y:number,size:number,angle:number,side:number,a:number)=>{
  ctx.save();ctx.translate(x,y);ctx.scale(side*size,size);ctx.rotate(angle);
  part(ctx,'wing',c,sharedRecipes.wing.x,sharedRecipes.wing.y,sharedRecipes.wing.size,0,a);ctx.restore();
};
export const flyingPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["flying-physical"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(live(u)){
    const strike=ease((u-recipe.strikeStart)/recipe.strikeDuration);
    wing(ctx,c,recipe.rootX,recipe.rootY,recipe.wingSize,recipe.angle+strike*recipe.swing,1,envelope(u));
  }
  debris(ctx,ms,recipe.featherStartMs,seed,c,'feather',recipe.featherCount,[recipe.featherX,recipe.featherY],recipe.featherPower);
};
export const flyingSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["flying-special"];
  // Curved air sheets sweep left-to-right; feathers get entrained in the same flow.
  for(let i=0;i<recipe.sheetCount;i++){
    const u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const curve=(p:number):Point=>[recipe.startX+p*recipe.travel,(i-2)*recipe.rowSpacing+Math.sin(p*TAU+i*.6)*recipe.waveHeight];
    ribbon(ctx,curve,u*1.6,recipe.tail,recipe.width-i*.012,c.main,envelope(u)*.68);
    ribbon(ctx,curve,u*1.6,recipe.tail,recipe.highlightWidth,c.light,envelope(u));
  }
  for(let i=0;i<recipe.featherCount;i++){
    const s=seed+i*53,u=age(ms,recipe.featherStartMs+i*recipe.featherStaggerMs,recipe.featherLifetimeMs);if(!live(u))continue;
    part(ctx,recipe.featherPart,c,-1.04+u*2.05,(random(s)-.5)*1.05+Math.sin(u*6+i)*.12,
      recipe.featherSize+random(s+2)*recipe.featherSizeJitter,-.9+u*2,envelope(u),i);
  }
};
export const flyingStatus:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["flying-status"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const lift=ease(u*recipe.liftSpeed),angle=recipe.angle-lift*recipe.swing;
  for(const side of [-1,1]) {
    wing(ctx,c,side*recipe.rootX,recipe.rootY,recipe.wingSize,angle,side,envelope(u));
    const x=side*(recipe.rootX+recipe.wingSize*(1.02*Math.cos(angle)+.81*Math.sin(angle)));
    const y=recipe.rootY+recipe.wingSize*(1.02*Math.sin(angle)-.81*Math.cos(angle));
    debris(ctx,ms,recipe.featherStartMs,seed+(side+1)*71,c,'feather',recipe.featherCount,[x,y+recipe.featherYOffset],recipe.featherPower);
  }
};

export const bugPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["bug-physical"];
  const sharp={...c,main:recipe.main,light:recipe.light};
  slash(ctx,ms,recipe.firstCutMs,recipe.cutAngle,sharp,recipe.cutWidth,[0,0],recipe.cutLength);slash(ctx,ms,recipe.secondCutMs,-recipe.cutAngle,sharp,recipe.cutWidth,[0,0],recipe.cutLength);
  for(let i=0;i<recipe.particleCount;i++){
    const u=age(ms,recipe.particleStartMs+random(seed+i)*recipe.particleBirthJitterMs,recipe.particleLifetimeMs);if(!live(u))continue;
    const a=i*TAU/12;
    part(ctx,recipe.shardPart,sharp,Math.cos(a)*u*.93,Math.sin(a)*u*.67,recipe.particleSize*(1-u*.5),a+u*2,envelope(u),i);
  }
};
export const bugSpecial:Draw=(ctx,ms,_seed,_c)=>{
  const recipe = tileEffectRecipes["bug-special"];
  // An amber insect pulse: concentric serrated membranes beat, shed flecks, and break apart.
  const amber={main:recipe.main,light:recipe.light,dark:recipe.dark};
  for(let j=0;j<recipe.pulseCount;j++){
    const u=age(ms,recipe.startMs+j*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const pts:Point[]=[];
    for(let i=0;i<=64;i++){
      const a=i*TAU/64,r=(recipe.startRadius+ease(u)*recipe.growth)*(1+recipe.waveAmplitude*Math.sin(a*12-ms*.023));
      pts.push([Math.cos(a)*r,Math.sin(a)*r*.7]);
    }
    path(ctx,pts,amber.dark,recipe.width,envelope(u)*.7);path(ctx,pts,amber.light,recipe.highlightWidth,envelope(u));
  }
  for(let i=0;i<recipe.particleCount;i++){
    const u=age(ms,recipe.particleStartMs+i*recipe.particleStaggerMs,recipe.particleLifetimeMs),a=i*2.4+ms*.002;if(!live(u))continue;
    const x=Math.cos(a)*(.15+u*.8),y=Math.sin(a)*(.1+u*.56);
    path(ctx,[[x-.035,y],[x,y-.025],[x+.035,y]],i%2?amber.main:amber.light,.028,envelope(u));
  }
};
export const bugStatus:Draw=(ctx,ms,_seed,c)=>{
  const recipe = tileEffectRecipes["bug-status"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const r=recipe.radius*ease(u*recipe.growthSpeed),a=envelope(u);
  const point=(i:number,layer:number):Point=>{
    const theta=i*TAU/recipe.spokeCount+.13, wobble=Math.sin(ms*.02+i*2+layer)*.05*(1-ease((u-.3)*2));
    return [Math.cos(theta)*(r+wobble)*layer/3,Math.sin(theta)*(r+wobble)*layer/3*.78];
  };
  for(let i=0;i<recipe.spokeCount;i++)path(ctx,[[0,0],point(i,3)],'#677647',.025,a);
  for(let layer=1;layer<=recipe.ringCount;layer++){
    // Every span sags inward, then springs taut at a different moment.
    const reveal=clamp((ms-recipe.ringStartMs-layer*recipe.ringStaggerMs)/recipe.ringBuildMs),points:Point[]=[];
    for(let step=0;step<=64*reveal;step++){
      const segment=Math.floor(step/8),q=step%8/8,p=point(segment,layer),next=point(segment+1,layer);
      const sag=1-Math.sin(q*Math.PI)*(.17+Math.sin(ms*.014+layer)*.03);
      points.push([(p[0]*(1-q)+next[0]*q)*sag,(p[1]*(1-q)+next[1]*q)*sag]);
    }
    if(points.length>1){path(ctx,points,c.dark,.045,a*.55);path(ctx,points,'#f3f5ca',.023,a);}
  }
  for(let i=0;i<recipe.spokeCount;i++){const v=age(ms,recipe.sparkStartMs+i*recipe.sparkStaggerMs,recipe.sparkLifetimeMs);if(live(v)){const [x,y]=point(i,2);spark(ctx,x,y,recipe.sparkSize,c.light,envelope(v));}}
};
export const grassPhysical:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["grass-physical"];
  for(let i=0;i<recipe.leafCount;i++){
    const s=seed+i*59,u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs);if(!live(u))continue;
    const y=(random(s)-.5)*recipe.verticalSpread,curve=(p:number):Point=>[recipe.startX+p*recipe.travel,y-Math.sin(p*Math.PI)*recipe.arcHeight];
    ribbon(ctx,curve,u,recipe.tail,recipe.trailWidth,c.light,envelope(u)*.65);
    const [x,py]=curve(u);part(ctx,recipe.leafPart,c,x,py,recipe.size+random(s+2)*recipe.sizeJitter,.8+u*1.3,envelope(u),i);
  }
};
export const grassSpecial:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["grass-special"];
  const u=age(ms,recipe.startMs,recipe.lifetimeMs);if(!live(u))return;
  const focus=1-ease((u-recipe.focusStart)/recipe.focusDuration),width=recipe.minWidth+recipe.maxWidth*focus;
  // Ground pressure sits behind the column; contact spray stays in front.
  for(let front=0;front<recipe.pressureCount;front++) {
    const v=age(ms,recipe.pressureStartMs+front*recipe.pressureStaggerMs,recipe.pressureLifetimeMs);if(!live(v))continue;
    ring(ctx,0,recipe.contactY,recipe.pressureStartRadius+ease(v)*recipe.pressureGrowth,c.main,recipe.pressureWidth,envelope(v)*.8,recipe.pressureAspect);
    ring(ctx,0,recipe.contactY,recipe.pressureStartRadius+ease(v)*recipe.pressureGrowth,'#f4ffc8',.027,envelope(v),recipe.pressureAspect);
  }
  // A bright column contracts; individual helical sparks continue after its center closes.
  withAlpha(ctx,envelope(u)*.88,()=>{
    const g=ctx.createLinearGradient(-width,0,width,0);g.addColorStop(0,'transparent');g.addColorStop(.25,'#78c95e');g.addColorStop(.43,'#eaffaf');g.addColorStop(.5,'#ffffee');g.addColorStop(.57,'#eaffaf');g.addColorStop(.75,'#78c95e');g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(-width,-1.03,width*2,1.34);
  });
  for(let i=0;i<recipe.sparkCount;i++){
    const v=age(ms,recipe.sparkStartMs+i*recipe.sparkStaggerMs,recipe.sparkLifetimeMs);if(!live(v))continue;
    const a=i*2.4+v*5,r=.22+focus*.54;
    spark(ctx,Math.cos(a)*r,recipe.contactY-v*1.34,.045+random(seed+i)*.025,i%2?c.light:'#a3de56',envelope(v));
  }
  // The broad beam hits a ground-level bloom; expanding fronts and spray carry its scale.
  const contact=age(ms,recipe.contactStartMs,recipe.contactLifetimeMs);
  if(live(contact)) {
    oval(ctx,0,recipe.contactY,.22+Math.sin(contact*Math.PI)*.62,.13,c.light,envelope(contact)*.9);
    for(let i=0;i<recipe.sprayCount;i++) {
      const key=seed+i*67,v=age(ms,recipe.sprayStartMs+random(key)*recipe.sprayBirthJitterMs,recipe.sprayLifetimeMs);if(!live(v))continue;
      const a=i*2.4,x=Math.cos(a)*v*(.75+random(key+1)*.55);
      const y=recipe.contactY-Math.sin(v*Math.PI)*(.22+random(key+2)*.48)+Math.sin(a)*v*.22;
      spark(ctx,x,y,.045+random(key+3)*.045,i%3?c.light:'#b3ee61',envelope(v));
    }
  }

};
export const grassStatus:Draw=(ctx,ms,seed,c)=>{
  const recipe = tileEffectRecipes["grass-status"];
  for(let i=0;i<recipe.particleCount;i++){
    const s=seed+i*37,u=age(ms,recipe.startMs+i*recipe.staggerMs,recipe.lifetimeMs+random(s)*recipe.lifetimeJitterMs);if(!live(u))continue;
    const theta=i*2.4+u*4.1,x=Math.cos(theta)*(.25+random(s+2)*.54),y=recipe.startY+u*recipe.fallDistance;
    if(i%4===0)part(ctx,recipe.leafPart,c,x,y,recipe.leafSize+random(s+3)*recipe.leafSizeJitter,theta,envelope(u),i);
    else {oval(ctx,x,y,.022+random(s+4)*.018,.032,i%3?c.light:'#97c66c',envelope(u));
      if(i%3===0)path(ctx,[[x,y],[x+.015,y-.09]],c.main,.013,envelope(u)*.4);}
  }
  for(let i=0;i<recipe.pulseCount;i++){const u=age(ms,recipe.pulseStartMs+i*recipe.pulseStaggerMs,recipe.pulseLifetimeMs);if(live(u))ring(ctx,0,.5,.2+u*.55,c.main,.016,envelope(u)*.3,.28);}
};
