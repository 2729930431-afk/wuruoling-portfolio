const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// Navigation and motion use ordinary links, with the same keyboard paths.
const menu=document.querySelector('#site-menu'),menuButton=document.querySelector('.menu-toggle');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','打开导航菜单');document.body.classList.remove('menu-open')}
menuButton.onclick=()=>{const opening=menu.hidden;menu.hidden=!opening;menuButton.setAttribute('aria-expanded',String(opening));menuButton.setAttribute('aria-label',opening?'关闭导航菜单':'打开导航菜单');document.body.classList.toggle('menu-open',opening);if(opening)menu.querySelector('a').focus()};
menu.querySelectorAll('a').forEach(a=>a.onclick=closeMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus()}if(e.key==='Tab'&&!menu.hidden){const links=[...menu.querySelectorAll('a')];if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();menuButton.focus()}else if(e.shiftKey&&document.activeElement===menuButton){e.preventDefault();links.at(-1).focus()}}});
// Reset only after leaving the viewport so both scroll directions can replay
// without flickering when an element crosses the entrance threshold.
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
 const outside=e.boundingClientRect.bottom<=0||e.boundingClientRect.top>=innerHeight;
 if(outside){
  e.target.style.setProperty('--reveal-offset',e.boundingClientRect.bottom<=0?'-25px':'25px');
  e.target.classList.remove('is-visible');
 }else if(e.isIntersecting&&e.intersectionRatio>=.12){
  e.target.classList.add('is-visible');
 }
}),{threshold:[0,.12]});
document.querySelectorAll('.section-head,.project-card,.studio-intro,.steps article').forEach(el=>{el.classList.add('scroll-reveal');observer.observe(el)});
const finePointer=matchMedia('(pointer:fine)');
document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced.matches||!finePointer.matches)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.15}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});
document.querySelectorAll('.project-cover').forEach(el=>{el.addEventListener('pointermove',e=>{if(reduced.matches||!finePointer.matches)return;const r=el.getBoundingClientRect();el.style.setProperty('--px',`${(e.clientX-r.left)/r.width}`);el.style.setProperty('--py',`${(e.clientY-r.top)/r.height}`)});el.addEventListener('pointerleave',()=>{el.style.setProperty('--px','.5');el.style.setProperty('--py','.5')})});

// Scroll is a reversible timeline. The browser retains native scrolling.
const cards=[...document.querySelectorAll('.project-card')];let scrollFrame=0,scrollTarget=scrollY,scrollSmooth=scrollY;
function updateScrollMotion(){scrollFrame=0;const gap=scrollTarget-scrollSmooth;scrollSmooth+=gap*.12;
 for(const card of cards){const rect=card.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)continue;const y=reduced.matches?0:Math.max(-14,Math.min(14,gap*.025));card.style.setProperty('--scroll-drift',y+'px');}
 if(Math.abs(gap)>.1)scrollFrame=requestAnimationFrame(updateScrollMotion);
}
addEventListener('scroll',()=>{scrollTarget=scrollY;if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScrollMotion)},{passive:true});updateScrollMotion();
