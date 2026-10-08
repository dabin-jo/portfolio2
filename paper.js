/* ===== 03 REVEAL: 종이접기(면) =====
   화면 모서리 쪽에 종이 3장(.pf)이 놓여 있고, 각 종이는 바깥쪽 모서리(data-corner)가 살짝 접혀 있음(개 귀 접기).
   - 위 종이는 배경과 같은 색이고, 그 밑에 색 밑판(.pf-under: 색 + 글 .pf-back)이 깔려 있음. 바깥쪽 두 변은 밑판이 띠처럼 보임.
   - 종이를 누르면 모서리가 크게 접히며 접힌 자리 밑의 색 밑판과 글이 드러나고(접힌 날개 = 배경보다 어두운 뒷면), 한 번 더 누르면 다시 살짝 접힌 상태로.
   - 끌면(드래그) 접힌 모서리가 손을 따라오고, 놓으면 가까운 상태(살짝 / 크게)로 착 붙음.
   계산: 모서리 C를 점 P로 옮기면 접히는 선 = C와 P를 잇는 선분의 수직이등분선.
         종이 중 C 쪽 부분(날개)을 그 선에 대해 뒤집어(반사) 그리고, 나머지는 앞면 그대로 둠.
         밑판 글은 모서리 C 쪽에 붙어 있고, 크게 접힌 상태(data-open)에서 드러나는 삼각형 안에 들어가도록 자동으로 줄어듦.
   script.js의 Scenes가 장면에 들어올 때 Paper.enter(), 나가기 전에 Paper.reset()을 부름. */
const Paper=(()=>{
  const sec=document.getElementById('end');
  if(!sec)return{enter(){},reset(){}};
  const hint=document.getElementById('pfHint');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS='http://www.w3.org/2000/svg';
  /* 살짝 접힌 정도 / 마우스를 올렸을 때 / (data-open이 크게 접힌 상태) — 종이 짧은 변 길이에 대한 비율(C에서 P까지 거리) */
  const REST=.16,HOVER=.26;
  let uid=0,interacted=false,hintT=0;

  /* ---- 2D 계산 도우미: 아핀 행렬 [a,b,c,d,e,f] = CSS matrix() 순서 (x'=a x + c y + e, y'=b x + d y + f) ---- */
  const dot=(a,b)=>a.x*b.x+a.y*b.y;
  const apply=(A,p)=>({x:A[0]*p.x+A[2]*p.y+A[4],y:A[1]*p.x+A[3]*p.y+A[5]});
  /* 접히는 선: C→P의 수직이등분선. M=중점, n=C에서 P 방향 단위벡터 */
  function foldOf(C,P){
    const dx=P.x-C.x,dy=P.y-C.y,L=Math.hypot(dx,dy);
    if(L<.5)return null;
    return{M:{x:(C.x+P.x)/2,y:(C.y+P.y)/2},n:{x:dx/L,y:dy/L},L};
  }
  /* 그 선에 대한 반사 행렬 */
  function reflect(f){
    const{n,M}=f,k=2*dot(M,n);
    return[1-2*n.x*n.x,-2*n.x*n.y,-2*n.x*n.y,1-2*n.y*n.y,k*n.x,k*n.y];
  }
  /* 다각형을 반평면으로 자름(Sutherland–Hodgman). keep=1 → (q-M)·n ≥ 0 쪽(앞면), keep=-1 → C 쪽(날개) */
  function clip(poly,f,keep){
    const out=[],s=q=>keep*dot({x:q.x-f.M.x,y:q.y-f.M.y},f.n);
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],sa=s(a),sb=s(b);
      if(sa>=0)out.push(a);
      if((sa>=0)!==(sb>=0)){const t=sa/(sa-sb);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,on:1});}
    }
    return out;
  }
  const pts=poly=>poly.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');

  /* ---- 종이 한 장 ---- */
  const sheets=[...sec.querySelectorAll('.pf')].map(el=>{
    const id='pf'+(uid++),corner=el.dataset.corner||'tl';
    const open=(el.dataset.open||'.5,.5').split(',').map(Number);
    const back=el.querySelector('.pf-back');
    // 밑판: 색 종이 + 글. 위의 종이(배경색)가 덮고 있다가, 모서리를 접으면 접힌 자리에서 드러남
    const under=document.createElement('div');under.className='pf-under';
    under.appendChild(back);el.prepend(under);
    back.classList.add('at-'+corner);
    // 위 종이(SVG): 앞면은 배경과 같은 색이라 거의 안 보이고, 접힌 날개(뒷면)는 배경보다 어둡게 + 그림자
    const svg=document.createElementNS(SVGNS,'svg');svg.setAttribute('class','pf-svg');svg.setAttribute('aria-hidden','true');
    svg.innerHTML=`<defs>
        <linearGradient id="${id}g" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient>
        <filter id="${id}s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#000" flood-opacity=".4"/></filter>
      </defs>
      <polygon class="pf-face"/><polygon class="pf-flap" filter="url(#${id}s)"/><polygon class="pf-crease" fill="url(#${id}g)"/>`;
    el.appendChild(svg);
    el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-expanded','false');
    const q=s=>svg.querySelector(s);
    return{el,corner,open,back,svg,grad:q(`#${id}g`),face:q('.pf-face'),flap:q('.pf-flap'),crease:q('.pf-crease'),
      w:1,h:1,rect:[],C:{x:0,y:0},p:{x:0,y:0},v:{x:0,y:0},target:{x:0,y:0},state:'flat',hover:false,drag:null};
  });

  /* 크기 다시 재기: 밑판(=.pf 상자 전체)과 위 종이(바깥쪽 두 변만 색 띠 두께만큼 안으로 들인 사각형), 접히는 모서리 C,
     그리고 크게 접혔을 때 드러나는 삼각형 안에 밑판 글이 들어가도록 글 크기 배율을 계산. 지금 P는 비율로 유지 */
  function measure(S){
    const ow=S.w,oh=S.h,rel={x:S.p.x/ow,y:S.p.y/oh},rt={x:S.target.x/ow,y:S.target.y/oh};
    S.w=S.el.offsetWidth||1;S.h=S.el.offsetHeight||1;
    const{w,h}=S,R=S.corner[1]==='r',B=S.corner[0]==='b';
    const T=Math.max(10,Math.min(18,innerWidth*.009)); // 색 띠 두께
    const x0=R?0:T,x1=R?w-T:w,y0=B?0:T,y1=B?h-T:h;
    S.rect=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
    S.C={x:R?x1:x0,y:B?y1:y0};
    S.p={x:rel.x*w,y:rel.y*h};S.target={x:rt.x*w,y:rt.y*h};
    S.svg.setAttribute('width',w);S.svg.setAttribute('height',h);S.svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    S.back.style.setProperty('--pad',(T+Math.min(w,h)*.04)+'px');
    // 크게 접혔을 때 드러나는 직각삼각형(직각 = C): 두 변 길이 a(가로) b(세로) 안에 글 상자가 들어가도록 줄임
    const P0={x:S.open[0]*w,y:S.open[1]*h},f=foldOf(S.C,P0);
    S.back.style.scale='1';
    if(f){
      const ux=R?-1:1,uy=B?-1:1;
      const a=Math.abs(dot({x:f.M.x-S.C.x,y:f.M.y-S.C.y},f.n)/(f.n.x*ux||1e-6)),b=Math.abs(dot({x:f.M.x-S.C.x,y:f.M.y-S.C.y},f.n)/(f.n.y*uy||1e-6));
      const pad=T+Math.min(w,h)*.04,wb=S.back.offsetWidth,hb=S.back.offsetHeight;
      const sc=Math.max(.45,Math.min(1,(1-pad*(1/a+1/b)*1.15)/(wb/a+hb/b)));
      S.back.style.scale=sc.toFixed(3);
    }
  }
  const dist=(S,k)=>Math.min(S.w,S.h)*k;
  /* 상태별 목표 P: 모서리에서 종이 가운데 방향으로 */
  function goal(S){
    if(S.state==='flat')return{...S.C};
    if(S.state==='open')return{x:S.open[0]*S.w,y:S.open[1]*S.h};
    const cx=S.w/2-S.C.x,cy=S.h/2-S.C.y,L=Math.hypot(cx,cy)||1,d=dist(S,S.hover?HOVER:REST);
    return{x:S.C.x+cx/L*d,y:S.C.y+cy/L*d};
  }
  function setState(S,st){S.state=st;S.target=goal(S);S.el.setAttribute('aria-expanded',st==='open'?'true':'false');S.el.classList.toggle('is-open',st==='open');kick();}

  /* 그리기: 지금 P로 위 종이 앞면(남은 부분)과 날개(뒤집힌 뒷면)를 갱신. 날개가 있던 자리는 비어서 밑판 색이 보임 */
  function render(S){
    const{C,p}=S,f=foldOf(C,p);
    if(!f){S.face.setAttribute('points',pts(S.rect));S.flap.setAttribute('points','');S.crease.setAttribute('points','');return;}
    const R=reflect(f);
    S.face.setAttribute('points',pts(clip(S.rect,f,1)));
    const flap=pts(clip(S.rect,f,-1).map(q=>apply(R,q))); // C 쪽 부분을 접힌 선에 대해 뒤집은 자리
    S.flap.setAttribute('points',flap);S.crease.setAttribute('points',flap);
    const g=S.grad;g.setAttribute('x1',f.M.x);g.setAttribute('y1',f.M.y);g.setAttribute('x2',p.x);g.setAttribute('y2',p.y); // 접힌 선 쪽은 그늘
  }

  /* 애니메이션: 살짝 튕기는 스프링으로 목표 P를 따라감 */
  let raf=0;
  function kick(){if(!raf)raf=requestAnimationFrame(tick);}
  function tick(){
    raf=0;let moving=false;
    sheets.forEach(S=>{
      if(reduce&&!S.drag){S.p={...S.target};S.v={x:0,y:0};render(S);return;}
      const k=S.drag?.35:.11,damp=S.drag?.5:.74;
      S.v.x=(S.v.x+(S.target.x-S.p.x)*k)*damp;S.v.y=(S.v.y+(S.target.y-S.p.y)*k)*damp;
      S.p.x+=S.v.x;S.p.y+=S.v.y;
      if(Math.abs(S.target.x-S.p.x)+Math.abs(S.target.y-S.p.y)+Math.abs(S.v.x)+Math.abs(S.v.y)>.15)moving=true;
      else{S.p={...S.target};S.v={x:0,y:0};}
      render(S);
    });
    if(moving)raf=requestAnimationFrame(tick);
  }

  /* 조작: 누르기(토글) · 끌기 · 마우스 올리기 · 키보드 */
  let zTop=5;
  sheets.forEach(S=>{
    const el=S.el;
    const local=e=>{const r=el.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
    el.addEventListener('pointerenter',()=>{S.hover=true;if(S.state==='rest')setState(S,'rest');});
    el.addEventListener('pointerleave',()=>{S.hover=false;if(S.state==='rest')setState(S,'rest');});
    el.addEventListener('pointerdown',e=>{
      if(S.state==='flat'||e.button>0)return;
      S.drag={start:local(e),p0:{...S.p},moved:false,link:e.target.closest('a')};
      el.style.zIndex=++zTop;el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove',e=>{
      const d=S.drag;if(!d)return;
      const m=local(e),dx=m.x-d.start.x,dy=m.y-d.start.y;
      if(!d.moved&&Math.hypot(dx,dy)<5)return;
      d.moved=true;markInteracted();
      // 손을 따라가되, 종이 안쪽(모서리에서 너무 멀리 가지 않게)으로만
      const M=Math.min(S.w,S.h)*.04;
      S.target={x:Math.max(M,Math.min(S.w-M,d.p0.x+dx)),y:Math.max(M,Math.min(S.h-M,d.p0.y+dy))};
      kick();
    });
    const end=e=>{
      const d=S.drag;if(!d)return;S.drag=null;
      if(!d.moved){
        if(d.link&&S.state==='open')return; // 펼쳐진 상태에서 메일 주소를 누르면 링크로
        markInteracted();setState(S,S.state==='open'?'rest':'open');return;
      }
      // 놓은 자리: 살짝 접힘 / 크게 접힘 중 가까운 쪽으로
      const dC=Math.hypot(S.p.x-S.C.x,S.p.y-S.C.y),dOpen=Math.hypot(S.open[0]*S.w-S.C.x,S.open[1]*S.h-S.C.y),dRest=dist(S,REST);
      setState(S,dC>(dOpen+dRest)/2?'open':'rest');
    };
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
    el.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&S.state!=='open')e.preventDefault();}); // 닫혀 있을 땐 링크 대신 펼치기
    el.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;if(e.target.closest('a'))return;
      e.preventDefault();e.stopPropagation();markInteracted();setState(S,S.state==='open'?'rest':'open');
    });
  });
  function markInteracted(){if(interacted)return;interacted=true;clearTimeout(hintT);hint&&hint.classList.remove('show');}

  /* 장면에 들어올 때: 평평한 종이가 차례로 놓이고 모서리가 살짝 접힘 → 잠시 뒤 아무것도 안 하면 한 장이 살짝 들썩이며 안내 */
  const timers=[];
  function enter(){
    reset();sec.classList.add('pf-on');
    sheets.forEach((S,i)=>timers.push(setTimeout(()=>{S.el.classList.add('in');setState(S,'rest');},380+i*200)));
    hintT=setTimeout(()=>{
      if(interacted)return;hint&&hint.classList.add('show');
      const S=sheets[0];if(!S||S.state!=='rest')return;
      S.hover=true;setState(S,'rest');timers.push(setTimeout(()=>{S.hover=false;if(S.state==='rest')setState(S,'rest');},700));
    },2400);
  }
  function reset(){
    timers.forEach(clearTimeout);timers.length=0;clearTimeout(hintT);
    sec.classList.remove('pf-on');hint&&hint.classList.remove('show');
    sheets.forEach(S=>{S.el.classList.remove('in','is-open');S.state='flat';S.hover=false;S.drag=null;measure(S);S.p={...S.C};S.target={...S.C};S.v={x:0,y:0};render(S);});
  }
  addEventListener('resize',()=>{sheets.forEach(S=>{measure(S);render(S);});});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>sheets.forEach(S=>{measure(S);render(S);})); // 글꼴이 늦게 오면 글 크기가 바뀌므로 다시 잼
  reset();
  return{enter,reset};
})();
window.Paper=Paper;
