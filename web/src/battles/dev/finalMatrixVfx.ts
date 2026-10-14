/** Review-only compositions. Each cell owns its choreography; no complete-effect image layer. */
import type { VfxKind, VfxType } from '../vfx/types';
import { vfxPalette } from '../vfx/types';
import type { MatrixTile } from './matrixVfxArt';
import { drawFocusedTile } from './focusedMatrixVfx';
import { loadParts, clamp, random } from './composedVfx/parts';
import type { Draw } from './composedVfx/parts';
import { createFireReviewRenderer } from './FireVfxPrototype';
import { createQualityReviewRenderer } from './QualityVfxPrototype';
import * as minerals from './composedVfx/minerals';
import * as nature from './composedVfx/nature';
import * as elements from './composedVfx/elements';
import * as arcane from './composedVfx/arcane';

// Preserve the established studies alongside the independently composed matrix.
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
let established: Record<string, ReturnType<typeof createFireReviewRenderer>> | undefined;
export const loadFinalMatrixArt = (_type: VfxType): Promise<void> => {
  established ??= {'normal-physical':createQualityReviewRenderer('normal-physical'),
    'fire-special':createFireReviewRenderer(),'fairy-status':createQualityReviewRenderer('fairy-status')};
  return Promise.all([loadParts(), ...Object.values(established).map(render => render.ready)]).then(() => undefined);
};
export const drawFinalMatrixTile = (ctx:CanvasRenderingContext2D,type:VfxType,kind:VfxKind,tile:MatrixTile,ms:number) => {
  if(ms<=0||ms>=760)return;
  if(drawFocusedTile(ctx,type,kind,tile,ms))return;
  const preserved=established?.[`${type}-${kind}`];
  if(preserved){preserved(ctx,tile,ms);return;}
  const draw=effects[type]?.[kind];
  if(!draw)throw new Error(`The focused ${type}/${kind} study must be resolved by the review host`);
  ctx.save();ctx.translate(tile.x,tile.y);ctx.scale(tile.radius,tile.radius);
  // A final release envelope protects against truncating long-lived supporting particles.
  ctx.globalAlpha*=clamp((760-ms)/65);
  // Stable small framing variation applies even to quiet fields without emitted particles.
  const scale=.94+random(tile.seed+913)*.1;
  ctx.translate((random(tile.seed+917)-.5)*.065,(random(tile.seed+919)-.5)*.05);
  ctx.scale(scale,scale);
  draw(ctx,ms*(.975+random(tile.seed+923)*.05),tile.seed,vfxPalette[type]);ctx.restore();
};
