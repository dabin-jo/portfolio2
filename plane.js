/* ===== 03 REVEAL: 빛의 면 =====
   점(01 LOOK 빛) → 선(02 FIND 형광펜) → 면(03 REVEAL). 같은 빛 3색이 끝까지 이어지는 주인공.
   - 들어올 때(Plane.enter): FIND의 형광펜 줄들이 화면 위로 떠올라 같은 색끼리 한 줄로 모이고(선) →
     그 줄이 눈 뜨듯 위아래로 벌어지며 빛의 면이 됨(면) → 면 위에 ABOUT · CONTACT · 경력사항 글이 켜짐.
   - 나갈 때(Plane.leave): 거꾸로 면이 줄로 접히고 → 형광펜 자리로 돌아감.
   - 면은 빛이라 겹치는 곳은 색이 더해져 밝아짐(mix-blend-mode: screen). 마우스를 올리면 그 자리가 더 밝게 비춰짐.
   면의 위치·크기는 style.css `03 REVEAL: 빛의 면` 블록의 .r-lime / .r-pink / .r-blue에서 조절.
   script.js보다 먼저 불러옴(script.js Scenes가 window.Plane을 씀). */
const Plane=(()=>{
  const sec=document.getElementById('end');
  if(!sec)return{enter:async()=>{},leave:async()=>{},reset(){}};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLOR=['#E4FF8C','#FF9DB4','#4B84E1']; // 빛 0 초록 별 · 1 핑크 육각형 · 2 파랑 네잎 (find.js HL과 같음)
  const planes=[0,1,2].map(i=>sec.querySelector(`.lp[data-light="${i}"]`));
  const ENTER_MS=1700,LEAVE_MS=1200;

  const clamp01=t=>t<0?0:t>1?1:t;
  const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const easeOut=t=>1-Math.pow(1-t,3);
  const lerp=(a,b,t)=>a+(b-a)*t;
  const raf=(ms,fn)=>new Promise(res=>{if(reduce){fn(1);return res();}const t0=performance.now();(function f(now){const t=Math.min(1,(now-t0)/ms);fn(t);t<1?requestAnimationFrame(f):res();})(t0);});

  /* 형광펜 줄 위치(화면 좌표). 형광펜 색 띠는 글줄 높이의 82%, 살짝 아래(find.js/.hl과 같게) */
  function strips(){
    const out=[];
    if(!window.Find)return out;
    [0,1,2].forEach(i=>Find.route(i).forEach(r=>{
      const h=r.h*.82;out.push({i,x:r.x0,y:r.y-r.h/2+(r.h-h)*.58,w:r.x1-r.x0,h});
    }));
    return out;
  }
  function planeRect(i){const r=planes[i].getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height};}

  /* 옮겨 다니는 빛 띠를 그릴 판(화면 맨 위에 잠깐) */
  let layer=null;
  function makeLayer(list){
    layer=document.createElement('div');layer.className='lp-fly';
    // 같은 색 띠끼리는 한 묶음(겹쳐도 그 색 그대로), 다른 색 묶음끼리만 빛처럼 더해짐
    const g=COLOR.map(c=>{const e=document.createElement('div');e.className='lp-g';e.style.setProperty('--pc',c);layer.appendChild(e);return e;});
    list.forEach(s=>{const d=document.createElement('i');g[s.i].appendChild(d);s.el=d;});
    document.body.appendChild(layer);
  }
  function killLayer(){layer&&layer.remove();layer=null;}

  /* t(0→1): 앞 55%는 줄이 제 면의 가운데 높이·폭으로 모이고(선), 뒤 55%는 위아래로 벌어져 면이 됨 */
  function place(s,R,t){
    const a=easeIO(clamp01(t/.55)),b=easeIO(clamp01((t-.45)/.55));
    const w=lerp(s.w,R.w,a),x=lerp(s.x,R.x,a);
    const cy=lerp(s.y+s.h/2,R.y+R.h/2,a);
    const h0=lerp(s.h,Math.max(s.h,6),a),h=lerp(h0,R.h,b);
    const st=s.el.style;
    st.transform=`translate(${x.toFixed(1)}px,${(cy-h/2).toFixed(1)}px)`;
    st.width=w.toFixed(1)+'px';st.height=h.toFixed(1)+'px';
    st.setProperty('--g',(.25+.75*b).toFixed(3)); // 면이 될수록 빛 번짐이 커짐
  }

  let busy=false;
  /* FIND(형광펜) → REVEAL(면). find = FIND 장면 요소 */
  async function enter(find,vis){
    busy=true;reset();
    const list=strips();
    vis(sec,true);sec.classList.add('lp-ready'); // 면 자리를 재려고 보이게(면 자체는 아직 숨김)
    const R=[0,1,2].map(planeRect);
    const n=list.length||1;
    list.forEach((s,k)=>s.d=k/n*.18); // 줄마다 조금씩 늦게 출발
    makeLayer(list);
    list.forEach(s=>place(s,R[s.i],0));
    if(window.Find)find.querySelectorAll('.hl.on').forEach(el=>el.classList.add('lifted')); // 형광펜 색은 띠가 들고 감
    await raf(ENTER_MS,t=>{
      find.style.opacity=(1-easeOut(clamp01(t/.35))).toFixed(3);
      list.forEach(s=>place(s,R[s.i],clamp01((t-s.d)/(1-.18))));
    });
    vis(find,false);find.style.opacity='';
    find.querySelectorAll('.hl.lifted').forEach(el=>el.classList.remove('lifted'));
    sec.classList.add('lp-lit');killLayer(); // 진짜 면으로 바꿔 끼움
    requestAnimationFrame(()=>sec.classList.add('lp-on')); // 글이 차례로 켜짐
    busy=false;
  }
  /* REVEAL(면) → FIND(형광펜) */
  async function leave(find,vis){
    busy=true;
    const R=[0,1,2].map(planeRect);
    sec.classList.remove('lp-on','lp-ready'); // 글·제목부터 꺼짐
    await raf(260,()=>{});
    vis(find,true);find.style.opacity=0;
    const list=strips();const n=list.length||1;
    list.forEach((s,k)=>s.d=(n-1-k)/n*.18);
    makeLayer(list);list.forEach(s=>place(s,R[s.i],1));
    sec.classList.remove('lp-lit');
    find.querySelectorAll('.hl.on').forEach(el=>el.classList.add('lifted'));
    await raf(LEAVE_MS,t=>{
      list.forEach(s=>place(s,R[s.i],1-clamp01((t-s.d)/(1-.18))));
      find.style.opacity=easeIO(clamp01((t-.55)/.45)).toFixed(3);
    });
    find.querySelectorAll('.hl.lifted').forEach(el=>el.classList.remove('lifted'));
    find.style.opacity=1;killLayer();reset();vis(sec,false);
    busy=false;
  }
  function reset(){killLayer();sec.classList.remove('lp-ready','lp-lit','lp-on');planes.forEach(p=>p&&p.classList.remove('hot'));}

  /* 마우스를 올린 자리가 더 밝게(손전등으로 비추듯) */
  sec.querySelectorAll('.lp-c').forEach(c=>{
    const p=planes[+c.dataset.light];if(!p)return;
    c.addEventListener('pointermove',e=>{
      const r=c.getBoundingClientRect();
      p.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
      p.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
      p.classList.add('hot');
    });
    c.addEventListener('pointerleave',()=>p.classList.remove('hot'));
  });

  return{enter,leave,reset,get busy(){return busy;}};
})();
window.Plane=Plane;
