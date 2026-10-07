const id=()=>crypto.randomUUID?.()||Math.random().toString(36).slice(2);
const el=(type,o)=>({id:id(),type,x:450,y:300,width:300,height:70,rotation:0,scaleX:1,scaleY:1,opacity:1,zIndex:1,visible:true,startTime:0,endTime:5,color:'#fff',keyframes:{},...o});
export const templateDefs=[
 {id:'product-launch',name:'Product Launch',duration:6,background:'#101827',accent:'#38bdf8'},
 {id:'flash-sale',name:'Flash Sale',duration:6,background:'#1b1015',accent:'#fb7185'},
 {id:'food-promo',name:'Food Promo',duration:6,background:'#17120b',accent:'#f59e0b'},
 {id:'app-launch',name:'App Launch',duration:6,background:'#0d1720',accent:'#34d399'},
 {id:'event-promo',name:'Event Promo',duration:6,background:'#171329',accent:'#a78bfa'}
];
export function makeProject(def=templateDefs[2],data={}){
 const a=data.advertisement||data;
 return {name:a.name||def.name,category:data.category||'food',duration:def.duration,width:900,height:506,background:def.background,advertisement:a,elements:[
  el('rectangle',{x:450,y:253,width:900,height:506,color:def.background,zIndex:0,endTime:def.duration,keyframes:{opacity:[{time:0,value:0},{time:1,value:1}]}}),
  el('circle',{x:735,y:100,width:170,height:170,color:def.accent,zIndex:1,endTime:def.duration,keyframes:{scaleX:[{time:0,value:.2},{time:1,value:1}],scaleY:[{time:0,value:.2},{time:1,value:1}],opacity:[{time:0,value:0},{time:1,value:1}]}}),
  el('text',{text:a.name||'URBAN BREW',x:450,y:145,width:700,height:60,fontSize:52,fontWeight:800,color:'#f8fafc',zIndex:2,endTime:def.duration,keyframes:{x:[{time:0,value:250},{time:1,value:450}],opacity:[{time:0,value:0},{time:1,value:1}]}}),
  el('text',{text:a.title||'Cold Coffee',x:450,y:220,width:650,height:55,fontSize:36,fontWeight:600,color:def.accent,zIndex:3,startTime:1,endTime:def.duration,keyframes:{scaleX:[{time:1,value:.3},{time:2,value:1}],scaleY:[{time:1,value:.3},{time:2,value:1}],opacity:[{time:1,value:0},{time:2,value:1}]}}),
  el('text',{text:a.price||'₹149',x:450,y:315,width:300,height:90,fontSize:78,fontWeight:900,color:'#fff',zIndex:4,startTime:2,endTime:def.duration,keyframes:{scaleX:[{time:2,value:.2},{time:2.8,value:1}],scaleY:[{time:2,value:.2},{time:2.8,value:1}],opacity:[{time:2,value:0},{time:2.6,value:1}]}}),
  el('text',{text:a.offer||'20% OFF',x:450,y:395,width:320,height:50,fontSize:32,fontWeight:800,color:def.accent,zIndex:5,startTime:3,endTime:def.duration,keyframes:{y:[{time:3,value:450},{time:3.7,value:395}],opacity:[{time:3,value:0},{time:3.7,value:1}]}}),
  el('rectangle',{x:450,y:455,width:240,height:58,color:def.accent,zIndex:6,startTime:4,endTime:def.duration,keyframes:{scaleX:[{time:4,value:.7},{time:4.7,value:1}],scaleY:[{time:4,value:.7},{time:4.7,value:1}],opacity:[{time:4,value:0},{time:4.7,value:1}]}}),
  el('text',{text:a.cta||'ORDER NOW',x:450,y:455,width:220,height:40,fontSize:24,fontWeight:800,color:'#08111d',zIndex:7,startTime:4,endTime:def.duration,keyframes:{opacity:[{time:4,value:0},{time:4.8,value:1}]}}),
  ...(data.assets?.image?[el('image',{x:690,y:300,width:220,height:165,zIndex:8,startTime:2,endTime:def.duration,imageKey:'campaign',keyframes:{scaleX:[{time:2,value:.2},{time:2.7,value:1}],scaleY:[{time:2,value:.2},{time:2.7,value:1}],opacity:[{time:2,value:0},{time:2.7,value:1}]}})]:[])
 ]};
}
