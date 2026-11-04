import './site-motion.js';
const hero=document.querySelector('.spotlight-hero'),canvas=document.querySelector('#spotlight-canvas'),ctx=canvas.getContext('2d'),title=document.querySelector('#spotlight-title');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,raf=0,visible=true,paused=reduced.matches,time=0,last=0,idle=0;
let target={x:.52,y:.42},light={x:.52,y:.42},pressed=false;
const dust=Array.from({length:innerWidth<650?38:76},(_,i)=>({x:(Math.sin(i*97.31)*.5+.5),y:(Math.sin(i*63.21+3)*.5+.5),z:.2+(i%7)/9,r:.45+i%3*.35}));
function resize(){const r=hero.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);requestFrame()}
function requestFrame(){if(!raf)raf=requestAnimationFrame(draw)}
function draw(now){raf=0;if(document.hidden||!visible)return;const dt=Math.min((now-last)/1000||.016,.05);last=now;
 if(!paused){time+=dt;idle+=dt;if(idle>4&&!pressed){target.x=.5+Math.sin(time*.16)*.13;target.y=.42+Math.cos(time*.21)*.05}light.x+=(target.x-light.x)*.045;light.y+=(target.y-light.y)*.045}
 const x=light.x*width,y=light.y*height;
 ctx.clearRect(0,0,width,height);
 // Soft light travels through a dark room, rather than moving the content.
 const radius=Math.max(width*.38,300),intensity=pressed?.2:.115;
 const ambient=ctx.createRadialGradient(x,y,1,x,y,radius);ambient.addColorStop(0,`rgba(238,222,194,${intensity})`);ambient.addColorStop(.3,'rgba(190,184,167,.055)');ambient.addColorStop(1,'rgba(70,74,80,0)');ctx.fillStyle=ambient;ctx.fillRect(0,0,width,height);
 const sourceX=width*.47,sourceY=-height*.2;
 ctx.save();ctx.filter='blur(30px)';const beam=ctx.createLinearGradient(sourceX,0,x,y+height*.2);beam.addColorStop(0,'rgba(226,216,197,.13)');beam.addColorStop(.65,'rgba(200,198,188,.028)');beam.addColorStop(1,'rgba(200,198,188,0)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(sourceX-15,sourceY);ctx.lineTo(x+width*.29,y+height*.34);ctx.quadraticCurveTo(x,y+height*.48,x-width*.24,y+height*.32);ctx.lineTo(sourceX+15,sourceY);ctx.fill();ctx.restore();
 for(const d of dust){const px=(d.x*width+Math.sin(time*.11+d.z*9)*20+width)%width,py=(d.y*height-time*(3+d.z*8)%height+height)%height;const distance=Math.hypot((px-x)/radius,(py-y)/radius);const alpha=Math.max(0,1-distance)*.32*d.z;ctx.fillStyle=`rgba(224,217,196,${alpha})`;ctx.beginPath();ctx.arc(px,py,d.r,0,Math.PI*2);ctx.fill()}
 const tr=title.getBoundingClientRect(),hr=hero.getBoundingClientRect();title.style.setProperty('--light-x',`${x-(tr.left-hr.left)}px`);title.style.setProperty('--light-y',`${y-(tr.top-hr.top)}px`);hero.style.setProperty('--glow-x',`${light.x*100}%`);hero.style.setProperty('--glow-y',`${light.y*100}%`);
 document.querySelector('#light-coordinate').textContent=`${String(Math.round(light.x*100)).padStart(3,'0')} : ${String(Math.round(light.y*100)).padStart(3,'0')}`;
 if(!paused)requestFrame();
}
hero.addEventListener('pointermove',e=>{if(paused)return;const r=hero.getBoundingClientRect();target={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};idle=0;requestFrame()});
hero.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;pressed=true;idle=0;requestFrame()});
for(const event of ['pointerup','pointercancel','pointerleave'])hero.addEventListener(event,()=>{pressed=false;requestFrame()});
const motion=document.querySelector('#light-motion');function motionState(){motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'播放聚光动画':'暂停聚光动画');motion.textContent=paused?'▶':'Ⅱ'}
motion.onclick=()=>{paused=!paused;motionState();requestFrame()};reduced.addEventListener('change',e=>{paused=e.matches;motionState();requestFrame()});motionState();
new ResizeObserver(resize).observe(hero);new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)requestFrame()}).observe(hero);document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=performance.now();requestFrame()}});resize();

// A native horizontal rail preserves trackpad, touch and keyboard navigation.
const rail=document.querySelector('#project-grid'),previous=document.querySelector('#work-prev'),next=document.querySelector('#work-next');
let down=false,startX=0,startScroll=0,moved=false,lastX=0,velocity=0,inertia=0;
function railState(){const max=rail.scrollWidth-rail.clientWidth;previous.disabled=rail.scrollLeft<3;next.disabled=max-rail.scrollLeft<3;const thumb=document.querySelector('.work-track i');const ratio=Math.max(.08,rail.clientWidth/rail.scrollWidth);thumb.style.width=`${ratio*100}%`;thumb.style.transform=`translateX(${max?rail.scrollLeft/max*rail.clientWidth*(1-ratio):0}px)`}
function advance(direction){rail.scrollBy({left:direction*rail.clientWidth*.78,behavior:reduced.matches?'instant':'smooth'})}
previous.onclick=()=>advance(-1);next.onclick=()=>advance(1);rail.addEventListener('scroll',railState,{passive:true});new ResizeObserver(railState).observe(rail);
rail.addEventListener('keydown',e=>{if(e.target!==rail)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();advance(e.key==='ArrowRight'?1:-1)}});
rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;startX=lastX=e.clientX;startScroll=rail.scrollLeft;velocity=0;cancelAnimationFrame(inertia)});
rail.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(Math.abs(dx)>5){moved=true;rail.classList.add('is-dragging');rail.scrollLeft=startScroll-dx;velocity=lastX-e.clientX;lastX=e.clientX;rail.setPointerCapture?.(e.pointerId)}});
function endDrag(){if(!down)return;down=false;rail.classList.remove('is-dragging');if(!moved||reduced.matches)return;function coast(){velocity*=.91;rail.scrollLeft+=velocity;if(Math.abs(velocity)>.3)inertia=requestAnimationFrame(coast)}inertia=requestAnimationFrame(coast)}
rail.addEventListener('pointerup',endDrag);rail.addEventListener('pointercancel',endDrag);rail.addEventListener('dragstart',e=>e.preventDefault());
rail.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{cancelAnimationFrame(inertia);rail.scrollLeft=0;requestAnimationFrame(railState)}));railState();

// Folded project strips: touch devices use a deliberate preview-first tap.
const foldedCards=[...rail.querySelectorAll('.project-card')];
const touchLayout=matchMedia('(hover:none)');
function previewHint(){document.querySelector('.work-navigation>span').textContent=touchLayout.matches?'横向探索 / 轻触展开 · 再次点击查看':'横向探索 / 悬浮展开 · 点击查看'}
touchLayout.addEventListener('change',previewHint);previewHint();
foldedCards.forEach((card,i)=>{card.dataset.index=String(i+1).padStart(2,'0');new ResizeObserver(railState).observe(card)});
rail.addEventListener('click',e=>{
 const trigger=e.target.closest('[data-project]');if(!trigger)return;
 if(!matchMedia('(hover:none)').matches&&e.pointerType!=='touch')return;
 const card=trigger.closest('.project-card');
 if(!card.classList.contains('touch-open')){
  e.preventDefault();e.stopImmediatePropagation();foldedCards.forEach(c=>c.classList.toggle('touch-open',c===card));
 }
},true);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>foldedCards.forEach(c=>c.classList.remove('touch-open'))));

