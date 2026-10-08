/* ===== 02 FIND: 형광펜 =====
   화면 가득 옅게 깔린 문장(FIND_LINE을 이어 붙임) 사이사이에 프로젝트 이름이 끼어 있고, 그 위에 형광펜이 칠해짐.
   - 히어로 → FIND 전환(script.js createDive)에서 빛 3개가 반짝이는 점 → 빛 꼬리가 되어 각자 맡은 형광펜(rect)으로 날아가
     그대로 쓸며 칠함(paint). 다 오면 Find.play()가 불려 나머지 형광펜이 차례로 칠해짐.
   - 형광펜에 마우스를 올리면 프로젝트 미리보기 카드가 커서를 따라오고, 누르면 상세 페이지(project.html?p=번호)로.
   - 다 칠해지면 Find.done = true → 다음 장면(REVEAL)으로 넘어갈 수 있음.
   script.js보다 먼저 불러옴(script.js가 window.Find를 씀). */

/* 상세 페이지로 이동: 화면을 덮고 넘어감. 돌아오면(새로 불러와도) FIND 화면으로 바로(script.js 맨 아래) */
function goProject(i){
  try{sessionStorage.setItem('pf-return','1');}catch(e){}
  document.body.classList.add('leaving');
  setTimeout(()=>{location.href='project.html?p='+i;},550);
}
window.addEventListener('pageshow',e=>{document.body.classList.remove('leaving');if(e.persisted){try{sessionStorage.removeItem('pf-return');}catch(err){}}}); // 뒤로가기로 돌아왔을 때 덮개 걷기

const Find=(()=>{
  /* 배경 문장: 계속 이어 붙여서 화면을 채움 */
  const FIND_LINE='무심코 지나치는 순간들 속에서 새로운 시선으로 의미를 발견하고, 숨겨진 가치를 드러내는 디자이너입니다. ';
  /* 형광펜 색(히어로 빛 색에서 가져옴): lime=초록 별, pink=핑크 육각형, blue=파랑 네잎, soft=장식용 연분홍 */
  const HL={lime:'#E4FF8C',pink:'#FF9DB4',blue:'#4B84E1',soft:'#FFC4D2'};
  /* 글에 들어갈 형광펜(위에서부터 순서대로).
     gap: 앞 형광펜이 끝난 뒤 배경 문장을 몇 글자 흘려보내고 나올지(줄 위치 조절용)
     p: 상세 페이지 번호(project.js PROJECTS 순서: 0 소소복담 · 1 국순당 · 2 AI와 디자인 · 3 해잇 · 4 삼토 · 5 집메이트)
     light: 히어로에서 넘어올 때 이 형광펜 자리로 떨어질 빛(0 초록 별 · 1 핑크 육각형 · 2 파랑 네잎)
     deco: 프로젝트가 아닌 장식 — 배경 문장 속 이 구절을 찾아 칠하기만 함(누를 수 없음)
     img/g: 마우스를 올렸을 때 미리보기 카드의 이미지와 한 줄 설명 */
  const FIND_ITEMS=[
    {gap:18,t:'삼토 페스티벌 리디자인 프로젝트',p:4,c:'blue',light:2,img:'assets/slides/samto/1.jpg',g:'Redesign · Visual  |  2025'},
    {gap:42,t:'국순당 웹사이트 리디자인 프로젝트',p:1,c:'lime',light:0,img:'assets/slides/kooksoondang/1.jpg',g:'Web · Redesign  |  2026'},
    {gap:30,deco:'드러내는 디자이너입니다',c:'soft'},
    {gap:46,t:'소소복담 브랜드 프로젝트',p:0,c:'pink',light:1,img:'assets/slides/sosobokdam/1.jpg',g:'Brand · Package  |  2025'},
    {gap:44,t:'발표 앱 해잇',p:3,c:'lime',img:'assets/slides/haeit/1.jpg',g:'UX/UI · App  |  2025'},
    {gap:40,t:'집메이트',p:5,c:'blue',img:'assets/slides/zipmate/1.jpg',g:'UX/UI · Web App  |  2026'},
    {gap:38,t:'AI와 디자인의 상관관계',p:2,c:'pink',img:'assets/hover/g7.png',g:'Research · Editorial  |  2024'},
  ];
  const TOTAL_CHARS=1600; // 배경 문장 전체 길이(화면보다 넉넉히 — 넘치는 건 잘림)
  const SWEEP_MS=650,STAGGER_MS=280; // 형광펜 한 줄 칠하는 시간 / 다음 형광펜까지 간격

  const sec=document.getElementById('find'),box=document.getElementById('findText'),peek=document.getElementById('findPeek');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const api={done:false,play,reset,target,rect,paint};

  /* 글 만들기: 배경 문장을 흘려보내다가 gap만큼 지나면 형광펜을 끼워 넣음 */
  const marks=[];
  (function build(){
    let pos=0; // 배경 문장 속 현재 위치(FIND_LINE을 무한히 반복한다고 보고 센 글자 수)
    const take=n=>{let s='';for(let k=0;k<n;k++)s+=FIND_LINE[(pos+k)%FIND_LINE.length];pos+=n;return s;};
    const frag=document.createDocumentFragment();
    const text=s=>frag.appendChild(document.createTextNode(s));
    let out=0;
    FIND_ITEMS.forEach((it,idx)=>{
      if(it.deco){ // 장식: gap 뒤에 처음 나오는 그 구절을 칠함
        let k=it.gap;const L=FIND_LINE.length;
        while(k<it.gap+L*2&&take0(pos+k,it.deco.length)!==it.deco)k++;
        text(take(k));
        const sp=document.createElement('span');sp.className='hl hl-deco';sp.textContent=take(it.deco.length);
        sp.style.setProperty('--hc',HL[it.c]);frag.appendChild(sp);marks.push({el:sp,it});
        out+=k+it.deco.length;return;
      }
      text(take(it.gap));out+=it.gap;
      const a=document.createElement('a');a.className='hl';a.href='project.html?p='+it.p;a.textContent=it.t;
      a.dataset.i=idx;a.style.setProperty('--hc',HL[it.c]);
      if(it.light!=null)a.dataset.light=it.light;
      frag.appendChild(a);marks.push({el:a,it});
    });
    text(take(Math.max(0,TOTAL_CHARS-out)));
    box.appendChild(frag);
    function take0(p,n){let s='';for(let k=0;k<n;k++)s+=FIND_LINE[(p+k)%FIND_LINE.length];return s;}
  })();

  /* 빛이 날아올 형광펜의 첫 줄(화면 좌표): 왼쪽 끝 x0 · 오른쪽 끝 x1 · 가운데 높이 y · 줄 높이 h. script.js 전환 캔버스가 매 프레임 읽음 */
  const lightMark=i=>marks.find(m=>m.it.light===i);
  function rect(i){
    const m=lightMark(i);if(!m)return null;
    const r=m.el.getClientRects()[0]||m.el.getBoundingClientRect();
    return{x0:r.left,x1:r.right,y:r.top+r.height/2,h:r.height};
  }
  function target(i){const r=rect(i);return r?{x:r.x0+r.h*.25,y:r.y,h:r.h}:{x:innerWidth/2,y:innerHeight/2,h:40};}
  /* 빛이 지나가는 만큼 형광펜을 칠함(k: 0→1). 전환 캔버스가 진행도에 맞춰 부름(역재생 때는 다시 지워짐) */
  function paint(i,k){
    const m=lightMark(i);if(!m)return;const el=m.el;
    el.style.transition='none';el.style.backgroundSize=(k*100).toFixed(1)+'% 82%';
    el.classList.toggle('painting',k>0);el.classList.toggle('lit',k>.55);
  }
  function unpaint(el){el.style.transition='';el.style.backgroundSize='';el.classList.remove('painting','lit');}

  /* 칠하기: 빛이 맡은 형광펜 3개는 전환 중에 빛이 직접 칠해 둠(paint) → 여기서는 그 상태를 굳히고, 나머지가 위에서부터 차례로 */
  let timers=[];
  function play(instant){
    timers.forEach(clearTimeout);timers=[];
    const first=marks.filter(m=>m.it.light!=null),rest=marks.filter(m=>m.it.light==null);
    first.forEach(m=>{m.el.classList.add('on');unpaint(m.el);m.el.style.transition='none';void m.el.offsetWidth;m.el.style.transition='';});
    if(instant||reduce){
      rest.forEach(m=>{m.el.style.transition='none';m.el.classList.add('on');void m.el.offsetWidth;m.el.style.transition='';});
      finish();return;
    }
    rest.forEach((m,k)=>timers.push(setTimeout(()=>m.el.classList.add('on'),150+k*STAGGER_MS)));
    timers.push(setTimeout(finish,150+rest.length*STAGGER_MS+SWEEP_MS));
  }
  function finish(){api.done=true;sec.classList.add('done');window.Scenes&&Scenes.refresh();}
  function reset(){
    timers.forEach(clearTimeout);timers=[];
    marks.forEach(m=>{m.el.classList.remove('on');unpaint(m.el);});
    api.done=false;sec.classList.remove('done');
  }

  /* 미리보기 카드: 형광펜 위에 마우스를 올리면 커서 오른쪽 아래에서 따라옴(살짝 늦게) */
  const img=peek.querySelector('img'),pt=peek.querySelector('.fp-t'),pg=peek.querySelector('.fp-g');
  let px=0,py=0,tx=0,ty=0,raf=0,curEl=null;
  function loop(){
    px+=(tx-px)*.18;py+=(ty-py)*.18;
    peek.style.transform=`translate(${px.toFixed(1)}px,${py.toFixed(1)}px)`;
    if(curEl||Math.abs(tx-px)+Math.abs(ty-py)>.5)raf=requestAnimationFrame(loop);else raf=0;
  }
  function place(e){
    const W=peek.offsetWidth||280,H=peek.offsetHeight||220,m=24;
    tx=e.clientX+m;ty=e.clientY+m;
    if(tx+W>innerWidth-16)tx=e.clientX-W-m; // 화면 오른쪽 끝이면 커서 왼쪽으로
    if(ty+H>innerHeight-16)ty=e.clientY-H-m;
  }
  marks.forEach(({el,it})=>{
    if(it.deco)return;
    el.addEventListener('pointerenter',e=>{
      if(!el.classList.contains('on'))return;
      curEl=el;box.classList.add('hov');el.classList.add('cur');
      if(it.img){img.src=it.img;peek.classList.remove('no-img');}else peek.classList.add('no-img');
      pt.textContent=it.t;pg.textContent=it.g||'';
      place(e);if(!peek.classList.contains('show')){px=tx;py=ty;}
      peek.classList.add('show');if(!raf)raf=requestAnimationFrame(loop);
    });
    el.addEventListener('pointermove',e=>{if(curEl===el){place(e);if(!raf)raf=requestAnimationFrame(loop);}});
    el.addEventListener('pointerleave',()=>{
      if(curEl!==el)return;curEl=null;box.classList.remove('hov');el.classList.remove('cur');peek.classList.remove('show');
    });
    el.addEventListener('click',e=>{e.preventDefault();if(el.classList.contains('on'))goProject(it.p);});
  });

  return api;
})();
window.Find=Find;
