/** Development-only synchronized comparison and deterministic timeline for the review gallery. */
import { drawFinalMatrixTile, loadFinalMatrixArt } from './finalMatrixVfx';
import { standardVfxTypes } from '../vfx/types';
import type { VfxKind, VfxType } from '../vfx/types';

export const installVfxInspector = () => {
  const dialog=document.createElement('dialog');
  dialog.id='vfx-inspector';
  dialog.innerHTML=`<form method="dialog"><button class="close-inspector">Close</button></form>
    <h2>Compare complete motion at tile size</h2>
    <div class="toolbar"><label>Type <select id="inspect-type"></select></label>
    <label>Category <select id="inspect-kind"><option>physical</option><option>special</option><option>status</option></select></label>
    <label>Size <select id="inspect-size"><option value="44">Desktop</option><option value="24">Phone</option></select></label>
    <label>Background <select id="inspect-background"><option value="occupied">Pokémon</option><option value="empty">Empty tile</option></select></label></div>
    <div class="compare-tiles"></div>
    <div class="toolbar"><button type="button" id="inspect-play">Pause</button>
    <button type="button" id="inspect-replay">Replay</button>
    <button type="button" id="inspect-seed">Another tile seed</button>
    <label>Speed <select id="inspect-speed"><option value="1">1×</option><option value="0.5">½×</option></select></label>
    <output id="inspect-time"></output></div>
    <label class="timeline-label">Action time <input id="inspect-timeline" type="range" min="0" max="760" step="1" value="0"></label>
    <p>Each canvas uses the same category, time and tile seed. The references are unchanged. Scrub the whole action to examine emergence, contact, and release.</p>`;
  document.body.append(dialog);
  const q=<T extends HTMLElement>(selector:string)=>dialog.querySelector<T>(selector)!;
  const types=q<HTMLSelectElement>('#inspect-type'),kinds=q<HTMLSelectElement>('#inspect-kind');
  standardVfxTypes.forEach(type=>{const option=document.createElement('option');option.textContent=type;types.append(option);});
  const tileContainer=q<HTMLDivElement>('.compare-tiles');
  const canvases=['Selected effect','Fighting reference','Poison reference'].map(label=>{
    const figure=document.createElement('figure'),caption=document.createElement('figcaption'),canvas=document.createElement('canvas');
    caption.textContent=label;canvas.width=200;canvas.height=100;figure.append(caption,canvas);tileContainer.append(figure);return canvas;
  });
  const base=new Image();base.src='./vfx-review-thumbs/base.png';
  const phoneBase=new Image();phoneBase.src='./vfx-review-thumbs/base-phone.png';
  const slider=q<HTMLInputElement>('#inspect-timeline'),time=q<HTMLOutputElement>('#inspect-time');
  const play=q<HTMLButtonElement>('#inspect-play'),size=q<HTMLSelectElement>('#inspect-size');
  const background=q<HTMLSelectElement>('#inspect-background'),speed=q<HTMLSelectElement>('#inspect-speed');
  let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,clock=playing?0:325,previous=performance.now(),seed=25488239;
  const setPlaying=(value:boolean)=>{playing=value;play.textContent=value?'Pause':'Play';};
  setPlaying(playing);
  const paint=()=>{
    const ms=Math.min(760,clock),radius=Number(size.value),width=radius===44?200:85,height=radius===44?100:85;
    const selected=types.value as VfxType,kind=kinds.value as VfxKind;
    canvases.forEach((canvas,i)=>{
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
      const ctx=canvas.getContext('2d')!;
      ctx.fillStyle='#fcf8ee';ctx.fillRect(0,0,width,height);
      const tileImage=radius===44?base:phoneBase;
      if(background.value==='occupied'&&tileImage.complete&&tileImage.naturalWidth)ctx.drawImage(tileImage,0,0,width,height);
      else {ctx.strokeStyle='#e5ddce';ctx.lineWidth=1;for(let x=-height;x<width;x+=12){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+height,height);ctx.stroke();}}
      drawFinalMatrixTile(ctx,i===0?selected:i===1?'fighting':'poison',kind,
        {x:width/2,y:background.value==='occupied'&&radius!==44?30:height/2,radius,seed},ms);
    });
    slider.value=String(ms);time.value=`${Math.round(ms)} ms`;
  };
  const reset=()=>{clock=playing?0:325;previous=performance.now();paint();};
  types.addEventListener('change',reset);kinds.addEventListener('change',reset);size.addEventListener('change',paint);background.addEventListener('change',paint);
  play.addEventListener('click',()=>{setPlaying(!playing);previous=performance.now();});
  q('#inspect-replay').addEventListener('click',()=>{setPlaying(true);reset();});
  q('#inspect-seed').addEventListener('click',()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;reset();});
  slider.addEventListener('input',()=>{setPlaying(false);clock=Number(slider.value);paint();});
  const open=async(type:string,kind:string)=>{
    types.value=type;kinds.value=kind;
    await loadFinalMatrixArt(type as VfxType);reset();dialog.showModal();paint();
  };
  for(const card of document.querySelectorAll<HTMLElement>('article')){
    const button=document.createElement('button');button.type='button';button.textContent='Compare motion';
    button.addEventListener('click',()=>void open(card.dataset.type!,card.dataset.kind!));card.querySelector('.content')!.append(button);
  }
  const params=new URLSearchParams(location.search),inspect=params.get('inspect');
  if(inspect){const [type,kind]=inspect.split('-');if(standardVfxTypes.some(t=>t===type)&&['physical','special','status'].includes(kind))void open(type,kind);}
  const tick=(now:number)=>{
    if(dialog.open&&!document.hidden){if(playing)clock=(clock+(now-previous)*Number(speed.value))%1020;paint();}
    previous=now;requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
