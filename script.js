/* 새로고침 시 브라우저가 "마지막으로 스크롤했던 위치"(예: 십자말풀이 섹션)를 기억했다가 페이지 로드 후 되돌리는
   기본 동작(scroll restoration) 때문에, 로딩이 끝나고 우리가 scrollTo(0,0)으로 맨 위로 보정하는 순간
   html{scroll-behavior:smooth} 때문에 그 되돌아온 지점에서 위로 스르륵 스크롤되는 게 화면에 그대로 보였던 것.
   브라우저가 아예 위치를 기억/복원하지 않도록 끔 */
if('scrollRestoration' in history)history.scrollRestoration='manual';
/* 02 FIND(형광펜) 장면은 find.js, 03 REVEAL(종이접기) 장면은 paper.js가 담당. 여기서는 window.Find·window.Paper로 연결만 함 */
/* ===== 스포트라이트: 가운데서 하나 켜지면 드래그해서 제자리에 놓기 → 고정되며 회색으로 → 다음 것 등장 → 셋 다 놓이면 전부 컬러로,
   그 뒤 스크롤하면 셋이 한 리본으로 모여 S자 곡선을 그리며 십자말풀이 그리드 쪽으로 흡수되는 전환까지 이어짐.
   성능: devicePixelRatio는 항상 1로 고정하고 캔버스 실제 해상도도 화면의 1/4로만 그려 CSS로 확대함(어차피
   전부 흐릿한 빛이라 확대해도 티가 안 남). 스크롤 중 매 프레임 blur 필터 값을 바꾸는 대신, 오래 지속되는
   구간(정지 상태·낙하 리본)은 blur 필터를 아예 안 쓰고 그라데이션 자체의 부드러운 감쇠로만 흐릿함을 표현함 ===== */
(()=>{
  const hero=document.getElementById('hero'),heroWrap=document.getElementById('heroWrap'),cv=document.getElementById('hc'),ctx=cv.getContext('2d');
  const bgLayer=document.getElementById('bgLayer');
  cv.style.willChange='transform,opacity';
  // 퍼즐이 끝난 뒤(=body 잠금 해제 후) 스크롤하면 0→1로 진행되는 값. GSAP ScrollTrigger의 onUpdate(아래)가
  // 매 스크롤마다 갱신하고, draw()는 이 값만 읽어서 리본/배경색/텍스트 페이드를 전부 그려냄
  let transProgress=0;
  let looping=false,idleFrames=0; // ScrollTrigger의 onUpdate가 초기화 중 동기적으로 한 번 호출될 수 있어, 이 값들은 미리 선언해둠
  const smoothstep=t=>t*t*(3-2*t); // 배경색이 휙 바뀌지 않고 서서히 바뀌도록
  // 모션을 줄여야 하거나(prefers-reduced-motion) GSAP 로딩이 실패했으면 리본 연출 전체를 건너뛰고
  // 단순 크로스페이드로 대체함(아래 spawnNext 완료 지점과 이 IIFE 끝의 분기에서 사용)
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches; // 장면 전환은 script.js 맨 아래 Scenes가 시간 기반으로 재생(스크롤·GSAP 안 씀)
  const texts=[document.getElementById('tb0'),document.getElementById('tb1'),document.getElementById('tb2')];
  const hh=document.getElementById('hh');
  hh.textContent='';
  // dir: 이 빛의 빔이 뻗어나가는 방향(도, 0=오른쪽 90=아래 180=왼쪽 270=위, 화면 기준). 퍼즐 단계(드래그해서
  // 자리 찾기)에서만 쓰이고, lane은 리본 단계에서 이 색이 왼쪽/가운데/오른쪽 중 어느 줄무늬가 될지를 정함
  const BLOBS=[
    // c = [아래쪽 중심 색, 위쪽 가장자리 색(80%), 안쪽 그림자(곱하기) 색] — 피그마 225:3222(한층 연하게 바꾼 스포트라이트) 값 그대로
    {c:['#EFFFB0','#83FF9E','#37B4BB'],shape:'star',hiMag:.1,dir:55, side:1,rr:764/2398*1.05*1.18*1.2,lane:0},  // 녹색(가운데)
    {c:['#FFA5AF','#FFF6C3','#FF85B0'],shape:'hex',hiMag:.1,dir:125,side:-1,rr:764/2398*1.05*1.18*1.2*.82,lane:-1}, // 핑크/살구(왼쪽)
    {c:['#4B84E1','#D9F1EB','#2D77ED'],shape:'clover',hiMag:.12,dir:270,side:1,rr:764/2398*1.05*1.18*1.2*.66,lane:1},  // 하늘색(오른쪽) — 순서: 핑크, 초록, 파랑
  ];
  function hex2rgb(hex){const n=parseInt(hex.replace('#',''),16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function rgbStr({r,g,b}){return`rgb(${r},${g},${b})`;}
  function toGray(hex){ // 채도를 뺀, 살짝 차가운 무채색 잔상
    const{r,g,b}=hex2rgb(hex),l=r*.299+g*.587+b*.114;
    return rgbStr({r:Math.round(l*.94),g:Math.round(l*.96),b:Math.round(Math.min(255,l*1.04))});
  }
  function anyToRgb(c){ // '#hex' 또는 'rgb(r,g,b)' 둘 다 받는다
    if(c[0]==='#')return hex2rgb(c);
    const m=c.match(/\d+/g).map(Number);return{r:m[0],g:m[1],b:m[2]};
  }
  function mix(colA,colB,t){
    const a=anyToRgb(colA),b=anyToRgb(colB);
    return rgbStr({r:Math.round(a.r+(b.r-a.r)*t),g:Math.round(a.g+(b.g-a.g)*t),b:Math.round(a.b+(b.b-a.b)*t)});
  }
  BLOBS.forEach(b=>{b.gray=b.c.map(toGray);b.phase='pending';b.x=0;b.y=0;});

  /* 제자리 힌트: 빛이 들어가야 할 자리(글자 한가운데)에 그 빛 색의 얇은 점선 원을 은은하게 표시.
     빛이 가까워질수록(--near 0→1) 점선이 또렷해지고, 자리를 잡으면 사라짐 */
  const hints=BLOBS.map(b=>{
    const d=document.createElement('div');
    d.className='home-hint';d.style.setProperty('--hc',b.c[1]);
    hero.insertBefore(d,cv);
    return d;
  });
  let w=0,h=0;
  let HOMES=[{x:0,y:0},{x:0,y:0},{x:0,y:0}],SNAPR=[0,0,0],heroOff={x:0,y:0};
  const clampX=(x,m=0)=>Math.max(m,Math.min(w-m,x)),clampY=(y,m=0)=>Math.max(m,Math.min(h-m,y));
  /* 피그마 2024:40 값: 도형 가운데(homes)·크기 반지름(r: softSprite 기준 — 별 893px/0.9, 육각형 825.6px/0.88, 네잎 577px/0.82의 절반) */
  const DESIGN={W:1920,H:1080,homes:[{x:555.5,y:447},{x:1407.17,y:464.33},{x:960.5,y:753}],r:[893/2/.9,825.6/2/.88,577/2/.82*.9]}; // 네잎은 4개 원 합집합이 피그마 Union보다 커 보여서 화면 비교로 0.9배
  function size(){
    w=hero.clientWidth;h=hero.clientHeight;
    cv.width=w;cv.height=h; // devicePixelRatio 고정 1, 원래 해상도 그대로(저해상도 확대 안 함)
    const hr=hero.getBoundingClientRect();
    /* 피그마 2024:40(1920×1080) 배치를 그대로: 판 전체를 화면에 맞게 줄이고/늘려(가운데 정렬) 빛 자리·크기·글자 위치를 넣음.
       빛 크기 r은 피그마 도형 크기에서 계산(softSprite가 그리는 실제 크기 = 피그마 도형 크기) */
    const DS=Math.min(w/DESIGN.W,h/DESIGN.H),DX=(w-DESIGN.W*DS)/2,DY=(h-DESIGN.H*DS)/2;
    const scH=Math.max(w,h)*.62;
    BLOBS.forEach((b,i)=>{b.rr=DESIGN.r[i]*DS/scH;});
    HOMES=DESIGN.homes.map(p=>({x:DX+p.x*DS,y:DY+p.y*DS}));
    texts.forEach(el=>{
      const x=+el.dataset.x,y=+el.dataset.y;
      el.style.left=(DX+x*DS)+'px';el.style.top=(DY+y*DS)+'px';
      el.style.transform=`scale(${DS})`+(el.dataset.center?' translateX(-50%)':'');
    });
    heroOff={x:0,y:0};hero.style.setProperty('--hx','0px');hero.style.setProperty('--hy','0px');
    hero.style.setProperty('--ds',DS.toFixed(4)); // 글자 최소 10px 보정용(CSS .tb.hd font-size)
    SNAPR=texts.map(el=>{
      const tr=el.getBoundingClientRect();
      return Math.min(100,Math.max(40,Math.hypot(tr.width,tr.height)/2*.85));
    });
    texts.forEach((el,i)=>{ // 힌트 원: 글자 박스 중심 = 눈에 보이는 빛의 중심, 크기는 눈에 보이는 빛 지름과 비슷하게
      const tr=el.getBoundingClientRect(),R=BLOBS[i].rr*scH*.74,d=hints[i];
      d.style.width=d.style.height=(R*2)+'px';
      d.style.left=((tr.left+tr.right)/2-hr.left-R)+'px';d.style.top=((tr.top+tr.bottom)/2-hr.top-R)+'px';
    });
  }
  size();
  // size()가 캔버스 크기를 다시 정하면 캔버스 내용이 지워지므로, 곧바로 다시 그리도록 루프를 깨움
  new ResizeObserver(()=>{size();if(typeof startLoop==='function')startLoop();}).observe(hero);

  // 순서대로 하나씩: 가운데 등장 → 드래그해서 제자리로 → 고정+회색 → 다음 등장 → 셋 다 놓이면 전부 컬러로
  const ORDER=[2,0,1]; // 파랑(2) → 녹색(0) → 핑크(1) 순서로 등장
  let seqIdx=-1,cur=-1,allColorAt=0;
  function spawnNext(){
    seqIdx++;
    if(seqIdx>=ORDER.length){ // 셋 다 자리 잡음: 잠시 후 전부 컬러로 되돌리고 스크롤 해제
      cur=-1;
      setTimeout(()=>{
        allColorAt=performance.now();
        BLOBS.forEach(b=>b.phase='revealed');
        startLoop();
        document.body.classList.remove('lock');
        window.__heroDone=true;
        hh.classList.add('gone'); // 끝나면 가운데 안내는 사라지고, 아래 가운데 스크롤 표시(.sctl)가 대신 알려줌
        window.Scenes&&Scenes.refresh();
      },500);
      return;
    }
    cur=ORDER[seqIdx];
    const b=BLOBS[cur];
    size(); // 등장 직전에 크기를 다시 재서, 화면 중앙 좌표가 항상 최신 값이 되도록
    b.phase='active';b.onAt=performance.now();
    b.x=b.tx=w*.5;b.y=b.ty=h*.5; // 화면 정중앙에서 켜짐
    // 빛줄기 끝(anchor)은 등장한 자리를 기준으로 한 번만 계산해서 화면 밖으로 멀리 고정 — 이후 원이 움직여도 이 점은 그대로, 원 쪽만 방향을 틀며 따라감
    const rad=b.dir*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad);
    const len=Math.hypot(w,h)*1.15; // 화면 대각선보다 길게 뻗어서 끝이 반드시 화면 밖으로 나가도록
    b.anchor={x:b.x+ux*len,y:b.y+uy*len};
    // 화면 대각선(diag) 전체를 "움직일 수 있는 최대 거리"로 잡았던 게 틀렸음 — 중앙(b.x,b.y)에서 실제로 화면 경계에 닿을 때까지
    // anchor 방향(ux,uy)으로 이동 가능한 거리는 그보다 훨씬 짧음(가로/세로 각각 중앙~가장자리 절반 거리 중 먼저 닿는 쪽).
    // 레이-박스(ray-box) 교차로 정확한 최대 이동거리(maxReach)를 구해야 마우스를 화면 끝까지 움직였을 때 비율이 실제로 0 근처까지 내려감
    const txB=ux>0?(w-b.x)/ux:(ux<0?(0-b.x)/ux:Infinity);
    const tyB=uy>0?(h-b.y)/uy:(uy<0?(0-b.y)/uy:Infinity);
    const maxReach=Math.min(txB,tyB);
    b.anchorDist0=len;b.anchorMinD=len-maxReach;
    hh.textContent=`빛을 움직여 같은 모양의 선 안에 맞춰주세요 · ${seqIdx+1}/${ORDER.length}`;
    const hint=hints[cur];hint.style.setProperty('--near',0);
    setTimeout(()=>{if(b.phase==='active')hint.classList.add('show');},3000); // 3초쯤 헤매면 그때 힌트가 아주 은은하게 나타남(직접 풀고 싶은 사람을 위해 처음엔 숨김)
    startLoop(); // 쉬고 있던 렌더 루프를 깨움 — 안 그러면 마우스를 움직이기 전까지 새 빛이 안 그려짐
  }
  window.__lightSeqStart=()=>{if(seqIdx<0)setTimeout(spawnNext,900);};

  /* 히어로 → 02 FIND(형광펜) 전환. 스크롤 없이 Scenes(맨 아래)가 pA·pB를 시간에 따라 0→1로 재생:
     ① pA: 글자가 사라지고 배경이 FIND 배경색(#212124)으로 바뀌는 동안 빛 3개가 모양 그대로 작아지며 가라앉음
     ② pB: FIND 글 화면이 서서히 나타나고, 빛이 반짝이는 점이 되어 빛 꼬리를 그리며 각자 맡은 형광펜(Find.rect(i))으로 날아가
        그대로 형광펜을 쓸며 칠함(Find.paint) → 다 오면 나머지 형광펜이 차례로 칠해짐(Find.play). 이전 버튼으로 돌아가면 역재생 */
  const findSec=document.getElementById('find');
  const dive=createDive();
  const clamp01=v=>Math.max(0,Math.min(1,v));
  let pA=0,pB=0,findPlayed=false;
  function update(){
    transProgress=pA+pB; // 0보다 크면 히어로 캔버스는 빛을 안 그림(전환 캔버스가 같은 모양으로 이어받음)
    const op=Math.max(0,1-pA/.35);             // 히어로 글자 fade-out
    texts.forEach(t=>t.style.opacity=op);hh.style.opacity=op;
    const bp=smoothstep(clamp01((pA-.08)/.92)); // 배경 #080809 → #212124(은은한 어두움)
    const rC=Math.round(8+(33-8)*bp),bC=Math.round(9+(36-9)*bp);
    bgLayer.style.background=`rgb(${rC},${rC},${bC})`;
    document.body.style.background=bgLayer.style.background;
    findSec.style.opacity=smoothstep(clamp01(pB/.55)).toFixed(3); // FIND 화면은 제자리에서 서서히 나타남
    dive.render(pA,pB);
    if(pB>=.995&&!findPlayed){findPlayed=true;window.Find&&Find.play();} // 빛이 맡은 형광펜을 다 칠하면 나머지도 차례로
    else if(pB<.5&&findPlayed){findPlayed=false;window.Find&&Find.reset();} // 히어로로 돌아가면 지워 두고, 다시 오면 또 칠함
    startLoop();
  }
  window.__heroCw={set(a,b){pA=a;pB=b;update();},get:()=>[pA,pB]};
  addEventListener('resize',()=>dive.render(pA,pB));
  // 상세 페이지에서 돌아왔을 때 등: 빛 퍼즐을 이미 끝낸 상태로 바로 맞춰 둠
  window.__heroComplete=()=>{
    size();
    BLOBS.forEach((b,i)=>{b.phase='revealed';b.x=b.tx=HOMES[i].x;b.y=b.ty=HOMES[i].y;b.muteAt=performance.now()-5000;});
    texts.forEach((t,i)=>{t.classList.add('hit');freeText(i);});hints.forEach(h=>h.classList.add('done'));
    seqIdx=ORDER.length;cur=-1;allColorAt=performance.now()-5000;
    window.__heroDone=true;hh.classList.add('gone'); // 끝나면 가운데 안내는 사라지고, 아래 가운데 스크롤 표시(.sctl)가 대신 알려줌
    document.body.classList.remove('lock');startLoop();
  };
  /* 전환용 빛 캔버스(화면 고정): 히어로 빛 → 반짝이는 점 → 빛 줄기(선) → 형광펜.
     ① 줄어듦: 모양 그대로(히어로와 같은 스프라이트) 작아져 작은 빛 덩어리가 됨(히어로 빛의 부드러운 번짐 그대로)
     ② 갈라짐·날아감: 그 작은 빛이 맡은 형광펜 수만큼 갈라져, 각자 천천히 돌며 휘어진 길을 따라 형광펜 자리로 날아가며, 뒤로 형광펜과 같은 색·굵기의 빛 꼬리(형광펜 줄기)를 남김
     ③ 칠하기: 형광펜 왼쪽 끝에 닿으면 그대로 오른쪽으로 쓸고 지나가며 형광펜을 칠함(Find.paint) → 빛은 잦아들고 꼬리가 거둬짐
     전부 진행도(pA·pB) 기준이라 이전 버튼으로 돌아가면 그대로 역재생됨. 마지막 잦아듦만 시간 기준 */
  function createDive(){
    const cvD=document.createElement('canvas');cvD.className='dive-cv';cvD.setAttribute('aria-hidden','true');
    document.body.appendChild(cvD);
    const dctx=cvD.getContext('2d');
    const off=document.createElement('canvas'),ox=off.getContext('2d',{willReadFrequently:true});
    const LS=.5,SPR=320,PAD=1.3;
    let sprites=null,shown=false,pendingHide=false;
    function build(){ // 히어로 drawOrb()과 같은 하이라이트 방향으로 모양 하나씩 스프라이트로 구워둠
      sprites=BLOBS.map((b,i)=>{
        const c=document.createElement('canvas');c.width=c.height=SPR;const x=c.getContext('2d');
        x.fillStyle='#000';x.fillRect(0,0,SPR,SPR);
        let hx=0,hy=0;
        if(b.anchor){const home=HOMES[i],dx=b.anchor.x-home.x,dy=b.anchor.y-home.y,d=Math.hypot(dx,dy)||1;hx=dx/d*b.hiMag;hy=dy/d*b.hiMag;}
        x.globalCompositeOperation='lighten';
        paintShape(x,b.shape,SPR/2,SPR/2,SPR/2/PAD,b.c,hx,hy);
        return c;
      });
    }
    /* 빛 줄기 색(초록 별 · 핑크 육각형 · 파랑 네잎). 가운데 심은 하얗게 */
    const GLOW=[[182,255,138],[255,150,190],[110,176,255]];
    let lastT=performance.now();
    const INK=[[228,255,140],[255,157,180],[75,132,225]]; // 형광펜 색(find.js HL과 같게: 국순당 lime · 소소복담 pink · 삼토 blue)
    const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;
    /* 타임라인(u: 전환 전체 0→1) — 빛마다 살짝 엇갈려 출발(STAG) */
    const SHRINK_END=.34,TRAVEL_START=.3,STAG=[0,.03,.06];
    const BEND=[1,-1,1]; // 휘는 방향(서로 엇갈리게)
    const c01=v=>Math.max(0,Math.min(1,v));
    const easeIO=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    /* 빛이 지나갈 길: 히어로 자리 H → (휘어진 곡선) → 형광펜 왼쪽 끝 S → (수평으로) 형광펜 오른쪽 끝 E.
       곡선은 S에서 오른쪽을 향해 들어오도록 만들어서, 그대로 이어서 형광펜을 쓸 수 있게 함 */
    /* 빛 i가 지나갈 길: 히어로 자리 H → 첫 형광펜 왼쪽 끝으로 날아가 오른쪽 끝까지 쓸고 → 다음 형광펜으로 휘돌아 가서 또 쓸고 …
       (Find.route(i) = 그 빛이 칠할 형광펜들). 날아가는 구간은 부드러운 곡선(centripetal Catmull-Rom),
       형광펜에 들어갈 땐 항상 왼쪽에서 수평으로 들어오고, 되돌아와야 하면 넓게 돌아서 급하게 꺾이지 않게 함.
       marks[j] = j번째 형광펜을 쓰는 구간의 길 위 거리(ds 시작 · de 끝) */
    function crInto(pts,all,d,skipFirst){
      const tj=(a,b,t)=>t+Math.pow(Math.hypot(b.x-a.x,b.y-a.y)||1e-3,.5);
      let prev=pts.length?pts[pts.length-1]:null;
      for(let s=1;s<all.length-2;s++){
        const p0=all[s-1],p1=all[s],p2=all[s+1],p3=all[s+2];
        const t0=0,t1=tj(p0,p1,t0),t2=tj(p1,p2,t1),t3=tj(p2,p3,t2);
        const n=Math.max(12,Math.round(Math.hypot(p2.x-p1.x,p2.y-p1.y)/8));
        for(let j=(s===1&&!skipFirst?0:1);j<=n;j++){
          const t=t1+(t2-t1)*j/n,L=(pa,pb,ta,tb)=>({x:(tb-t)/(tb-ta)*pa.x+(t-ta)/(tb-ta)*pb.x,y:(tb-t)/(tb-ta)*pa.y+(t-ta)/(tb-ta)*pb.y});
          const A1=L(p0,p1,t0,t1),A2=L(p1,p2,t1,t2),A3=L(p2,p3,t2,t3),B1=L(A1,A2,t0,t2),B2=L(A2,A3,t1,t3),C=L(B1,B2,t1,t2);
          if(prev)d+=Math.hypot(C.x-prev.x,C.y-prev.y);pts.push(prev={x:C.x,y:C.y,d});
        }
      }
      return d;
    }
    function pathOf(i,j){
      const H=HOMES[i],route=(window.Find&&Find.route(i))||[];
      const r=route[j]||{x0:innerWidth*.3,x1:innerWidth*.3+200,y:innerHeight*.4,h:40};
      const lh=r.h,Wv=innerWidth,ap=Math.max(lh*3,Wv*.07),rr=Math.max(lh*3,Wv*.07);
      const k=BEND[i]*(j%2?-1:1); // 갈라진 빛들이 서로 반대쪽으로 휘어 나가게
      const S={x:r.x0,y:r.y},E={x:r.x1,y:r.y};
      const vx=S.x-H.x,vy=S.y-H.y,len=Math.hypot(vx,vy)||1,px=-vy/len,py=vx/len;
      // 형광펜 앞 A: 빛이 오는 쪽(위/아래)에서 비스듬히 내려앉듯 들어오게 → 크게 돌아 나오는 고리 없이 짧은 호
      const dn=Math.sign(S.y-H.y)||1,A={x:S.x-ap*.7,y:S.y-dn*Math.min(ap*.5,Math.abs(vy)*.4)};
      const P0={x:H.x-px*k*len*.25,y:H.y-py*k*len*.25}; // 갈라질 때 살짝 옆으로 벌어지며 출발
      const way=[H,A,S];
      const pts=[];let d=crInto(pts,[P0,...way,{x:S.x+ap,y:S.y}],0,false);
      const ds=d;
      for(let q=1;q<=24;q++){const x=S.x+(E.x-S.x)*q/24;d+=(E.x-S.x)/24;pts.push({x,y:S.y,d});}
      return{pts,L:d,marks:[{ds,de:d}],lh,H};
    }
    function at(P,d){ // 길 위에서 거리 d인 점
      const a=P.pts;if(d<=0)return a[0];if(d>=P.L)return a[a.length-1];
      let lo=0,hi=a.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(a[m].d<d)lo=m;else hi=m;}
      const A=a[lo],B=a[hi],t=(d-A.d)/((B.d-A.d)||1);return{x:A.x+(B.x-A.x)*t,y:A.y+(B.y-A.y)*t};
    }
    /* 빛 꼬리 = 형광펜 줄기: 형광펜과 같은 색·같은 굵기(줄 높이의 82%)의 납작한 띠가 빛 점 뒤로 이어짐.
       머리 쪽은 진하고 꼬리 쪽으로 갈수록 옅어지고 조금 가늘어짐. 띠는 겹치지 않는 사각형 조각으로 채워서(둥근 끝 X)
       형광펜으로 그은 것처럼 보이게 하고, 위에 은은한 빛 번짐과 가는 하얀 심만 얹음 */
    /* 꼬리 띠를 하나의 도형으로 그림(조각으로 나눠 그리면 이음새 줄무늬가 생기고, 움직일 때 그 줄이 흘러서 깜빡여 보였음).
       굵기: 꼬리 끝 가늘게 → 머리 쪽 형광펜 굵기. 진하기: 꼬리 끝에서 앞쪽 40%까지 서서히 진해짐 */
    function ribbonPath(P,d0,d1,band,wk){
      const N=64,q=[];for(let j=0;j<=N;j++)q.push(at(P,d0+(d1-d0)*j/N));
      const L=[],R=[];
      q.forEach((p,j)=>{
        const a=q[Math.max(0,j-1)],b=q[Math.min(N,j+1)],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
        const w=band*wk*(.18+.82*Math.pow(j/N,.55))/2;
        L.push({x:p.x+nx*w,y:p.y+ny*w});R.push({x:p.x-nx*w,y:p.y-ny*w});
      });
      dctx.beginPath();dctx.moveTo(L[0].x,L[0].y);L.forEach(p=>dctx.lineTo(p.x,p.y));for(let j=R.length-1;j>=0;j--)dctx.lineTo(R[j].x,R[j].y);dctx.closePath();
      return{tail:q[0],mid:q[Math.round(N*.4)]};
    }
    function fadeFill(e,col,a){
      const g=dctx.createLinearGradient(e.tail.x,e.tail.y,e.mid.x,e.mid.y);
      g.addColorStop(0,rgba(col,0));g.addColorStop(1,rgba(col,a));return g;
    }
    function drawTrail(P,d0,d1,band,ink,glow,fade){
      if(d1-d0<1)return;
      // 바깥 빛 번짐(흐리게)
      dctx.globalCompositeOperation='lighter';dctx.filter='blur(6px)';
      let e=ribbonPath(P,d0,d1,band,2);dctx.fillStyle=fadeFill(e,glow,.12*fade);dctx.fill();
      dctx.filter='none';
      // 형광펜 띠: 날아가는 구간에만 그림. 형광펜 위(쓸고 지나가는 구간)는 실제 형광펜(DOM)이 칠해짐
      dctx.globalCompositeOperation='source-over';
      let s0=0;
      P.marks.forEach(m=>{ // 날아가는 구간 = 이전 형광펜 끝(s0) ~ 이번 형광펜 시작(m.ds)
        const a0=Math.max(d0,s0),a1=Math.min(d1,m.ds);
        if(a1-a0>1){const tailIn=a0===d0;const ee=ribbonPath(P,a0,a1,band,1);dctx.fillStyle=tailIn?fadeFill(ee,ink,.9*fade):rgba(ink,.9*fade);dctx.fill();}
        s0=m.de;
      });
      dctx.globalCompositeOperation='lighter';
    }
    let linger=0,lingerRaf=0,lastArgs=[0,0];
    function frameDraw(pA,pB,lk){ // lk: 끝난 뒤 잦아드는 정도(0→1, 끝나기 전엔 0)
      if(!sprites)build();
      const W=innerWidth,H=innerHeight,now=performance.now();lastT=now;
      if(cvD.width!==W||cvD.height!==H){cvD.width=W;cvD.height=H;off.width=Math.ceil(W*LS);off.height=Math.ceil(H*LS);}
      const sc=Math.max(w,h)*.62,U=Math.min(1,pA*.3+pB*.7),fade=1-lk;
      // 빛마다 진행 상태 계산: 빛 하나가 맡은 형광펜 수만큼 갈라져서(같은 자리에서 출발) 각자 하나씩 날아가 칠함
      const L=BLOBS.map((b,i)=>{
        const u=c01((U-STAG[i])/(1-STAG[2])),ks=easeIO(c01(u/SHRINK_END)); // 줄어드는 정도
        const n=Math.max(1,window.Find?Find.route(i).length:1);
        const kids=[];
        for(let j=0;j<n;j++){
          const p=pathOf(i,j),tv=c01((u-TRAVEL_START-j*.03)/(1-TRAVEL_START-.06)),d=p.L*easeIO(tv);
          kids.push({p,tv,d,pos:at(p,d),sw:c01((d-p.marks[0].ds)/((p.L-p.marks[0].ds)||1))});
        }
        return{b,u,ks,n,kids};
      });
      dctx.clearRect(0,0,W,H);
      // ② 빛 꼬리(형광펜 줄기) + 형광펜 칠하기 — 빛 머리 아래에 깔림
      L.forEach(({kids},i)=>kids.forEach(({p,tv,d},j)=>{
        const m=p.marks[0];window.Find&&Find.paintAt(i,j,c01((d-m.ds)/((m.de-m.ds)||1)));
        const TL=Math.min(m.ds*.5,innerWidth*.2)*(1-lk); // 꼬리 길이(짧게 — 여러 줄기가 겹쳐 어수선하지 않게. 끝나면 거둬짐)
        if(tv>0)drawTrail(p,Math.max(0,d-TL),d,p.lh*.82,INK[i],GLOW[i],fade);
      }));
      // ① 빛 머리: 히어로 빛과 같은 모양·색·번짐(같은 스프라이트)이 작아진 채로 꼬리 앞에서 날아감.
      //    갈라지기 전엔 겹쳐 있어 하나로 보이고, 날아가기 시작하면 갈라짐. 검정 바탕에 lighten → 밝기를 투명도로
      ox.setTransform(1,0,0,1,0,0);ox.globalCompositeOperation='source-over';ox.globalAlpha=1;
      ox.fillStyle='#000';ox.fillRect(0,0,off.width,off.height);
      ox.setTransform(LS,0,0,LS,0,0);ox.globalCompositeOperation='lighten';
      L.forEach(({b,ks,n,kids},i)=>kids.forEach(({p,tv,sw,d,pos},j)=>{
        const split=c01(tv*6); // 갈라지면서 조금 작아짐
        const D0=b.rr*sc*2,Dpt=p.lh*2.3*(1-.18*split*(n>1?1:0)),D=D0*Math.pow(Dpt/D0,ks)*(1-.25*sw)*(1-.5*lk);
        const lift=-H*.03*Math.sin(Math.PI*Math.min(1,ks*1.2))*(1-tv);
        const rot=ks*ks*.6*BEND[i]+d*.004*BEND[i]*(j%2?-1:1); // 날아가며 천천히 돎
        ox.globalAlpha=fade;const sz=D*PAD;
        ox.save();ox.translate(pos.x,pos.y+lift);ox.rotate(rot);ox.drawImage(sprites[i],-sz/2,-sz/2,sz,sz);ox.restore();
      }));
      ox.globalAlpha=1;
      const img=ox.getImageData(0,0,off.width,off.height),px=img.data;
      for(let q=0;q<px.length;q+=4){const m=Math.max(px[q],px[q+1],px[q+2]);if(!m){px[q+3]=0;continue;}const k=255/m;px[q]*=k;px[q+1]*=k;px[q+2]*=k;px[q+3]=m;}
      ox.putImageData(img,0,0);
      dctx.globalCompositeOperation='source-over';dctx.imageSmoothingQuality='high';
      dctx.filter=U>SHRINK_END*.6?'blur(2px)':'none'; // 작아진 빛도 히어로처럼 가장자리가 부드럽게
      dctx.drawImage(off,0,0,W,H);dctx.filter='none';
      // 빛 머리 둘레의 은은한 번짐(뾰족한 반짝임 없이 부드럽게)
      dctx.globalCompositeOperation='lighter';
      L.forEach(({ks,kids},i)=>kids.forEach(({p,pos})=>{
        const a=.22*c01(ks*1.4)*fade/Math.sqrt(kids.length*.8);if(a<.01)return;
        const R=p.lh*2.2,g=dctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,R);
        g.addColorStop(0,rgba(GLOW[i],a));g.addColorStop(1,rgba(GLOW[i],0));
        dctx.fillStyle=g;dctx.beginPath();dctx.arc(pos.x,pos.y,R,0,7);dctx.fill();
      }));
      dctx.globalCompositeOperation='source-over';
      if(!shown){cvD.style.transition='none';cvD.style.opacity=1;shown=true;}
    }
    const LINGER_MS=900;
    function lingerLoop(){
      const k=c01((performance.now()-linger)/LINGER_MS);
      frameDraw(lastArgs[0],lastArgs[1],k);
      if(k<1)lingerRaf=requestAnimationFrame(lingerLoop);
      else{lingerRaf=0;dctx.clearRect(0,0,cvD.width,cvD.height);cvD.style.opacity=0;shown=false;}
    }
    function render(pA,pB){
      lastArgs=[pA,pB];
      const vis=pA>.0005||pB>0;
      if(!vis){
        if(lingerRaf){cancelAnimationFrame(lingerRaf);lingerRaf=0;}linger=0;
        if(shown){
          /* 히어로로 되돌아온 끝(pA·pB 모두 0): 여기서 바로 숨기면 히어로 캔버스가 빛을 다시 그리기 전
             한두 프레임 동안 빛이 없는 빈 화면이 보여 '깜빡'임 → 히어로 캔버스가 실제로 한 번 그린 뒤(frame()에서 hideAfterHeroDraw 호출) 숨김 */
          pendingHide=true;
        }
        return;
      }
      pendingHide=false;
      if(pB>=.9995){ // 다 왔음: 빛이 잦아들고 꼬리가 거둬지는 마무리는 시간으로
        if(!linger){linger=performance.now();if(!lingerRaf)lingerRaf=requestAnimationFrame(lingerLoop);}
        return;
      }
      if(lingerRaf){cancelAnimationFrame(lingerRaf);lingerRaf=0;}linger=0;
      frameDraw(pA,pB,0);
    }
    // 전환 캔버스는 z-index가 높아 그 아래 히어로 글자를 가리고 있음 → 한 번에 걷으면 글자가 '툭' 튀어나와 깜빡이는 느낌.
    // 빛 모양은 두 캔버스가 거의 같으니 .45초 동안 서서히 걷어서 글자만 부드럽게 드러나게 함
    function hideAfterHeroDraw(){if(pendingHide){pendingHide=false;shown=false;cvD.style.transition='opacity .45s ease';cvD.style.opacity=0;}}
    return {render,hideAfterHeroDraw};
  }

  // 이제 드래그가 아니라 마우스를 따라 그대로 움직임
  addEventListener('pointermove',e=>{
    if(cur<0||BLOBS[cur].phase!=='active')return;
    const r=hero.getBoundingClientRect();
    BLOBS[cur].tx=clampX(e.clientX-r.left);BLOBS[cur].ty=clampY(e.clientY-r.top);
    startLoop();
  });

  // 형광등이 켜지듯: 완전히 꺼진 상태에서 몇 차례 깜빡이다 밝게 안정됨
  const FLICKER=[[0,0],[70,1],[130,.85],[190,1],[250,.9],[330,1]];
  const FLICKER_END=FLICKER[FLICKER.length-1][0];
  function flickerAlpha(age){
    if(age<0)return 0;
    if(age>=FLICKER_END)return 1;
    for(let i=FLICKER.length-1;i>=0;i--){if(age>=FLICKER[i][0])return FLICKER[i][1];}
    return 0;
  }
  const MUTE_MS=420; // 회색으로 가라앉는 트랜지션 시간
  const UNMUTE_MS=550; // 마지막에 다시 컬러로 돌아오는 트랜지션 시간
  const SETTLE_HOLD=350; // 제자리 근처에 왔을 때 바로 붙지 않고 잠시 멈칫하는 시간
  const SETTLE_MS=750; // 그 후 천천히 제자리로 미끄러져 들어가는 시간
  function easeOutCubic(t){return 1-Math.pow(1-t,3);}
  /* 렌더 루프: 화면 밖(heroWrap이 뷰포트에 아예 안 걸침)이면 requestAnimationFrame 자체를 멈추고,
     IntersectionObserver가 다시 보일 때 깨움. 화면 안이라도 스크롤이 멈춰 있고 퍼즐 인터랙션도 없고
     색이 바뀌는 애니메이션(mute/unmute)도 끝났으면 몇 프레임 뒤 루프를 쉬게 함 — 다음 스크롤/마우스
     이벤트(위의 startLoop 호출들)가 오면 즉시 다시 깨어남 */
  function isAnimating(){
    const now=performance.now();
    if(BLOBS.some(b=>b.phase==='active'||b.phase==='settling'))return true;
    if(BLOBS.some(b=>b.phase==='placed'&&now-b.muteAt<MUTE_MS))return true;
    if(BLOBS.some(b=>b.phase==='revealed'&&now-allColorAt<UNMUTE_MS))return true;
    return false;
  }
  function startLoop(){if(!looping){looping=true;idleFrames=0;requestAnimationFrame(frame);}}
  let prevProgressForIdle=-999; // GSAP의 scrub 스무딩(0.3s)은 스크롤이 멈춘 뒤에도 한동안 계속 onUpdate를 부르므로,
  // "onUpdate가 안 옴"이 아니라 "값이 실제로 더 안 바뀜"을 직접 비교해서 유휴 여부를 판단함
  function frame(){
    const rect=heroWrap.getBoundingClientRect();
    if(rect.bottom<0||rect.top>innerHeight){looping=false;return;} // 화면 밖: 루프 정지, IntersectionObserver가 깨움
    if(!w||!h)size();
    const fqNow=transProgress;
    try{draw();}catch(err){}
    if(fqNow<=0)try{dive.hideAfterHeroDraw();}catch(e){} // 히어로가 빛을 다 그린 다음에야 전환 캔버스를 걷어냄(깜빡임 방지)
    const idle=!isAnimating()&&Math.abs(fqNow-prevProgressForIdle)<.0005;
    prevProgressForIdle=fqNow;
    if(idle){idleFrames++;if(idleFrames>6){looping=false;return;}}else idleFrames=0;
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(es=>{if(es[0].isIntersecting)startLoop();},{rootMargin:'150px 0px'}).observe(heroWrap);
  startLoop();

  // 피그마 레퍼런스(node 75:365)를 전체 섹션 스크린샷으로 다시 확인: 원과 맞닿는 넓은 쪽은 투명하게 사라지고
  // (원 자체의 빛이 이어받음), anchor(먼 쪽)의 좁은 끝이 오히려 진하고 선명한 색으로 보이는 구조.
  // → 원 쪽은 지름만큼 넓고 알파 0(안 보임, 그래서 이음매 위치는 무관), anchor 쪽은 좁고 불투명.
  // (퍼즐 단계에서만 잠깐 쓰이는 연출이라 blur는 고정값 하나만 사용 — 매 프레임 값을 바꾸지 않음)
  function drawBeam(b,cx,cy,r,alpha){
    const anchor=b.anchor;if(!anchor)return;
    let dx=anchor.x-cx,dy=anchor.y-cy,d=Math.hypot(dx,dy)||1;
    const ux=dx/d,uy=dy/d,px=-uy*b.side,py=ux*b.side;
    // 피그마 원본(node 75:365) 실측: 원 쪽은 원 반지름의 .42배로 좁고, 멀어질수록 원 반지름의 1.06배로 넓어짐.
    // 길이는 화면 밖까지 무한히 뻗는 게 아니라 원 반지름의 3.6배 정도의 유한한 길이.
    // 색도 원본처럼 원과 맞닿는 쪽이 진하고 불투명, 끝으로 갈수록 옅어지며 알파 0으로 사라짐(빛줄기 자체 그라데이션만으로 자연스럽게 원과 연결됨)
    // 빛줄기 끝(끝의 좁은 tip)은 화면 안에서 잘린 채로 보이면 안 되고, 항상 화면 밖에 고정되어 있어야 함.
    // 화면이 작아지면 r*3.6로는 화면 경계까지도 못 미칠 수 있어서, 현재 위치(cx,cy)에서 anchor 방향으로
    // 실제 화면 경계까지 닿는 거리를 구해 그보다는 반드시 더 길게(경계를 넘어서게) 뻗도록 함
    const txB=ux>0?(w-cx)/ux:(ux<0?(0-cx)/ux:Infinity);
    const tyB=uy>0?(h-cy)/uy:(uy<0?(0-cy)/uy:Infinity);
    const edgeLen=Math.max(0,Math.min(txB,tyB));
    const len=Math.max(r*3.6,edgeLen*1.15),farX=cx+ux*len,farY=cy+uy*len;
    const nearHalf=r*0.96,farHalf=r*.42; // 원 쪽이 넓고 멀어질수록 좁아지도록(반대 방향으로 수정)
    ctx.save();
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=alpha;ctx.filter=`blur(${r*.05}px)`;
    const g=ctx.createLinearGradient(cx,cy,farX,farY);
    const near=hex2rgb(b.c[1]),far=hex2rgb(b.c[0]);
    g.addColorStop(0,`rgba(${near.r},${near.g},${near.b},0)`);
    g.addColorStop(1,`rgba(${far.r},${far.g},${far.b},.9)`);
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(cx+px*nearHalf,cy+py*nearHalf);
    ctx.lineTo(farX+px*farHalf,farY+py*farHalf);
    ctx.lineTo(farX-px*farHalf,farY-py*farHalf);
    ctx.lineTo(cx-px*nearHalf,cy-py*nearHalf);
    ctx.closePath();ctx.fill();
    ctx.restore();
  }
  // 퍼즐 단계(active/settling/placed) 전용 원 렌더링. blur는 항상 같은 계수(r*.03)만 써서 매 프레임 값이
  // 안 바뀜 — 예전엔 마우스-anchor 거리에 따라 블러를 실시간으로 바꿨지만 그만큼 매 프레임 filter를 다시
  // 만들어야 해서 성능 비용이었고, 스크롤 성능과는 무관한 부가 디테일이라 정리함
  // 네잎 모양 경로: 원 4개(반지름 R, 중심이 ±d)를 합친 모양. s = 중심에서 잎 끝까지 거리
  function cloverPath(c,cx,cy,s){
    const R=s/1.62,d=R*.62;c.beginPath();
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,k])=>{c.moveTo(cx+a*d+R,cy+k*d);c.arc(cx+a*d,cy+k*d,R,0,Math.PI*2);});
  }
  // 네 꼭짓점 별 경로(피그마 node 139:1541): 꼭짓점 4개를 안쪽으로 오목하게 휜 곡선으로 이음. s = 중심에서 꼭짓점까지 거리
  function starPath(c,cx,cy,s){
    const k=s*.33,P=[[0,-s],[s,0],[0,s],[-s,0]],C=[[k,-k],[k,k],[-k,k],[-k,-k]];
    c.beginPath();c.moveTo(cx+P[0][0],cy+P[0][1]);
    for(let i=0;i<4;i++){const n=P[(i+1)%4];c.quadraticCurveTo(cx+C[i][0],cy+C[i][1],cx+n[0],cy+n[1]);}
    c.closePath();
  }
  // 하트 경로: 피그마 node 139:1559의 벡터 경로 그대로(515×426). s = 중심에서 좌우 끝까지 거리
  const HEART_D='M 151.557 0 C 69.746 0 0 61.106 0 140.427 C 0 195.158 25.662 241.223 59.681 279.385 C 93.612 317.43 137.373 349.364 176.895 376.098 L 245.14 422.221 C 248.79 424.684 253.095 426 257.5 426 C 261.905 426 266.21 424.684 269.86 422.221 L 338.105 376.098 C 377.657 349.364 421.388 317.43 455.289 279.385 C 489.338 241.223 515 195.158 515 140.427 C 515 61.106 445.254 0 363.443 0 C 321.242 0 284.133 19.742 257.5 45.301 C 230.867 19.742 193.728 0 151.557 0 Z';
  const HEART=new Path2D(HEART_D);
  const HEX=[[0.1211, -0.9926], [0.9202, -0.3914], [0.7991, 0.6012], [-0.1211, 0.9926], [-0.9202, 0.3914], [-0.7991, -0.6012]]; // 육각형 꼭짓점(중심 기준, 외접원 반지름 1로 정규화)
  function heartPath2D(cx,cy,s){const k=s/257.5,p=new Path2D();p.addPath(HEART,new DOMMatrix().translate(cx-257.5*k,cy-213*k).scale(k));return p;}
  /* 모양 있는 빛 그리기 */
  /* 피그마 225:3222 방식 그대로: ① 도형 아래쪽 가운데(0.5, 0.886)를 중심으로 한 원형 그라데이션(중심 색 → 가장자리 색 80%)
     ② 안쪽 그림자(곱하기 · 도형마다 방향 다름)로 가장자리를 은은하게 물들이고 ③ 전체를 살짝 흐림.
     매 프레임 새로 그리면 무거워서, 모양·크기·색이 같으면 한 번 구운 그림(스프라이트)을 재사용 */
  const SOFT_SPEC={ // fig = 피그마 도형 크기(px), sh = 안쪽 그림자 [x, y, 흐림, 퍼짐], bl = 레이어 흐림
    star:{fig:893,sh:[5,74,139.1,-46],bl:54.1},hex:{fig:825.6,sh:[-54,58,139.1,-46],bl:54.1},clover:{fig:577,sh:[0,88,139.1,-46],bl:36.5}};
  const softCache=new Map();
  function shapePath(c,shape,cx,cy,s){
    if(shape==='clover')cloverPath(c,cx,cy,s);
    else if(shape==='star')starPath(c,cx,cy,s);
    else{c.beginPath();HEX.forEach(([x,y],k)=>k?c.lineTo(cx+x*s,cy+y*s):c.moveTo(cx+x*s,cy+y*s));c.closePath();}
  }
  function softSprite(shape,r,cols){
    const key=shape+'|'+Math.round(r)+'|'+cols.join(',');let sp=softCache.get(key);if(sp)return sp;
    const sp0=SOFT_SPEC[shape],s=r*(shape==='clover'?.82:shape==='star'?.9:.88),k=2*s/sp0.fig;
    const blur=sp0.bl*k*.28,M=Math.ceil(s*1.1+blur*3),D=M*2;
    const cv=document.createElement('canvas');cv.width=cv.height=D;const x=cv.getContext('2d');
    const a=anyToRgb(cols[0]),b=anyToRgb(cols[1]),sh=anyToRgb(cols[2]);
    // ① 채우기
    const g=x.createRadialGradient(M,M-s+.886*2*s,0,M,M-s+.886*2*s,.863*2*s);
    g.addColorStop(0,`rgb(${a.r},${a.g},${a.b})`);g.addColorStop(1,`rgba(${b.r},${b.g},${b.b},.8)`);
    x.fillStyle=g;shapePath(x,shape,M,M,s);x.fill();
    // ② 안쪽 그림자: 그림자 색 판에서 (옮긴+넓힌) 도형 구멍을 뚫고 흐린 뒤, 도형 안에만 곱하기
    const t=document.createElement('canvas');t.width=t.height=D;const tx=t.getContext('2d');
    tx.fillStyle=`rgb(${sh.r},${sh.g},${sh.b})`;tx.fillRect(0,0,D,D);
    tx.globalCompositeOperation='destination-out';tx.fillStyle='#000';tx.strokeStyle='#000';tx.lineJoin='round';
    shapePath(tx,shape,M+sp0.sh[0]*k,M+sp0.sh[1]*k,s);tx.fill();tx.lineWidth=-sp0.sh[3]*k*2;tx.stroke();
    x.save();shapePath(x,shape,M,M,s);x.clip();x.globalCompositeOperation='multiply';x.filter=`blur(${sp0.sh[2]*k/2}px)`;x.drawImage(t,0,0);x.restore();
    // ③ 흐림
    const o=document.createElement('canvas');o.width=o.height=D;const ox=o.getContext('2d');ox.filter=`blur(${blur}px)`;ox.drawImage(cv,0,0);
    sp={c:o,M};if(softCache.size>60)softCache.delete(softCache.keys().next().value);softCache.set(key,sp);return sp;
  }
  function paintShape(c,shape,cx,cy,r,cols,hx,hy){
    if(window.SOFT_SPOT!==false&&SOFT_SPEC[shape]){const sp=softSprite(shape,r,cols);const f=c.filter;c.filter='none';c.drawImage(sp.c,cx-sp.M,cy-sp.M);c.filter=f;return;}
    hx=hx||0;hy=hy||0;
    c.filter=`blur(${r*.05}px)`;
    if(shape==='clover'){ // 파란 빛: 원 4개를 합친 네잎 모양, 가운데 밝은 스틸블루 → 가장자리 진한 파랑
      const s=r*.82,g=c.createRadialGradient(cx+hx*r,cy+hy*r,0,cx,cy,s*1.05);
      g.addColorStop(0,cols[0]);g.addColorStop(.45,cols[1]);g.addColorStop(.8,cols[2]);g.addColorStop(1,cols[2]);
      c.fillStyle=g;cloverPath(c,cx,cy,s);c.fill();
    }else if(shape==='star'){ // 초록 빛: 네 꼭짓점 별, 왼쪽 아래 연두 → 오른쪽 위 청록 대각선 그라데이션
      const s=r*.9,g=c.createLinearGradient(cx-s*.6,cy+s*.6,cx+s*.6,cy-s*.6);
      g.addColorStop(0,cols[0]);g.addColorStop(.45,cols[1]);g.addColorStop(1,cols[2]);
      c.fillStyle=g;starPath(c,cx,cy,s);c.fill();
    }else if(shape==='hex'){ // 핑크 빛: 비스듬히 기운 육각형(피그마 node 144:1604), 아래쪽 꼭짓점에서 진한 핑크 → 가운데 베이지 → 가장자리 핑크
      const s=r*.88,g=c.createRadialGradient(cx-s*.12,cy+s*.78,0,cx-s*.12,cy+s*.78,s*1.75);
      g.addColorStop(0,cols[0]);g.addColorStop(.55,cols[1]);g.addColorStop(1,cols[2]);
      c.fillStyle=g;c.beginPath();HEX.forEach(([x,y],k)=>k?c.lineTo(cx+x*s,cy+y*s):c.moveTo(cx+x*s,cy+y*s));c.closePath();c.fill();
    }else if(shape==='heart'){ // 핑크 빛: 하트, 위 베이지 → 아래 뾰족한 끝으로 갈수록 진한 레드
      const s=r*.9,hh=s*213/257.5,g=c.createLinearGradient(cx,cy-hh,cx,cy+hh);
      g.addColorStop(0,cols[0]);g.addColorStop(.45,cols[1]);g.addColorStop(1,cols[2]);
      c.fillStyle=g;c.fill(heartPath2D(cx,cy,s));
    }
    c.filter='none';
  }
  window.__paintShape=paintShape;
  const ctxMain=ctx;
  function drawOrb(cx,cy,r,alpha,cols,b){
    if(alpha<=.008||r<=.4)return;
    ctx.globalCompositeOperation='lighten';ctx.filter=`blur(${r*.03}px)`;ctx.globalAlpha=alpha;
    let hx=0,hy=0;
    if(b&&b.anchor){
      const hdx=b.anchor.x-cx,hdy=b.anchor.y-cy,hd=Math.hypot(hdx,hdy)||1;
      hx=(hdx/hd)*b.hiMag;hy=(hdy/hd)*b.hiMag;
    }
    if(window.GLOW_LIGHT&&b&&b.shape){glowOrb(cx,cy,r,alpha,cols,b.shape);return;}
    if(window.CRT_LIGHT&&b&&b.shape){crtOrb(cx,cy,r,alpha,cols,b.shape);return;}
    if(window.PIXEL_LIGHT&&b&&b.shape){pixelOrb(cx,cy,r,alpha,cols,b.shape);return;}
    if(b&&b.shape){paintShape(ctx,b.shape,cx,cy,r,cols,hx,hy);return;} // 파랑=네잎(139:1536), 초록=별(139:1541)
    const g=ctx.createRadialGradient(cx+hx*r,cy+hy*r,0,cx,cy,r);
    g.addColorStop(0,cols[0]);g.addColorStop(.38,cols[1]);g.addColorStop(.68,cols[2]);g.addColorStop(.85,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
  }
  /* 빛 아래 글자: 각 글자는 '자기 짝 빛'이 비추는 자리에서만 보임(다른 빛 아래에선 안 보임).
     글자 상자에 그 빛 위치·크기의 원형 마스크를 씌움. 아직 안 켜진 빛의 글자는 완전히 숨김, 퍼즐이 끝나면 마스크를 걷음 */
  const hr0=()=>hero.getBoundingClientRect();
  function lightMask(i,cx,cy,r){
    const el=texts[i],tr=el.getBoundingClientRect(),h0=hr0(),x=cx+h0.left-tr.left,y=cy+h0.top-tr.top;
    const m=`radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, #000 ${(r*.5).toFixed(1)}px, transparent ${(r*.78).toFixed(1)}px)`;
    el.style.webkitMaskImage=el.style.maskImage=m;el.classList.add('lit');
  }
  function hideText(i){const el=texts[i];el.style.webkitMaskImage=el.style.maskImage='linear-gradient(transparent,transparent)';el.classList.add('lit');}
  function freeText(i){const el=texts[i];if(!el.classList.contains('lit'))return;el.style.webkitMaskImage=el.style.maskImage='';el.classList.remove('lit');}
  function draw(){
    const sc=Math.max(w,h)*.62,now=performance.now();
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h); // devicePixelRatio 1, 원래 해상도 그대로 — 스케일 변환 없음
    const fq=transProgress;
    /* 제자리 힌트: 빛이 들어갈 자리에 그 빛과 똑같은 모양의 가는 선을 그 빛 색으로 아주 연하게 계속 보여줌.
       지금 움직이는 빛의 자리는 조금 더 진하고, 가까이 갈수록 또렷해짐. 자리를 찾으면 선은 사라지고 빛이 채움 */
    if(seqIdx>=0&&fq<=.0005)BLOBS.forEach((b,i)=>{
      if(!(b.phase==='pending'||b.phase==='active'||b.phase==='settling'))return;
      const r=b.rr*sc,hx=HOMES[i].x,hy=HOMES[i].y;
      ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='none';
      ctx.globalAlpha=b.phase==='pending'?.07:b.phase==='settling'?.1:.13+(b.near||0)*.3; // 아주 연하게
      ctx.strokeStyle=b.c[1];ctx.lineWidth=1.5;ctx.lineJoin='round';
      if(b.shape==='star')starPath(ctx,hx,hy,r*.9);
      else if(b.shape==='clover'){ // 원 4개의 '합집합' 바깥 테두리만: 원마다 다른 원들 안쪽은 잘라내고(clip) 그림
        const s=r*.82,R=s/1.62,d=R*.62,C=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,k])=>[hx+a*d,hy+k*d]);
        C.forEach(([x,y],j)=>{
          ctx.save();
          C.forEach(([x2,y2],m)=>{if(m===j)return;const p=new Path2D();p.rect(0,0,w,h);p.arc(x2,y2,R-.5,0,Math.PI*2);ctx.clip(p,'evenodd');});
          ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);ctx.stroke();ctx.restore();
        });
        ctx.restore();return;
      }
      else{const k=r*.88;ctx.beginPath();HEX.forEach(([x,y],j)=>j?ctx.lineTo(hx+x*k,hy+y*k):ctx.moveTo(hx+x*k,hy+y*k));ctx.closePath();}
      ctx.stroke();ctx.restore();
    });
    BLOBS.forEach((b,i)=>{
      if(b.phase==='pending'){hideText(i);return;} // 퍼즐 시작 전(인트로 중)에도 글자는 숨김
      if(b.phase==='revealed')freeText(i);
      const r=b.rr*sc;
      if(b.phase==='active'||b.phase==='settling'){
        let cx,cy;
        if(b.phase==='active'){
          b.x+=(b.tx-b.x)*.16;b.y+=(b.ty-b.y)*.16; // 무겁지 않게, 손 따라 비교적 빠르게
          b.x=clampX(b.x);b.y=clampY(b.y);
          cx=b.x;cy=b.y;
          const home=HOMES[i];
          const dist=Math.hypot(cx-home.x,cy-home.y);
          b.near=Math.max(0,Math.min(1,1-(dist-SNAPR[i])/(Math.min(w,h)*.45)));
          if(dist<SNAPR[i]){ // 제자리 근처 → 바로 붙지 않고 잠시 멈췄다가 천천히 자리로 들어감
            b.phase='settling';b.settleAt=now;b.fromX=cx;b.fromY=cy;
            hints[i].classList.remove('show');hints[i].classList.add('done');
          }
        }else{
          const home=HOMES[i],age=now-b.settleAt;
          if(age<SETTLE_HOLD){cx=b.fromX;cy=b.fromY;}
          else{
            const t=Math.min(1,(age-SETTLE_HOLD)/SETTLE_MS),te=easeOutCubic(t);
            cx=b.fromX+(home.x-b.fromX)*te;cy=b.fromY+(home.y-b.fromY)*te;
            if(t>=1){ // 완전히 자리 잡음 → 고정하고 회색으로, 다음 것 등장
              b.x=b.tx=home.x;b.y=b.ty=home.y;
              b.phase='placed';b.muteAt=now;
              texts[i].classList.add('hit');
              setTimeout(spawnNext,600);
            }
          }
        }
        const alpha=flickerAlpha(now-b.onAt);
        lightMask(i,cx,cy,r);
        drawBeam(b,cx,cy,r,alpha);
        drawOrb(cx,cy,r,alpha,b.c,b);
        return;
      }
      if(b.phase==='placed'){ // 회색 잔상으로 가라앉음 — 항목1: 겹쳐도 과다노출 안 되도록 최대 알파를 낮춤
        const cx=HOMES[i].x,cy=HOMES[i].y;
        const t=Math.min(1,(now-b.muteAt)/MUTE_MS);
        const cols=b.c.map((c,k)=>mix(c,b.gray[k],t));
        lightMask(i,cx,cy,r);
        drawOrb(cx,cy,r,(1-.35*t)*.85,cols,b);
        return;
      }
      // revealed: 스크롤이 아직 시작 전(fq~0)이면 원래 방식대로 정적인 원을 그려서 보여주고,
      if(fq>.0005)return; // 스크롤이 시작되면 여기서는 그리지 않음
      const heroA=1;
      const cx=HOMES[i].x,cy=HOMES[i].y;
      const t=Math.min(1,(now-allColorAt)/UNMUTE_MS); // 퍼즐 직후 회색→컬러로 돌아오는 짧은 크로스페이드
      const cols=t<1?b.c.map((c,k)=>mix(b.gray[k],c,t)):b.c;
      drawOrb(cx,cy,r,heroA,cols,b);
    });
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  }
  /* [시안] 8비트 도형 빛: 빛줄기는 원래처럼 부드럽게 두고, 도형(별·육각형·네잎)만
     큰 도트(1920 기준 약 18px)로 ① 가장자리를 계단처럼 딱 자르고(안티앨리어싱 없음) ② 색은 그 빛의 3가지 색을
     대각선 띠 3줄로만 칠함(왼쪽 위 밝은 색 → 오른쪽 아래 진한 색, 띠 사이 경계도 도트 계단). 띠 안은 단색.
     window.PIXEL_LIGHT_SIZE(도트 px)로 조절 */
  const shC=document.createElement('canvas'),shX=shC.getContext('2d'),
        pxC=document.createElement('canvas'),pxX=pxC.getContext('2d',{willReadFrequently:true});
  const hex3=c=>{const m=/^#([0-9a-f]{6})$/i.exec(c);if(m)return[0,2,4].map(k=>parseInt(m[1].substr(k,2),16));const n=(c.match(/[\d.]+/g)||[0,0,0]).map(Number);return n.slice(0,3);};
  function pixelOrb(cx,cy,r,alpha,cols,shape){
    const cell=window.PIXEL_LIGHT_SIZE||Math.max(6,Math.round(18*Math.min(w/1920,h/1080)));
    // 도트 격자는 화면에 고정(움직여도 칸이 흔들리지 않게), 도형 둘레만 잘라서 계산
    const gx0=Math.floor((cx-r*1.05)/cell),gy0=Math.floor((cy-r*1.05)/cell),gx1=Math.ceil((cx+r*1.05)/cell),gy1=Math.ceil((cy+r*1.05)/cell);
    const sw=gx1-gx0,sh=gy1-gy0,W0=sw*cell,H0=sh*cell;if(sw<1||sh<1)return;
    if(shC.width<W0||shC.height<H0){shC.width=Math.max(shC.width,W0);shC.height=Math.max(shC.height,H0);}
    shX.setTransform(1,0,0,1,0,0);shX.globalCompositeOperation='source-over';shX.globalAlpha=1;shX.filter='none';shX.clearRect(0,0,W0,H0);
    const ox=gx0*cell,oy=gy0*cell;
    paintShape(shX,shape,cx-ox,cy-oy,r,['#fff','#fff','#fff'],0,0); // 모양(흰색)만
    if(pxC.width!==sw||pxC.height!==sh){pxC.width=sw;pxC.height=sh;}
    pxX.clearRect(0,0,sw,sh);pxX.imageSmoothingEnabled=true;pxX.drawImage(shC,0,0,W0,H0,0,0,sw,sh);
    const img=pxX.getImageData(0,0,sw,sh),d=img.data,C=cols.map(hex3);
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      const i=(y*sw+x)*4;
      if(d[i+3]<110){d[i+3]=0;continue;} // 반 이상 덮인 칸만
      // 칸 중심의 대각선 위치(-1 왼쪽위 ~ 1 오른쪽아래) → 띠 3줄
      const px=(gx0+x+.5)*cell-cx,py=(gy0+y+.5)*cell-cy,t=(px+py)/(r*1.5);
      const k=t<-.28?0:t<.3?1:2,c=C[k];
      d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;
    }
    pxX.putImageData(img,0,0);
    ctxMain.save();ctxMain.setTransform(1,0,0,1,0,0);ctxMain.globalCompositeOperation='lighten';ctxMain.globalAlpha=alpha;ctxMain.filter='none';ctxMain.imageSmoothingEnabled=false;
    ctxMain.drawImage(pxC,0,0,sw,sh,ox,oy,W0,H0);ctxMain.restore();
  }
  /* [시안] 모니터(CRT) 빛: 도형을 가로 주사선(줄무늬)으로만 그림 — 줄 사이는 비고, 줄마다 끝이 계단처럼 딱 잘림.
     왼쪽엔 붉은, 오른쪽엔 청록 색번짐(색수차)이 살짝 비치고, 전체에 은은한 글로우 + 천천히 내려가는 밝은 띠(화면 롤).
     빛줄기는 원래처럼 부드럽게. window.CRT_PITCH(줄 간격 px)로 조절 */
  const crC=document.createElement('canvas'),crX=crC.getContext('2d');
  const lerpC=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
  function crtOrb(cx,cy,r,alpha,cols,shape){
    const k=Math.min(w/1920,h/1080),P=window.CRT_PITCH||Math.max(4,Math.round(12*k)),cw=Math.max(2,Math.round(6*k)),
          bar=Math.max(2,Math.round(P*.7)),f=Math.max(2,Math.round(4*k)),pad=f*3+Math.round(r*.12);
    const x0=Math.floor(cx-r*1.05)-pad,y0=Math.floor((cy-r*1.05)/P)*P,W0=Math.ceil(r*2.1)+pad*2,H0=Math.ceil((r*2.1+P)/P)*P;
    // ① 모양(흰색)만 그리기
    if(shC.width<W0||shC.height<H0){shC.width=Math.max(shC.width,W0);shC.height=Math.max(shC.height,H0);}
    shX.setTransform(1,0,0,1,0,0);shX.globalCompositeOperation='source-over';shX.globalAlpha=1;shX.filter='none';shX.clearRect(0,0,shC.width,shC.height);
    paintShape(shX,shape,cx-x0,cy-y0,r,['#fff','#fff','#fff'],0,0);
    // ② 줄(P) × 가로칸(cw)으로 줄여서 덮인 칸 판정
    const sw=Math.ceil(W0/cw),sh=H0/P;
    if(pxC.width!==sw||pxC.height!==sh){pxC.width=sw;pxC.height=sh;}
    pxX.clearRect(0,0,sw,sh);pxX.imageSmoothingEnabled=true;pxX.drawImage(shC,0,0,sw*cw,H0,0,0,sw,sh);
    const d=pxX.getImageData(0,0,sw,sh).data,C=cols.map(hex3),now=performance.now();
    // ③ 줄무늬로 합성(오프스크린): 색번짐 먼저, 본색 위에
    if(crC.width<W0||crC.height<H0){crC.width=Math.max(crC.width,W0);crC.height=Math.max(crC.height,H0);}
    crX.setTransform(1,0,0,1,0,0);crX.globalCompositeOperation='source-over';crX.globalAlpha=1;crX.filter='none';crX.clearRect(0,0,crC.width,crC.height);
    const runs=[];
    for(let y=0;y<sh;y++){let s0=-1;for(let x=0;x<=sw;x++){const on=x<sw&&d[(y*sw+x)*4+3]>=110;if(on&&s0<0)s0=x;if(!on&&s0>=0){runs.push([y,s0,x]);s0=-1;}}}
    const top=y0+P*.5;
    crX.globalAlpha=.75;crX.fillStyle='#ff2436';runs.forEach(([y,a,b])=>crX.fillRect(a*cw-f,y*P+(P-bar)/2,(b-a)*cw,bar));
    crX.globalAlpha=.45;crX.fillStyle='#29f0e0';runs.forEach(([y,a,b])=>crX.fillRect(a*cw+f,y*P+(P-bar)/2,(b-a)*cw,bar));
    crX.globalAlpha=1;
    const roll=((now/4200)%1.4-.2)*h; // 천천히 내려가는 밝은 띠(화면 전체 기준)
    runs.forEach(([y,a,b])=>{
      const gy=y0+y*P+P/2,t=Math.max(0,Math.min(1,(gy-(cy-r*.9))/(r*1.8)));
      const c=t<.5?lerpC(C[0],C[1],t*2):lerpC(C[1],C[2],(t-.5)*2);
      const lift=1+.18*Math.exp(-Math.pow((gy-roll)/(h*.06),2)),jit=.94+.06*Math.sin(y*12.9898+Math.floor(now/90)*.7);
      const cs=c.map(v=>Math.min(255,v*lift*jit)|0).join(',');
      crX.fillStyle=`rgba(${cs},.22)`;crX.fillRect(a*cw,y*P,(b-a)*cw,P); // 줄 사이도 아주 옅게 빛나게(글자 가독성)
      crX.fillStyle=`rgb(${cs})`;crX.fillRect(a*cw,y*P+(P-bar)/2,(b-a)*cw,bar);
    });
    // ④ 화면에: 글로우(흐림) + 선명한 줄
    ctxMain.save();ctxMain.setTransform(1,0,0,1,0,0);ctxMain.imageSmoothingEnabled=false;
    ctxMain.globalCompositeOperation='lighter';ctxMain.globalAlpha=alpha*.32;ctxMain.filter=`blur(${Math.max(6,r*.06)}px)`;
    ctxMain.drawImage(crC,0,0,W0,H0,x0,y0,W0,H0);
    ctxMain.filter='none';ctxMain.globalCompositeOperation='lighten';ctxMain.globalAlpha=alpha;
    ctxMain.drawImage(crC,0,0,W0,H0,x0,y0,W0,H0);ctxMain.restore();
  }
  /* [시안] 단색 도트 글로우 빛(레퍼런스: 빛나는 픽셀 아이콘): 빛마다 한 가지 색만.
     도형 안쪽은 하얗게 달아오른 속, 테두리 한 칸은 그 색의 쨍한 테두리, 바깥은 같은 색이 도트 칸 단위로 점점 어두워지는 번짐.
     빛줄기는 원래처럼 부드럽게. window.GLOW_CELL(도트 px)로 조절 */
  const gwC=document.createElement('canvas'),gwX=gwC.getContext('2d');
  const satPick=C=>C.map(c=>{const mx=Math.max(...c),mn=Math.min(...c);return[mx?(mx-mn)/mx:0,c];}).sort((a,b)=>b[0]-a[0])[0][1];
  function boxBlur(a,W,H,R){
    const t=new Float32Array(W*H),o=new Float32Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let k=-R;k<=R;k++){const xx=x+k;if(xx>=0&&xx<W){s+=a[y*W+xx];}n++;}t[y*W+x]=s/n;}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let k=-R;k<=R;k++){const yy=y+k;if(yy>=0&&yy<H){s+=t[yy*W+x];}n++;}o[y*W+x]=s/n;}
    return o;
  }
  function glowOrb(cx,cy,r,alpha,cols,shape){
    const k=Math.min(w/1920,h/1080),cell=window.GLOW_CELL||Math.max(6,Math.round(16*k)),G=6; // G = 번짐 칸 수
    const gx0=Math.floor((cx-r*1.05)/cell)-G,gy0=Math.floor((cy-r*1.05)/cell)-G,gx1=Math.ceil((cx+r*1.05)/cell)+G,gy1=Math.ceil((cy+r*1.05)/cell)+G;
    const sw=gx1-gx0,sh=gy1-gy0,W0=sw*cell,H0=sh*cell,ox=gx0*cell,oy=gy0*cell;
    if(shC.width<W0||shC.height<H0){shC.width=Math.max(shC.width,W0);shC.height=Math.max(shC.height,H0);}
    shX.setTransform(1,0,0,1,0,0);shX.globalCompositeOperation='source-over';shX.globalAlpha=1;shX.filter='none';shX.clearRect(0,0,shC.width,shC.height);
    const MONO=window.GLOW_MONO; // true면 이전(단색) 방식
    paintShape(shX,shape,cx-ox,cy-oy,r,MONO?['#fff','#fff','#fff']:cols,0,0); // 기본: 예전 그 색 그라데이션 그대로
    if(pxC.width!==sw||pxC.height!==sh){pxC.width=sw;pxC.height=sh;}
    pxX.clearRect(0,0,sw,sh);pxX.imageSmoothingEnabled=true;pxX.drawImage(shC,0,0,W0,H0,0,0,sw,sh);
    const img=pxX.getImageData(0,0,sw,sh),d=img.data,N=sw*sh,M=new Float32Array(N);
    if(!MONO)return glowColor(img,d,sw,sh,N,M,ox,oy,W0,H0,alpha);
    for(let i=0;i<N;i++)M[i]=d[i*4+3]>=110?1:0;
    const g=boxBlur(boxBlur(M,sw,sh,2),sw,sh,2); // 바깥 번짐(칸 단위)
    const S=window.GLOW_SOFT??1,base=satPick(cols.map(hex3)),gr=base.reduce((a,b)=>a+b)/3;
    const col=base.map(v=>(v+(gr-v)*.28*S)*(1-.1*S)); // 원래 색에서 채도·밝기를 살짝 낮춘 한 색(덜 쨍하게)
    const core=col.map(v=>v+(232-v)*(.62-.12*S)),mid=col.map(v=>v+(232-v)*.3); // 속도 순백 대신 그 색이 비치는 옅은 톤
    const at=(x,y)=>x<0||y<0||x>=sw||y>=sh?0:M[y*sw+x];
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      const i=y*sw+x,o=i*4;let c,a=255;
      if(M[i]){
        const e1=!(at(x-1,y)&&at(x+1,y)&&at(x,y-1)&&at(x,y+1)); // 테두리 1칸
        const e2=!e1&&!(at(x-2,y)&&at(x+2,y)&&at(x,y-2)&&at(x,y+2)&&at(x-1,y-1)&&at(x+1,y+1)&&at(x-1,y+1)&&at(x+1,y-1));
        c=e1?col:e2?mid:core;
      }else{
        const v=g[i];if(v<.02){d[o+3]=0;continue;}
        const q=Math.round(Math.min(1,v*1.5)*6)/6; // 번짐 밝기도 몇 단계로만(도트 느낌)
        if(q<=0){d[o+3]=0;continue;}
        c=col.map(u=>u*q*.6);
      }
      d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=a;
    }
    pxX.putImageData(img,0,0);
    ctxMain.save();ctxMain.setTransform(1,0,0,1,0,0);ctxMain.imageSmoothingEnabled=false;ctxMain.filter='none';
    ctxMain.globalCompositeOperation='lighten';ctxMain.globalAlpha=alpha;
    ctxMain.drawImage(pxC,0,0,sw,sh,ox,oy,W0,H0);ctxMain.restore();
  }
  /* 글로우(기본): 도형 안은 예전 빛의 색 그라데이션을 도트 칸으로(밝게), 테두리 한 칸은 더 밝게 빛나고,
     바깥은 그 자리 색 그대로 도트 칸 단위로 번짐 → 스포트라이트처럼 환하면서 8bit 느낌 */
  function glowColor(img,d,sw,sh,N,M,ox,oy,W0,H0,alpha){
    const R=new Float32Array(N),Gc=new Float32Array(N),B=new Float32Array(N);
    for(let i=0;i<N;i++){const o=i*4;if(d[o+3]>=110){M[i]=1;R[i]=d[o];Gc[i]=d[o+1];B[i]=d[o+2];}}
    const bl=a=>boxBlur(boxBlur(a,sw,sh,2),sw,sh,2),gm=bl(M),gr=bl(R),gg=bl(Gc),gb=bl(B);
    const at=(x,y)=>x<0||y<0||x>=sw||y>=sh?0:M[y*sw+x],L=window.GLOW_LIFT??.12;
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      const i=y*sw+x,o=i*4;let c;
      if(M[i]){
        const e1=!(at(x-1,y)&&at(x+1,y)&&at(x,y-1)&&at(x,y+1));
        const lift=e1?.38:L; // 테두리는 더 환하게, 안쪽도 살짝 밝게
        c=[R[i],Gc[i],B[i]].map(v=>v+(255-v)*lift);
      }else{
        const v=gm[i];if(v<.02){d[o+3]=0;continue;}
        const q=Math.round(Math.min(1,v*1.5)*6)/6;if(q<=0){d[o+3]=0;continue;}
        c=[gr[i],gg[i],gb[i]].map(u=>u/v*q*.62);
      }
      d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;
    }
    pxX.putImageData(img,0,0);
    ctxMain.save();ctxMain.setTransform(1,0,0,1,0,0);ctxMain.imageSmoothingEnabled=false;ctxMain.filter='none';
    ctxMain.globalCompositeOperation='lighten';ctxMain.globalAlpha=alpha;
    ctxMain.drawImage(pxC,0,0,sw,sh,ox,oy,W0,H0);ctxMain.restore();
  }
})();
/* ===== 눈 (피그마 174:552 · 176:570): 뜬 눈 → 반쯤 감은 눈 → 감은 눈. 인트로와 위쪽 내비게이션이 함께 씀 =====
   s: 0 = 뜬 눈, 1 = 윗꺼풀이 가운데 선까지, 2 = 감은 눈(아래로 휜 선 + 속눈썹). 눈동자는 꺼풀·눈 윤곽 안쪽에서만 보임 */
window.EyeKit=(()=>{
  const P="M32.1835 0C47.3508 0 60.1136 12.2587 63.8681 16.251C64.5334 16.9584 64.5334 18.024 63.8681 18.7314C62.3916 20.3015 59.5201 23.1471 55.6591 26.0254L56.4081 32.8584C56.5028 33.7232 55.5248 34.2879 54.8232 33.7734L49.6259 29.9619C45.6781 32.1728 41.1643 33.9934 36.3212 34.6836L33.1044 41.998C32.7541 42.7945 31.6237 42.7945 31.2734 41.998L28.0556 34.6846C23.2086 33.9954 18.6909 32.1745 14.7402 29.9619L9.54389 33.7734C8.84229 34.2879 7.86426 33.7232 7.95893 32.8584L8.70697 26.0254C4.8463 23.1472 1.97542 20.3014 0.498967 18.7314C-0.166322 18.024 -0.166322 16.9584 0.498967 16.251C4.25348 12.2587 17.0163 7.36564e-07 32.1835 0Z";
  const MID=17.49,L=0,R=64.37,CX=32.18;
  const lerp=(a,b,t)=>a+(b-a)*t,io=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)),hex=a=>'#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let n=0;
  function make(host){
    const id='ek'+(n++);
    host.insertAdjacentHTML('beforeend',`<svg class="eye" viewBox="0 0 65 43" aria-hidden="true"><defs><clipPath id="${id}e"><path d="${P}"/></clipPath><clipPath id="${id}l"><path class="lid-p"/></clipPath></defs><g clip-path="url(#${id}l)"><path class="eye-w" d="${P}"/><g class="eye-sg" clip-path="url(#${id}e)"><path class="eye-s" d="${P}" fill="none" stroke-width="2"/></g></g><g class="pup-g" clip-path="url(#${id}e)"><g clip-path="url(#${id}l)"><circle class="pupil" r="9.64"/></g></g></svg>`);
    const svg=host.lastElementChild,lidP=svg.querySelector('.lid-p'),white=svg.querySelector('.eye-w'),sg=svg.querySelector('.eye-sg'),st=svg.querySelector('.eye-s'),pu=svg.querySelector('.pupil');
    let s=2,sFrom=2,sTo=2,sT0=0,sDur=1,sRes=null,p=[CX,MID],pFrom=p,pTo=p,pT0=0,pDur=1,pRes=null,wasClosed=true;
    let cur={open:rgb('#F5F5F5'),closed:rgb('#D7D7D7'),stroke:rgb('#D7D7D7'),dim:[0]},tgt={...cur},pBase=rgb('#080809');
    const E={svg,onClosed:null,onFrame:null,
      get s(){return s},get sTo(){return sTo},get p(){return p},
      set(v){s=sFrom=sTo=v;},
      to(v,ms){sRes&&sRes();sFrom=s;sTo=v;sT0=performance.now();sDur=reduce?1:ms;return new Promise(r=>sRes=r);},
      look(pos,ms=700){pRes&&pRes();pFrom=p;pTo=pos.slice();pT0=performance.now();pDur=reduce||!ms?1:ms;return new Promise(r=>pRes=r);},
      pupil(c){pBase=rgb(c);},
      theme(t,now){tgt={open:rgb(t.open),closed:rgb(t.closed),stroke:rgb(t.stroke),dim:[t.dim||0]};if(now)cur={...tgt};} // dim: 눈동자 색을 눈 바탕색 쪽으로 누그러뜨리는 정도
    };
    function draw(){
      const b=s<=1?-40*(1-s):28*(s-1);
      lidP.setAttribute('d',`M-10 ${MID}L${L} ${MID}Q${CX} ${MID+b} ${R} ${MID}L75 ${MID}L75 50L-10 50Z`);
      const c=Math.max(0,s-1);
      white.style.fill=hex(cur.open.map((v,i)=>lerp(v,cur.closed[i],c)));
      st.style.stroke=hex(cur.stroke);sg.style.opacity=1-c;
      pu.style.fill=hex(pBase.map((v,i)=>lerp(v,cur.open[i],cur.dim[0])));
      pu.style.opacity=Math.max(0,1-Math.max(0,s-1.4)/.5);
      pu.setAttribute('cx',p[0].toFixed(2));pu.setAttribute('cy',p[1].toFixed(2));
    }
    (function loop(now){
      const t=Math.min(1,(now-sT0)/sDur);s=lerp(sFrom,sTo,io(t));if(t>=1&&sRes){const r=sRes;sRes=null;r();}
      const u=Math.min(1,(now-pT0)/pDur),e=io(u);p=[lerp(pFrom[0],pTo[0],e),lerp(pFrom[1],pTo[1],e)];if(u>=1&&pRes){const r=pRes;pRes=null;r();}
      for(const k in cur)cur[k]=cur[k].map((v,i)=>lerp(v,tgt[k][i],.08));
      if(s>1.95&&!wasClosed){wasClosed=true;E.onClosed&&E.onClosed();}
      if(s<1.5)wasClosed=false;
      draw();E.onFrame&&E.onFrame(E);requestAnimationFrame(loop);
    })(performance.now());
    return E;
  }
  return {make,POS:{left:[16.33,MID],center:[CX,MID],down:[CX,24.13],right:[47.74,MID]}};
})();
/* ===== 인트로 (피그마 2032:312): 로딩 바가 쭉 채워짐 → 그 선이 눈처럼 위아래로 벌어지며 틈으로 첫 화면이 보임 → 눈꺼풀이 화면 밖으로 물러나며 밝은 판이 사라지고 전환 =====
   눈 모양 = 선의 양 끝을 꼭짓점으로 하는 렌즈(위아래 곡선). 피그마 비율: 가로 1800 : 세로 942 */
(()=>{
  const intro=document.getElementById('intro'),pct=document.getElementById('pct'),bar=document.getElementById('bar');
  const svg=document.getElementById('ld2Eye'),cover=svg.querySelector('.ld2-cover'),rim=svg.querySelector('.ld2-rim');
  scrollTo({top:0,left:0,behavior:'instant'});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LOAD_MS=2400,HOLD_MS=250,OPEN_MS=950,GROW_MS=1300,EYE_RATIO=942/1800;
  const eio=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const anim=(ms,fn,e)=>new Promise(r=>{const t0=performance.now();(function f(now){const t=Math.min(1,(now-t0)/ms);fn(e?e(t):t);t<1?requestAnimationFrame(f):r();})(t0);});
  let heroStarted=false;
  // 첫 화면 시작: 주제 한 줄('시선')을 먼저 보여준 뒤 → 스포트라이트가 하나씩 켜짐. 위쪽 내비게이션도 이때 나타남
  function startHero(){
    if(heroStarted)return;heroStarted=true;
    window.Scenes&&Scenes.start();
    const cap=document.getElementById('hCap');
    if(cap){cap.classList.add('show');setTimeout(()=>cap.classList.remove('show'),3000);}
    setTimeout(()=>window.__lightSeqStart&&window.__lightSeqStart(),cap?2700:0);
  }
  // 눈(렌즈) 그리기: 선 위치(cx,cy)를 가운데로, 반폭 hw · 반높이 hh
  function drawEye(cx,cy,hw,hh){
    const W=innerWidth,H=innerHeight;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    const lens=`M${cx-hw},${cy} Q${cx},${cy-2*hh} ${cx+hw},${cy} Q${cx},${cy+2*hh} ${cx-hw},${cy} Z`;
    cover.setAttribute('d',`M0,0 H${W} V${H} H0 Z ${lens}`);rim.setAttribute('d',lens);
  }
  async function openEye(){
    if(reduce){startHero();intro.classList.add('done');return;}
    const r=bar.parentElement.getBoundingClientRect(),cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2,hw=r.width/2,HH=hw*EYE_RATIO;
    drawEye(cx,cy,hw,0);intro.classList.add('eye-open');
    await anim(OPEN_MS,k=>drawEye(cx,cy,hw,HH*k),eio);          // 선이 눈처럼 벌어짐
    startHero();
    /* 눈꺼풀이 계속 열리듯: 위·아래 곡선은 화면 밖으로 물러나고 양 끝도 화면 밖으로 벌어지면서, 밝은 판이 서서히 투명해짐
       (눈 모양을 통째로 확대하던 방식은 뾰족한 끝이 커지며 화면을 덮어 어색했음) */
    const W=innerWidth,H=innerHeight,hw2=Math.max(hw,W*.62),HH2=Math.max(HH,H*.9);
    await anim(GROW_MS,k=>{
      drawEye(cx,cy,hw+(hw2-hw)*k,HH+(HH2-HH)*k);
      const f=Math.max(0,(k-.35)/.65);svg.style.opacity=String(1-f*f);rim.style.opacity=String(1-k);
    },eio);
    intro.classList.add('done');
  }
  /* 들어오면 자동으로 로딩이 진행됨 */
  function start(){
    const t0=performance.now();
    (function step(now){
      const p=Math.min(1,(now-t0)/LOAD_MS),e=Math.pow(p,2.2),n=Math.round(e*100); // 처음엔 천천히 → 중간부터 빨라짐
      pct.textContent=n+'%';bar.style.width=n+'%';
      if(p<1)return requestAnimationFrame(step);
      setTimeout(openEye,HOLD_MS);
    })(t0);
  }
  setTimeout(()=>{if(!intro.classList.contains('done'))start();},400); // 상세 페이지에서 돌아온 경우(인트로 건너뜀)엔 시작 안 함
})();
/* ===== 장면(한 화면) 진행 =====
   페이지를 아래로 스크롤하지 않고, 늘 100vh 한 화면 안에서 장면만 바뀜: 01 LOOK(빛) → 02 FIND(형광펜) → 03 REVEAL(기획 의도).
   위쪽 내비게이션·아래 이전/다음 버튼·휠(한 번)·PageUp/PageDown·스와이프로 이동.
   앞으로 가려면 그 장면을 끝내야 함(빛 3개를 제자리에 / FIND는 형광펜이 다 칠해지면). 뒤로는 언제든 */
const Scenes=(()=>{
  const heroWrap=document.getElementById('heroWrap'),cw=document.getElementById('find'),end=document.getElementById('end'); // cw = 02 FIND 장면(변수 이름만 예전 그대로)
  const nav=document.getElementById('snav'),navBtns=[...nav.querySelectorAll('[data-s]')];
  const ctl=document.getElementById('sctl'),prevB=document.getElementById('scPrev'),nextB=document.getElementById('scNext'),msg=document.getElementById('sctlMsg');
  const NAMES=['LOOK','FIND','REVEAL'];
  const LOCK_MSG=['빛 세 개를 모두 제자리에 놓으면 다음으로 넘어갈 수 있어요','형광펜이 다 칠해지면 다음 장면으로 넘어갈 수 있어요',''];
  let cur=0,busy=false,started=false;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canLeave=i=>i===0?!!window.__heroDone:i===1?!!(window.Find&&Find.done):false;
  const reachable=t=>{for(let i=0;i<t;i++)if(!canLeave(i))return false;return true;};
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const sine=t=>-(Math.cos(Math.PI*t)-1)/2; // 빛 전환용: 처음·끝이 더 부드러운 곡선
  const tween=(ms,fn,e=ease)=>new Promise(res=>{if(reduce){fn(1);return res();}const t0=performance.now();(function f(now){const t=Math.min(1,(now-t0)/ms);fn(e(t));t<1?requestAnimationFrame(f):res();})(t0);});
  const vis=(el,on)=>el.classList.toggle('scene-off',!on);
  function refresh(){
    navBtns.forEach((b,i)=>{b.classList.toggle('cur',i===cur);b.classList.toggle('locked',!reachable(i));b.setAttribute('aria-current',i===cur?'step':'false');});
    prevB.disabled=busy||cur===0;
    const ok=cur<2&&canLeave(cur);
    nextB.disabled=busy||!ok;nextB.hidden=cur===2;
    msg.textContent=cur<2?(ok?`SCROLL · 0${cur+2} ${NAMES[cur+1]}`:LOCK_MSG[cur]):'';
    ctl.classList.toggle('ok',ok);ctl.classList.toggle('end',cur===2);ctl.classList.toggle('busy',busy); // 넘어가는 동안엔 숨김(REVEAL 아래 글자와 겹치지 않게)
    msg.classList.toggle('ok',ok);
    document.body.dataset.scene=NAMES[cur].toLowerCase();
  }
  /* FIND ↔ REVEAL 전환: FIND 글이 흐려지며 사라지고 → REVEAL 화면이 나타난 뒤 종이들이 차례로 놓임(Paper.enter) */
  async function fadeSwap(from,to){
    vis(to,true);to.style.opacity=0;
    await tween(650,t=>{from.style.opacity=1-t;to.style.opacity=t;});
    vis(from,false);from.style.opacity='';to.style.opacity=1;
  }
  async function step(d){
    const from=cur,to=cur+d;
    if(busy||to<0||to>2||(d>0&&!canLeave(from)))return;
    busy=true;refresh();
    dispatchEvent(new CustomEvent('scene-move',{detail:NAMES[to].toLowerCase()})); // 내비 눈: 넘어가기 시작할 때 눈을 뜨고 그쪽을 봄
    if(from===0&&to===1){
      vis(cw,true);
      await tween(4000,t=>{const u=t;__heroCw.set(Math.min(1,u/.3),Math.max(0,(u-.3)/.7));},sine);
      vis(heroWrap,false);showCap();
    }else if(from===1&&to===0){
      vis(heroWrap,true);
      await tween(2800,t=>{const u=1-t;__heroCw.set(Math.min(1,u/.3),Math.max(0,(u-.3)/.7));},sine);
      vis(cw,false);
    }else if(from===1&&to===2){
      window.Paper&&Paper.reset();await fadeSwap(cw,end);end.classList.add('on');window.Paper&&Paper.enter();
    }else if(from===2&&to===1){
      end.classList.remove('on');await fadeSwap(end,cw);
    }
    cur=to;busy=false;refresh();
  }
  async function go(t){
    if(!reachable(t)){nope();return;}
    while(cur!==t&&!busy){const c=cur;await step(t>cur?1:-1);if(cur===c)break;}
  }
  function nope(){msg.classList.remove('nope');void msg.offsetWidth;msg.classList.add('nope');}
  let capShown=false;
  function showCap(){
    if(capShown)return;capShown=true;
    const c=document.getElementById('findCap');if(!c)return;
    c.classList.add('show');setTimeout(()=>c.classList.remove('show'),6000);
  }
  // 이전·다음·내비게이션
  prevB.addEventListener('click',()=>step(-1));
  nextB.addEventListener('click',()=>step(1));
  navBtns.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
  // 휠 한 번 = 한 장면. 잠겨 있으면 안내 문구만 살짝 흔들림
  let wheelLock=0;
  addEventListener('wheel',e=>{
    if(!started)return;
    e.preventDefault();
    if(busy||performance.now()<wheelLock||Math.abs(e.deltaY)<18)return;
    wheelLock=performance.now()+900;
    const d=Math.sign(e.deltaY);
    if(d>0&&(cur===2||!canLeave(cur))){nope();return;}
    step(d);
  },{passive:false});
  addEventListener('keydown',e=>{
    if(!started||e.target.closest?.('input,textarea'))return;
    if(e.defaultPrevented||busy)return;
    const NEXT=['PageDown','ArrowDown','ArrowRight'],PREV=['PageUp','ArrowUp','ArrowLeft'];
    if(NEXT.includes(e.key)){e.preventDefault();if(e.repeat||performance.now()<wheelLock)return;wheelLock=performance.now()+600;canLeave(cur)&&cur<2?step(1):nope();}
    else if(PREV.includes(e.key)){e.preventDefault();if(e.repeat||performance.now()<wheelLock)return;wheelLock=performance.now()+600;step(-1);}
  });
  let ty0=null;
  addEventListener('touchstart',e=>{ty0=e.touches[0].clientY;},{passive:true});
  addEventListener('touchend',e=>{
    if(ty0==null||!started)return;const dy=ty0-e.changedTouches[0].clientY;ty0=null;
    if(Math.abs(dy)<60||e.target.closest?.('.end'))return;
    if(dy>0)canLeave(cur)?step(1):nope();else step(-1);
  });
  vis(cw,false);vis(end,false);
  return {
    refresh,go,
    start(){if(started)return;started=true;nav.classList.add('show');ctl.classList.add('show');refresh();},
    // 상세 페이지에서 돌아왔을 때: 모션 없이 바로 FIND 화면으로(형광펜은 이미 칠해진 상태)
    jumpToFind(){vis(cw,true);__heroCw.set(1,1);vis(heroWrap,false);window.Find&&Find.play(true);cur=1;capShown=true;this.start();refresh();}
  };
})();
window.Scenes=Scenes;
/* 상세 페이지에서 돌아온 경우(새로 불러와졌을 때): 인트로·빛 퍼즐을 건너뛰고 형광펜이 칠해진 FIND 화면으로 */
(()=>{
  let back=false;try{back=sessionStorage.getItem('pf-return')==='1';sessionStorage.removeItem('pf-return');}catch(e){}
  if(!back)return;
  const intro=document.getElementById('intro');intro.classList.add('done');intro.style.display='none';
  window.__heroComplete();
  Scenes.jumpToFind();
})();

/* 내비게이션 눈: 평소엔 감겨 있어 시선을 끌지 않음. 장면이 바뀌면 눈을 뜨고 그 장면 쪽(LOOK 왼쪽 · FIND 아래 · REVEAL 오른쪽)을 본 뒤 몇 초 뒤 다시 감음.
   마우스를 올리고 있는 동안은 뜬 채로(가끔 깜빡임). 감았다 뜰 때마다 눈동자 색이 바뀜. 어두운 배경(LOOK)에선 눈 전체를 어둡게 */
(()=>{
  const PAL=['#080809','#CFF0E7','#F46171','#7ADB8C','#EE6882','#4A7CC0','#FFD1DC','#F2C14E','#9B8CFF'];
  const POS={look:EyeKit.POS.left,find:EyeKit.POS.down,reveal:EyeKit.POS.right};
  const nav=document.getElementById('snav'),eyeB=document.getElementById('snavEye');
  const E=EyeKit.make(eyeB);
  let want=false,ci=0,hover=false,closeT=0,blinkT=0;
  const theme=now=>{const dark=true; // 전체 다크모드
    E.theme(dark?{open:'#3A3A3A',closed:'#3A3A3A',stroke:'#333333',dim:.58}:{open:'#F5F5F5',closed:'#D7D7D7',stroke:'#D7D7D7'},now);};
  theme(true);E.pupil(PAL[0]);E.set(2);E.look(POS.look,0);
  E.onClosed=()=>{ci=(ci+1+(Math.random()*(PAL.length-1)|0))%PAL.length;E.pupil(PAL[ci]);}; // 완전히 감긴 순간 색을 바꿔 두면 다음에 뜰 때 새 색
  const open=()=>{want=true;clearTimeout(closeT);if(E.sTo!==0)E.to(0,380);schedBlink();};
  const closeLater=ms=>{clearTimeout(closeT);closeT=setTimeout(()=>{if(!hover){want=false;clearTimeout(blinkT);E.to(2,520);}},ms);};
  function blink(){if(!want||E.sTo!==0)return;E.to(2,140).then(()=>{if(want)E.to(0,200);});schedBlink();}
  function schedBlink(){clearTimeout(blinkT);blinkT=setTimeout(blink,2600+Math.random()*3400);}
  nav.addEventListener('pointerenter',()=>{hover=true;open();});
  nav.addEventListener('pointerleave',()=>{hover=false;closeLater(900);});
  addEventListener('scene-move',e=>{const k=e.detail;open();clearTimeout(closeT);setTimeout(()=>E.look(POS[k]||POS.look,700),E.s>.5?300:0);});
  new MutationObserver(()=>{theme();closeLater(3000);}).observe(document.body,{attributes:true,attributeFilter:['data-scene']});
  const shOb=new MutationObserver(()=>{if(nav.classList.contains('show')){shOb.disconnect();open();closeLater(3000);}});shOb.observe(nav,{attributes:true,attributeFilter:['class']}); // 처음 나타날 때 한 번만
  const setOpen=o=>{nav.classList.toggle('open',o);eyeB.setAttribute('aria-expanded',o?'true':'false');};
  eyeB.addEventListener('click',e=>{e.stopPropagation();setOpen(!nav.classList.contains('open'));
    open();E.to(2,130).then(()=>E.to(0,210));}); // 누르면 한 번 깜빡(감긴 순간 눈동자 색도 바뀜)
  nav.querySelectorAll('[data-s]').forEach(b=>b.addEventListener('click',()=>setOpen(false)));
  document.addEventListener('click',e=>{if(!nav.contains(e.target))setOpen(false);});
})();
