import {getAnimatedState} from './Animation';
export function renderScene(ctx,project,time,images={}){
  const {width,height}=project; ctx.clearRect(0,0,width,height); ctx.fillStyle=project.background||'#111827'; ctx.fillRect(0,0,width,height);
  [...project.elements].filter(e=>e.visible!==false&&time>=e.startTime&&time<=e.endTime).sort((a,b)=>a.zIndex-b.zIndex).forEach(raw=>{
    const e=getAnimatedState(raw,time); ctx.save();
    ctx.translate(e.x,e.y); ctx.rotate((e.rotation*Math.PI)/180); ctx.scale(e.scaleX,e.scaleY); ctx.globalAlpha=e.opacity;
    if(e.type==='rectangle'){ctx.fillStyle=e.color;ctx.fillRect(-e.width/2,-e.height/2,e.width,e.height)}
    else if(e.type==='circle'){ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(0,0,e.width/2,0,Math.PI*2);ctx.fill()}
    else if(e.type==='text'){ctx.fillStyle=e.color;ctx.font=`${e.fontWeight||700} ${e.fontSize||40}px ${e.fontFamily||'Arial'}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.text||'',0,0)}
    else if(e.type==='image'&&images[e.imageKey]?.complete){ctx.drawImage(images[e.imageKey],-e.width/2,-e.height/2,e.width,e.height)}
    ctx.restore();
  });
}
export function hitTest(project,time,x,y){
  const items=[...project.elements].filter(e=>e.visible!==false&&time>=e.startTime&&time<=e.endTime).sort((a,b)=>b.zIndex-a.zIndex);
  for(const raw of items){const e=getAnimatedState(raw,time);const dx=x-e.x,dy=y-e.y,a=-(e.rotation*Math.PI)/180;const rx=dx*Math.cos(a)-dy*Math.sin(a),ry=dx*Math.sin(a)+dy*Math.cos(a);if(Math.abs(rx)<=Math.abs(e.width*e.scaleX)/2&&Math.abs(ry)<=Math.abs(e.height*e.scaleY)/2)return e.id}return null;
}
