/* Vật lí 12 tương tác — lõi dùng chung.
   - VL.Ink3D: bộ vẽ 3D nét mực trên Canvas 2D (không cần WebGL, chạy được trên máy yếu)
   - VL.Graph: đồ thị theo token màu
   - VL.chrome: con dấu, dự đoán, thẻ lật, trình chiếu, chuyển bài
   - VL.GasSim: mô phỏng khí lí tưởng trong xi-lanh (dùng cho bài 2, 4, 5) */
(function(){
"use strict";
const VL = window.VL = {};

VL.LESSONS = [
  {id:'01',file:'01-cau-truc-chat.html',topic:1,title:'Cấu trúc của chất và sự chuyển thể',sim:'Mô hình phân tử rắn, lỏng, khí'},
  {id:'02',file:'02-noi-nang.html',topic:1,title:'Nội năng và định luật I nhiệt động lực học',sim:'Đun nóng và nén khí, theo dõi ΔU = A + Q'},
  {id:'03',file:'03-nhiet-dung-rieng.html',topic:1,title:'Nhiệt dung riêng, nhiệt nóng chảy riêng, nhiệt hoá hơi riêng',sim:'Đun nước đá đến khi hoá hơi hết'},
  {id:'04',file:'04-dong-hoc-phan-tu.html',topic:2,title:'Mô hình động học phân tử chất khí',sim:'Phân bố tốc độ và áp suất từ va chạm'},
  {id:'05',file:'05-dinh-luat-chat-khi.html',topic:2,title:'Các định luật chất khí và phương trình trạng thái',sim:'Đẳng nhiệt, đẳng áp, đẳng tích trong xi-lanh'},
  {id:'06',file:'06-luc-tu.html',topic:3,title:'Từ trường và lực từ tác dụng lên dòng điện',sim:'Dây dẫn trong nam châm chữ U'},
  {id:'07',file:'07-cam-ung-dien-tu.html',topic:3,title:'Từ thông và hiện tượng cảm ứng điện từ',sim:'Nam châm đi qua cuộn dây'},
  {id:'08',file:'08-may-phat-dien.html',topic:3,title:'Máy phát điện xoay chiều',sim:'Khung dây quay trong từ trường'},
  {id:'09',file:'09-hat-nhan.html',topic:4,title:'Cấu trúc hạt nhân và năng lượng liên kết',sim:'Dựng hạt nhân, so sánh độ bền'},
  {id:'10',file:'10-phong-xa.html',topic:4,title:'Hiện tượng phóng xạ và chu kì bán rã',sim:'Khối hạt nhân phân rã ngẫu nhiên'}
];
VL.TOPICS = {1:'Vật lí nhiệt',2:'Khí lí tưởng',3:'Từ trường',4:'Vật lí hạt nhân'};

VL.$ = id => document.getElementById(id);
VL.reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)').matches : false;
VL.fmt = (v, d=1) => (isFinite(v)?v:0).toLocaleString('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d});
VL.sci = (v, d=2) => { if(v===0||!isFinite(v)) return '0'; const e=Math.floor(Math.log10(Math.abs(v))); const m=v/Math.pow(10,e); return VL.fmt(m,d)+'×10'+String(e).split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)]||'⁻').join(''); };
VL.clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- theme tokens ---------- */
VL.tok = {};
const TOKS=['paper','paper-2','card','ink','ink-2','rule','hot','cold','accent','good','bad','violet','green','stamp'];
function hexToRgb(h){h=h.trim();if(h.startsWith('rgb')){const m=h.match(/[\d.]+/g);return m.slice(0,3).map(Number);}h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
VL.rgb = hexToRgb;
VL.mix = (a,b,t)=>{const A=hexToRgb(a),B=hexToRgb(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')';};
VL.alpha = (c,a)=>{const A=hexToRgb(c);return `rgba(${A[0]},${A[1]},${A[2]},${a})`;};
const themeCbs=[];
VL.heatScale=[];
function readTokens(){
  const cs=getComputedStyle(document.documentElement);
  TOKS.forEach(k=>VL.tok[k]=cs.getPropertyValue('--'+k).trim()||'#888');
  VL.heatScale=[]; const mid=VL.mix(VL.mix(VL.tok.cold,VL.tok.hot,0.5),VL.tok.card,0.35); for(let i=0;i<16;i++){const t=i/15; VL.heatScale.push(t<0.5?VL.mix(VL.tok.cold,mid,t*2):VL.mix(mid,VL.tok.hot,(t-0.5)*2));}
  themeCbs.forEach(f=>f());
}
VL.heat = t => VL.heatScale[Math.max(0,Math.min(15,Math.round(t*15)))];
VL.onTheme = f => themeCbs.push(f);
readTokens();
if(window.matchMedia){const mq=matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener?mq.addEventListener('change',readTokens):mq.addListener(readTokens);}
new MutationObserver(readTokens).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

/* ---------- vector helpers ---------- */
const V = VL.V = {
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len:a=>Math.hypot(a[0],a[1],a[2]), norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
  rotY:(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return [c*p[0]+s*p[2],p[1],-s*p[0]+c*p[2]];},
  rotX:(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return [p[0],c*p[1]-s*p[2],s*p[1]+c*p[2]];},
  rotZ:(p,a)=>{const c=Math.cos(a),s=Math.sin(a);return [c*p[0]-s*p[1],s*p[0]+c*p[1],p[2]];}
};

/* ---------- Ink3D: 3D nét mực trên Canvas 2D ---------- */
VL.Ink3D = function(el, opt){
  opt = Object.assign({target:[0,0,0],dist:6,az:0.6,el:0.3,fov:38,autoRotate:true,minEl:-0.2,maxEl:1.25,rotateSpeed:0.12},opt||{});
  const cv=document.createElement('canvas'); el.prepend(cv);
  const ctx=cv.getContext('2d');
  const S={canvas:cv,ctx,opt,az:opt.az,home:opt.az,sw:0,el:opt.el,dist:opt.dist,target:opt.target.slice(),w:1,h:1,dpr:1,items:[],dragging:false,idle:0,onDrag:null};
  function resize(){S.dpr=Math.min(window.devicePixelRatio||1,2);S.w=el.clientWidth||300;S.h=el.clientHeight||300;cv.width=Math.round(S.w*S.dpr);cv.height=Math.round(S.h*S.dpr);}
  if(window.ResizeObserver) new ResizeObserver(resize).observe(el); else window.addEventListener('resize',resize);
  resize();
  let lx=0,ly=0;
  el.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,select,a'))return;S.dragging=true;lx=e.clientX;ly=e.clientY;S.idle=0;try{el.setPointerCapture(e.pointerId);}catch(_){}});
  el.addEventListener('pointermove',e=>{if(!S.dragging)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
    if(S.onDrag && S.onDrag(dx,dy,e)) return;
    S.az-=dx*0.008;S.el=VL.clamp(S.el+dy*0.005,opt.minEl,opt.maxEl);});
  const up=()=>{S.dragging=false;};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
  // camera basis
  let cam,R,U,F,focal;
  S.begin=function(dt){
    if(S.dragging){S.home=S.az;S.sw=0;}else{S.idle+=dt||0; if(opt.autoRotate && !VL.reduce && S.idle>2.5){S.sw=(S.sw||0)+(dt||0);const want=S.home+0.42*Math.sin(S.sw*opt.rotateSpeed*2.2);S.az+=(want-S.az)*Math.min(1,(dt||0)*1.2);}}
    const t=S.target, ce=Math.cos(S.el);
    cam=[t[0]+Math.sin(S.az)*ce*S.dist, t[1]+Math.sin(S.el)*S.dist, t[2]+Math.cos(S.az)*ce*S.dist];
    F=V.norm(V.sub(t,cam)); R=V.norm(V.cross(F,[0,1,0])); U=V.cross(R,F);
    focal=(Math.min(S.h,S.w*1.25)/2)/Math.tan(opt.fov*Math.PI/360);
    S.items.length=0; S.cam=cam;
    ctx.setTransform(S.dpr,0,0,S.dpr,0,0); ctx.clearRect(0,0,S.w,S.h);
  };
  S.project=function(p){const d=[p[0]-cam[0],p[1]-cam[1],p[2]-cam[2]];const z=Math.max(0.05,d[0]*F[0]+d[1]*F[1]+d[2]*F[2]);const s=focal/z;
    return [S.w/2+(d[0]*R[0]+d[1]*R[1]+d[2]*R[2])*s, S.h/2-(d[0]*U[0]+d[1]*U[1]+d[2]*U[2])*s, z, s];};
  S.facing=function(p,n){const d=V.sub(cam,p);return V.dot(d,n)>0;};
  // items
  S.sphere=(p,r,col,o)=>{const q=S.project(p);S.items.push({t:0,z:q[2]+(o&&o.zb||0),x:q[0],y:q[1],r:Math.max(0.6,r*q[3]),col,a:o&&o.a!=null?o.a:1,ol:o&&o.outline});};
  S.line=(pts,col,w,o)=>{if(pts.length<2)return;const P=pts.map(S.project);let z=0;P.forEach(q=>z+=q[2]);S.items.push({t:1,z:z/P.length+(o&&o.zb||0),P,col,w:w||1.5,a:o&&o.a!=null?o.a:1,dash:o&&o.dash});};
  S.poly=(pts,fill,o)=>{const P=pts.map(S.project);let z=0;P.forEach(q=>z+=q[2]);S.items.push({t:2,z:z/P.length+(o&&o.zb||0),P,fill,stroke:o&&o.stroke,w:o&&o.w||1.2,a:o&&o.a!=null?o.a:1});};
  S.text=(p,str,col,o)=>{const q=S.project(p);S.items.push({t:3,z:(o&&o.front)?-1e9:q[2],x:q[0]+(o&&o.dx||0),y:q[1]+(o&&o.dy||0),str,col,font:o&&o.font||'600 12px '+getComputedStyle(document.body).getPropertyValue('--f-mono'),align:o&&o.align||'center'});};
  S.arrow=(a,b,col,w,o)=>{const d=V.sub(b,a),L=V.len(d);if(L<1e-4)return;const n=V.mul(d,1/L);const hl=Math.min(L*0.4,(o&&o.head)||0.18);
    const base=V.sub(b,V.mul(n,hl));S.line([a,base],col,w,o);
    // head: cone drawn as triangle facing camera
    const side=V.norm(V.cross(n,V.sub(cam,b)));const hw=hl*0.45;
    S.poly([b,V.add(base,V.mul(side,hw)),V.sub(base,V.mul(side,hw))],col,{a:o&&o.a!=null?o.a:1,zb:o&&o.zb});};
  S.ring=(c,r,axis,seg)=>{seg=seg||48;const pts=[];const a=V.norm(axis||[0,1,0]);let u=Math.abs(a[1])<0.9?V.norm(V.cross(a,[0,1,0])):V.norm(V.cross(a,[1,0,0]));const w=V.cross(a,u);
    for(let i=0;i<=seg;i++){const t=i/seg*Math.PI*2;pts.push(V.add(c,V.add(V.mul(u,Math.cos(t)*r),V.mul(w,Math.sin(t)*r))));}return pts;};
  S.box=(c,size,fill,o)=>{const [hx,hy,hz]=size.map(v=>v/2);const rot=o&&o.rot||(p=>p);
    const P=(x,y,z)=>V.add(c,rot([x,y,z]));
    const faces=[[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],
      [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]],
      [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]]];
    const shade=[0,0.08,0.16,0.16,-0.08,0.25];
    faces.forEach((f,i)=>{const n=rot(f[4]);const ctr=P(f[4][0]*hx,f[4][1]*hy,f[4][2]*hz);if(!S.facing(ctr,n))return;
      const col=typeof fill==='function'?fill(i):fill;
      S.poly(f.slice(0,4).map(v=>P(v[0]*hx,v[1]*hy,v[2]*hz)),shade[i]>0?VL.mix(col,'#000000',shade[i]*(o&&o.shadeK||1)):VL.mix(col,'#ffffff',-shade[i]),{stroke:o&&o.stroke,w:o&&o.w,a:o&&o.a});});};
  S.cylinder=(c,r,h,axis,fill,o)=>{ // solid cylinder: side quads + caps
    const a=V.norm(axis||[0,1,0]);const seg=(o&&o.seg)||28;const top=V.add(c,V.mul(a,h/2)),bot=V.sub(c,V.mul(a,h/2));
    const rt=S.ring(top,r,a,seg),rb=S.ring(bot,r,a,seg);
    for(let i=0;i<seg;i++){const mid=V.mul(V.add(V.add(rt[i],rt[i+1]),V.add(rb[i],rb[i+1])),0.25);const n=V.sub(mid,c);const nn=V.sub(n,V.mul(a,V.dot(n,a)));
      if(!S.facing(mid,nn))continue;const lit=0.5+0.5*V.dot(V.norm(nn),V.norm(V.sub(cam,mid)));
      S.poly([rt[i],rt[i+1],rb[i+1],rb[i]],VL.mix(fill,'#000000',0.28*(1-lit)),{a:o&&o.a});}
    if(S.facing(top,a)) S.poly(rt,VL.mix(fill,'#ffffff',0.08),{stroke:o&&o.stroke,w:o&&o.w,a:o&&o.a});
    if(S.facing(bot,V.mul(a,-1))) S.poly(rb,fill,{stroke:o&&o.stroke,w:o&&o.w,a:o&&o.a});
  };
  // sprite cache for spheres
  const sprites=new Map();
  function sprite(col){let s=sprites.get(col);if(s)return s;const n=64;s=document.createElement('canvas');s.width=s.height=n;const g=s.getContext('2d');
    g.beginPath();g.arc(n/2,n/2,n/2-2,0,7);g.fillStyle=col;g.fill();
    const gr=g.createRadialGradient(n*0.36,n*0.34,1,n*0.42,n*0.42,n*0.5);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(0.5,'rgba(255,255,255,.08)');gr.addColorStop(1,'rgba(0,0,0,.18)');
    g.fillStyle=gr;g.fill();g.lineWidth=2.5;g.strokeStyle='rgba(10,20,30,.45)';g.stroke();
    if(sprites.size>300)sprites.clear();sprites.set(col,s);return s;}
  S.end=function(){
    const it=S.items; it.sort((a,b)=>b.z-a.z);
    for(const o of it){
      if(o.t===0){ctx.globalAlpha=o.a;ctx.drawImage(sprite(o.col),o.x-o.r,o.y-o.r,o.r*2,o.r*2);}
      else if(o.t===1){ctx.globalAlpha=o.a;ctx.strokeStyle=o.col;ctx.lineWidth=o.w;ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(o.dash||[]);ctx.beginPath();ctx.moveTo(o.P[0][0],o.P[0][1]);for(let i=1;i<o.P.length;i++)ctx.lineTo(o.P[i][0],o.P[i][1]);ctx.stroke();ctx.setLineDash([]);}
      else if(o.t===2){ctx.globalAlpha=o.a;ctx.beginPath();ctx.moveTo(o.P[0][0],o.P[0][1]);for(let i=1;i<o.P.length;i++)ctx.lineTo(o.P[i][0],o.P[i][1]);ctx.closePath();if(o.fill){ctx.fillStyle=o.fill;ctx.fill();}
        if(o.stroke){ctx.strokeStyle=o.stroke;ctx.lineWidth=o.w;ctx.stroke();}else if(o.fill&&o.a>=1){ctx.strokeStyle=o.fill;ctx.lineWidth=0.6;ctx.stroke();}}
      else if(o.t===3){ctx.globalAlpha=1;ctx.font=o.font;ctx.fillStyle=o.col;ctx.textAlign=o.align;ctx.textBaseline='middle';ctx.fillText(o.str,o.x,o.y);}
    }
    ctx.globalAlpha=1;
  };
  return S;
};

/* ---------- Graph ---------- */
VL.Graph = function(canvas){
  const g=canvas.getContext('2d');
  function niceStep(range,count){const raw=range/count;const e=Math.pow(10,Math.floor(Math.log10(raw)));const m=raw/e;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*e;}
  function ticks(a,b,count){const st=niceStep(b-a,count||5);const out=[];for(let v=Math.ceil(a/st-1e-9)*st;v<=b+1e-9;v+=st)out.push(+v.toFixed(10));return out;}
  function label(v){const a=Math.abs(v);if(a===0)return '0';if(a>=1e4||a<1e-2)return VL.sci(v,1);return VL.fmt(v,a<1?2:(Math.round(v)===v?0:1));}
  return {draw(c){
    const d=Math.min(window.devicePixelRatio||1,2),W=canvas.clientWidth||300,H=canvas.clientHeight||200;
    if(canvas.width!==Math.round(W*d)||canvas.height!==Math.round(H*d)){canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);}
    g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);
    const T=VL.tok, L=c.left||54, Rm=14, Tm=14, B=38, pw=W-L-Rm, ph=H-Tm-B;
    const [x0,x1]=c.x,[y0,y1]=c.y;
    const X=v=>L+(v-x0)/(x1-x0)*pw, Y=v=>Tm+ph-(v-y0)/(y1-y0)*ph;
    const mono=getComputedStyle(document.body).getPropertyValue('--f-mono')||'monospace';
    g.font='11px '+mono;g.lineWidth=1;
    // bands
    (c.bands||[]).forEach(b=>{g.fillStyle=VL.alpha(T[b.color]||b.color,b.a||0.12);g.fillRect(X(b.x0),Tm,X(b.x1)-X(b.x0),ph);
      if(b.label){g.fillStyle=T['ink-2'];g.textAlign='center';g.textBaseline='bottom';const cx=(X(b.x0)+X(b.x1))/2;if(X(b.x1)-X(b.x0)>g.measureText(b.label).width+8)g.fillText(b.label,cx,Tm+ph-4);}});
    g.strokeStyle=T.rule;g.fillStyle=T['ink-2'];
    const xt=c.xTicks||ticks(x0,x1,W<420?4:6), yt=c.yTicks||ticks(y0,y1,4);
    g.textAlign='center';g.textBaseline='top';
    xt.forEach(v=>{const x=X(v);if(x<L-1||x>L+pw+1)return;g.beginPath();g.moveTo(x,Tm);g.lineTo(x,Tm+ph);g.stroke();g.fillText(c.xFmt?c.xFmt(v):label(v),x,Tm+ph+6);});
    g.textAlign='right';g.textBaseline='middle';
    yt.forEach(v=>{const y=Y(v);if(y<Tm-1||y>Tm+ph+1)return;g.beginPath();g.moveTo(L,y);g.lineTo(L+pw,y);g.stroke();g.fillText(c.yFmt?c.yFmt(v):label(v),L-6,y);});
    if(y0<0&&y1>0){g.strokeStyle=T['ink-2'];g.beginPath();g.moveTo(L,Y(0));g.lineTo(L+pw,Y(0));g.stroke();}
    g.strokeStyle=T.ink;g.beginPath();g.moveTo(L,Tm);g.lineTo(L,Tm+ph);g.lineTo(L+pw,Tm+ph);g.stroke();
    g.fillStyle=T.ink;g.textAlign='right';g.textBaseline='bottom';g.fillText(c.xl||'',L+pw,H-2);
    g.textAlign='left';g.textBaseline='top';g.fillText(c.yl||'',L+6,Tm+2);
    g.save();g.beginPath();g.rect(L,Tm-2,pw,ph+4);g.clip();
    (c.lines||[]).forEach(s=>{if(!s.pts||s.pts.length<2)return;g.strokeStyle=T[s.color]||s.color;g.lineWidth=s.width||2;g.setLineDash(s.dash||[]);g.globalAlpha=s.a||1;g.beginPath();
      let first=true;s.pts.forEach(p=>{if(p==null||!isFinite(p[1])){first=true;return;}const x=X(p[0]),y=Y(VL.clamp(p[1],y0-(y1-y0),y1+(y1-y0)));first?g.moveTo(x,y):g.lineTo(x,y);first=false;});g.stroke();g.setLineDash([]);g.globalAlpha=1;});
    (c.dots||[]).forEach(p=>{g.globalAlpha=p.a||1;g.fillStyle=T[p.color]||p.color||T['ink-2'];g.beginPath();g.arc(X(p.x),Y(p.y),p.r||2.5,0,7);g.fill();if(p.ring){g.strokeStyle=T.ink;g.lineWidth=1.5;g.stroke();}});
    g.globalAlpha=1;
    (c.texts||[]).forEach(t=>{g.fillStyle=T[t.color]||T['ink-2'];g.textAlign=t.align||'left';g.textBaseline=t.base||'bottom';g.fillText(t.text,X(t.x)+(t.dx||0),Y(t.y)+(t.dy||0));});
    g.restore();
    return {X,Y};
  }};
};

/* ---------- lesson chrome ---------- */
const SKEY='vl12-stamps';
function loadStamps(){try{return JSON.parse(localStorage.getItem(SKEY)||'{}')||{};}catch(e){return {};}}
function saveStamps(s){try{localStorage.setItem(SKEY,JSON.stringify(s));}catch(e){}}
VL.stamps=loadStamps;
VL.earn=function(kind){
  const id=VL.lessonId;if(!id)return;const s=loadStamps();s[id]=s[id]||{};
  const el=document.querySelector('.stamp[data-k="'+kind+'"]');if(el&&!el.classList.contains('on'))el.classList.add('on');
  if(!s[id][kind]){s[id][kind]=1;saveStamps(s);}
};
VL.chrome=function(lessonId){
  VL.lessonId=lessonId;
  const L=VL.LESSONS, idx=L.findIndex(l=>l.id===lessonId), me=L[idx];
  // stamps + present
  const act=VL.$('actions');
  if(act){act.innerHTML='<div class="stamps" aria-label="Con dấu đã đạt"><div class="stamp" data-k="predict">Dự<br>đoán</div><div class="stamp" data-k="lab">Thí<br>nghiệm</div><div class="stamp" data-k="ex">Bài<br>tập</div></div><button class="btn" id="presentBtn" type="button">Trình chiếu</button>';
    const s=loadStamps()[lessonId]||{};Object.keys(s).forEach(k=>{const e=act.querySelector('[data-k="'+k+'"]');if(e)e.classList.add('on');});
    const pb=VL.$('presentBtn');pb.addEventListener('click',()=>{const on=document.body.classList.toggle('present');pb.textContent=on?'Thoát trình chiếu':'Trình chiếu';
      try{if(on&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});}catch(e){}
      window.dispatchEvent(new Event('resize'));});
  }
  // crumb
  const cr=VL.$('crumb');
  if(cr&&me) cr.innerHTML='<a href="../index.html">← Mục lục</a><span>Chủ đề '+me.topic+' · '+VL.TOPICS[me.topic]+'</span><span>Bài '+(idx+1)+' / '+L.length+'</span>';
  // pager
  const pg=VL.$('pager');
  if(pg){let h='';if(idx>0)h+='<a class="prev" href="'+L[idx-1].file+'"><small>← Bài trước</small>'+L[idx-1].title+'</a>';
    if(idx<L.length-1)h+='<a class="next" href="'+L[idx+1].file+'"><small>Bài tiếp →</small>'+L[idx+1].title+'</a>';pg.innerHTML=h;}
  // flips
  let opened=0;const flips=document.querySelectorAll('[data-ans]');
  flips.forEach(b=>b.addEventListener('click',()=>{const a=b.nextElementSibling;const show=a.hidden;a.hidden=!show;b.textContent=show?'Ẩn đáp án':'Lật đáp án';
    if(show&&!b.dataset.seen){b.dataset.seen=1;opened++;if(opened>=flips.length)VL.earn('ex');}}));
  // predict
  const ch=document.querySelector('.choices[data-correct]');
  if(ch){const fb=VL.$('predictFb');ch.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{
    ch.querySelectorAll('.choice').forEach(x=>x.classList.remove('right','wrong'));
    const ok=b.dataset.k===ch.dataset.correct;b.classList.add(ok?'right':'wrong');
    ch.querySelector('[data-k="'+ch.dataset.correct+'"]').classList.add(ok?'right':'x');
    if(fb){fb.hidden=false;fb.textContent=ok?fb.dataset.right:fb.dataset.wrong;}
    if(ok)VL.earn('predict');
    window.dispatchEvent(new CustomEvent('vl:predict',{detail:{ok,k:b.dataset.k}}));
  }));}
};

/* ---------- tried-modes tracker ---------- */
VL.Tried=function(names,el,need){const set=new Set();need=need||Object.keys(names).length;
  return {add(k){if(!names[k])return;set.add(k);if(el)el.textContent=[...set].map(x=>names[x]).join(', ')+(set.size>=need?' — đã đủ.':'');if(set.size>=need)VL.earn('lab');},has:k=>set.has(k)};};

/* ---------- loop helper ---------- */
VL.loop=function(fn){let last=performance.now();function f(now){const dt=Math.min(0.05,Math.max(0,(now-last)/1000));last=now;try{fn(dt,now/1000);}catch(e){console.error(e);}requestAnimationFrame(f);}requestAnimationFrame(f);};

/* ---------- Gas in a cylinder (ideal, no intermolecular collisions) ---------- */
VL.GasSim=function(o){
  o=Object.assign({R:0.9,maxN:600,speedRef:1.5},o||{});
  const G={R:o.R,count:0,impulse:0,impTime:0,ratio:1,px:null};
  let px,py,pz,vx,vy,vz;
  function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  G.alloc=function(N,h,sigma){const old=G.count,O={px,py,pz,vx,vy,vz};
    px=new Float32Array(N);py=new Float32Array(N);pz=new Float32Array(N);vx=new Float32Array(N);vy=new Float32Array(N);vz=new Float32Array(N);
    for(let i=0;i<N;i++){if(i<old){px[i]=O.px[i];py[i]=O.py[i];pz[i]=O.pz[i];vx[i]=O.vx[i];vy[i]=O.vy[i];vz[i]=O.vz[i];continue;}
      const r=G.R*Math.sqrt(Math.random())*.97,a=Math.random()*Math.PI*2;px[i]=r*Math.cos(a);pz[i]=r*Math.sin(a);py[i]=Math.random()*h*.97;
      vx[i]=gauss()*sigma;vy[i]=gauss()*sigma;vz[i]=gauss()*sigma;}
    G.count=N;G.px=px;G.py=py;G.pz=pz;G.vx=vx;G.vy=vy;G.vz=vz;};
  G.step=function(dt,h,pistonV){const R=G.R,R2=R*R;pistonV=pistonV||0;
    for(let i=0;i<G.count;i++){px[i]+=vx[i]*dt;py[i]+=vy[i]*dt;pz[i]+=vz[i]*dt;
      if(py[i]<0){py[i]=-py[i];vy[i]=Math.abs(vy[i]);G.impulse+=2*vy[i];}
      if(py[i]>h){py[i]=Math.max(0,2*h-py[i]);if(vy[i]>pistonV){G.impulse+=2*(vy[i]-pistonV);vy[i]=2*pistonV-vy[i];}}
      const r2=px[i]*px[i]+pz[i]*pz[i];
      if(r2>R2){const r=Math.sqrt(r2),nx=px[i]/r,nz=pz[i]/r,vn=vx[i]*nx+vz[i]*nz;if(vn>0){vx[i]-=2*vn*nx;vz[i]-=2*vn*nz;G.impulse+=2*vn;}px[i]=nx*R*.999;pz[i]=nz*R*.999;}}
    G.impTime+=dt;};
  G.ke=function(){let s=0;for(let i=0;i<G.count;i++)s+=vx[i]*vx[i]+vy[i]*vy[i]+vz[i]*vz[i];return s;};
  G.thermostat=function(sigma){const s=G.ke(),t=G.count*3*sigma*sigma;if(s<=0)return;const k=Math.sqrt(t/s);for(let i=0;i<G.count;i++){vx[i]*=k;vy[i]*=k;vz[i]*=k;}};
  G.measure=function(h,sigma){if(G.impTime<0.6)return G.ratio;const R=G.R,area=2*Math.PI*R*R+2*Math.PI*R*h,vol=Math.PI*R*R*h;
    const exp=G.count*sigma*sigma/vol;const meas=G.impulse/(area*G.impTime);G.ratio=G.ratio*0.6+(exp>0?meas/exp:1)*0.4;G.impulse=0;G.impTime=0;return G.ratio;};
  G.speed=i=>Math.sqrt(vx[i]*vx[i]+vy[i]*vy[i]+vz[i]*vz[i]);
  // draw: cylinder walls, piston, particles
  G.draw=function(S,h,Hmax,opt){opt=opt||{};const T=VL.tok,R=G.R;
    // walls
    S.line(S.ring([0,0,0],R),T.ink,1.8);S.line(S.ring([0,Hmax,0],R),T.rule,1.2);
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2;S.line([[Math.cos(a)*R,0,Math.sin(a)*R],[Math.cos(a)*R,Hmax,Math.sin(a)*R]],k%4===0?T.ink:T.rule,k%4===0?1.2:0.8,{a:k%4===0?0.7:0.8});}
    // base plate
    S.cylinder([0,-0.05,0],R*1.18,0.08,[0,1,0],VL.mix(T['ink-2'],T.card,0.25),{seg:36});
    // piston
    if(opt.piston!==false){S.cylinder([0,h+0.045,0],R*0.995,0.09,[0,1,0],T['ink-2'],{seg:36,stroke:T.ink,w:1});
      S.cylinder([0,h+0.9,0],0.05,1.6,[0,1,0],T['ink-2'],{seg:10});S.cylinder([0,h+1.72,0],0.22,0.06,[0,1,0],T['ink-2'],{seg:20});}
    // particles
    const ref=opt.speedRef||o.speedRef;const rad=opt.radius||0.036;
    for(let i=0;i<G.count;i++){const sp=G.speed(i);S.sphere([px[i],py[i],pz[i]],rad,opt.color?opt.color(i,sp):VL.heat(sp/ref));}
  };
  return G;
};
})();
