export function interpolate(keyframes = [], time, fallback) {
  if (!keyframes.length) return fallback;
  const k = [...keyframes].sort((a,b)=>a.time-b.time);
  if (time <= k[0].time) return k[0].value;
  if (time >= k[k.length-1].time) return k[k.length-1].value;
  for (let i=0;i<k.length-1;i++) {
    const a=k[i], b=k[i+1];
    if (time>=a.time && time<=b.time) {
      const p=Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time)));
      return a.value+(b.value-a.value)*p;
    }
  }
  return fallback;
}
export function animatedValue(element, prop, time) { return interpolate(element.keyframes?.[prop]||[],time,element[prop]); }
export function getAnimatedState(element,time){
  return {...element,...Object.fromEntries(['x','y','scaleX','scaleY','rotation','opacity'].map(p=>[p,animatedValue(element,p,time)]))};
}
export function presetKeyframes(element,preset){
  const s=element.startTime||0, e=Math.min(element.endTime||1,s+1), x=element.x, y=element.y;
  const k={...(element.keyframes||{})};
  if(preset==='Fade In') k.opacity=[{time:s,value:0},{time:e,value:1}];
  if(preset==='Slide In Left') k.x=[{time:s,value:x-300},{time:e,value:x}];
  if(preset==='Slide In Right') k.x=[{time:s,value:x+300},{time:e,value:x}];
  if(preset==='Slide Up') k.y=[{time:s,value:y+250},{time:e,value:y}];
  if(preset==='Zoom In'){k.scaleX=[{time:s,value:.2},{time:e,value:element.scaleX}];k.scaleY=[{time:s,value:.2},{time:e,value:element.scaleY}]}
  if(preset==='Rotate In') k.rotation=[{time:s,value:(element.rotation||0)-180},{time:e,value:element.rotation||0}];
  if(preset==='Pop'){k.scaleX=[{time:s,value:.15},{time:s+.45,value:1.12},{time:e,value:1}];k.scaleY=[{time:s,value:.15},{time:s+.45,value:1.12},{time:e,value:1}];}
  return k;
}
