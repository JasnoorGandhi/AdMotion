import {renderScene,hitTest} from './Renderer';
export class GraphicsEngine {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images={};}
  registerImage(id,src){const img=new Image();img.onload=()=>this.render(this.project,this.time);img.src=src;this.images[id]=img;}
  render(project,time){this.project=project;this.time=time;renderScene(this.ctx,project,time,this.images)}
  hit(project,time,x,y){return hitTest(project,time,x,y)}
}
