import { sharedRecipes } from './recipes/shared';
/** Approved tile compositions. Each cell owns its choreography and typed recipe. */
import type { VfxKind, VfxType } from './types';
import { vfxPalette } from './types';
import type { VfxTile as MatrixTile } from './renderTypes';
import { drawFocusedTile } from './focused';
import { loadParts, clamp, random } from './composedVfx/parts';
import type { Draw } from './composedVfx/parts';
import { createFireTileRenderer } from './fire';
import { createQualityTileRenderer } from './quality';
import * as minerals from './composedVfx/minerals';
import * as nature from './composedVfx/nature';
import * as elements from './composedVfx/elements';
import * as arcane from './composedVfx/arcane';

// Route the approved compositions; three focal effects use their dedicated renderers.
const effects: Partial<Record<VfxType, Partial<Record<VfxKind, Draw>>>> = {
  normal: {special:arcane.normalSpecial,status:arcane.normalStatus},
  flying:{physical:nature.flyingPhysical,special:nature.flyingSpecial,status:nature.flyingStatus},
  ground:{physical:minerals.groundPhysical,special:minerals.groundSpecial,status:minerals.groundStatus},
  rock:{physical:minerals.rockPhysical,special:minerals.rockSpecial,status:minerals.rockStatus},
  bug:{physical:nature.bugPhysical,special:nature.bugSpecial,status:nature.bugStatus},
  ghost:{physical:arcane.ghostPhysical,special:arcane.ghostSpecial,status:arcane.ghostStatus},
  steel:{physical:minerals.steelPhysical,special:minerals.steelSpecial,status:minerals.steelStatus},
  fire:{physical:elements.firePhysical,status:elements.fireStatus},
  water:{physical:elements.waterPhysical,special:elements.waterSpecial,status:elements.waterStatus},
  grass:{physical:nature.grassPhysical,special:nature.grassSpecial,status:nature.grassStatus},
  electric:{physical:elements.electricPhysical,special:elements.electricSpecial,status:elements.electricStatus},
  psychic:{physical:arcane.psychicPhysical,special:arcane.psychicSpecial,status:arcane.psychicStatus},
  ice:{physical:minerals.icePhysical,special:minerals.iceSpecial,status:minerals.iceStatus},
  dragon:{physical:arcane.dragonPhysical,special:arcane.dragonSpecial,status:arcane.dragonStatus},
  dark:{physical:arcane.darkPhysical,special:arcane.darkSpecial,status:arcane.darkStatus},
  fairy:{physical:arcane.fairyPhysical,special:arcane.fairySpecial},
};
let established: Record<string, ReturnType<typeof createFireTileRenderer>> | undefined;
export const loadTileVfxArt = (): Promise<void> => {
  established ??= {'normal-physical':createQualityTileRenderer('normal-physical'),
    'fire-special':createFireTileRenderer(),'fairy-status':createQualityTileRenderer('fairy-status')};
  return Promise.all([loadParts(), ...Object.values(established).map(render => render.ready)]).then(() => undefined);
};
export const drawTileVfx = (ctx:CanvasRenderingContext2D,type:VfxType,kind:VfxKind,tile:MatrixTile,ms:number) => {
  const playback = sharedRecipes.tilePlayback;
  if(ms<=0||ms>=playback.durationMs)return;
  if(drawFocusedTile(ctx,type,kind,tile,ms))return;
  const preserved=established?.[`${type}-${kind}`];
  if(preserved){preserved(ctx,tile,ms);return;}
  const draw=effects[type]?.[kind];
  if(!draw)throw new Error(`The focused ${type}/${kind} effect has no renderer`);
  ctx.save();ctx.translate(tile.x,tile.y);ctx.scale(tile.radius,tile.radius);
  // A final release envelope protects against truncating long-lived supporting particles.
  ctx.globalAlpha*=clamp((playback.durationMs-ms)/playback.finalFadeMs);
  // Stable small framing variation applies even to quiet fields without emitted particles.
  const scale=playback.scale+random(tile.seed+913)*playback.scaleJitter;
  ctx.translate((random(tile.seed+917)-.5)*playback.jitterX,(random(tile.seed+919)-.5)*playback.jitterY);
  ctx.scale(scale,scale);
  draw(ctx,ms*(playback.clockScale+random(tile.seed+923)*playback.clockJitter),tile.seed,vfxPalette[type]);ctx.restore();
};
