/* 새로고침 시 브라우저가 "마지막으로 스크롤했던 위치"(예: 십자말풀이 섹션)를 기억했다가 페이지 로드 후 되돌리는
   기본 동작(scroll restoration) 때문에, 로딩이 끝나고 우리가 scrollTo(0,0)으로 맨 위로 보정하는 순간
   html{scroll-behavior:smooth} 때문에 그 되돌아온 지점에서 위로 스르륵 스크롤되는 게 화면에 그대로 보였던 것.
   브라우저가 아예 위치를 기억/복원하지 않도록 끔 */
if('scrollRestoration' in history)history.scrollRestoration='manual';
/* 십자말풀이 크기 배율: 1920×1080에서 칸 한 변 = 60 × CW_K px. 마지막 페이지(REVEAL) 도트 칸도 이 크기에 맞춤 */
const CW_K=.85;
/* ===== 십자말풀이 스테이지 스케일 =====
   피그마 원본이 1920x1080 캔버스라서, 그 비율(16:9) 그대로 축소/확대해 항상 100vh 안에 꽉 차게 맞춤 */
(()=>{
  const stage=document.getElementById('cwStage'),cwSec=document.getElementById('cw');
  function fit(){
    const w=cwSec.clientWidth,h=cwSec.clientHeight;
    const s=Math.min(w/1920,h/1080)*CW_K; // 십자말풀이 전체 크기(칸 크기)를 CW_K만큼 줄임 — 마지막 페이지 격자도 같은 값을 씀
    stage.style.transform=`scale(${s})`;
    /* 화면 속 내용물(칸·장식 상자·그림·카드·버튼)이 캔버스 안에서 왼쪽/위로 치우쳐 있어서
       (1920×1080 기준 여백: 왼쪽 189 · 오른쪽 64 · 위 41 · 아래 68) 전체를 통째로 옮겨 상하좌우 여백을 똑같이 맞춤 */
    const OX=0,OY=0; // 피그마 225:2641 배치를 그대로 쓰므로 1920×1080 캔버스를 가운데에 그대로 둠
    stage.style.top=((h-1080*s)/2+OY*s)+'px';
    /* 좌우 여백도 위아래 여백과 같게: 칸 격자는 가운데 그대로 두고, 양쪽 끝 요소(왼쪽 색 상자 묶음 /
       오른쪽 카드·버튼·색 상자 묶음)만 바깥으로 벌려서 화면 가장자리까지 거리를 위아래 여백과 맞춤.
       내용물 크기(1920×1080 기준) 가로 1667 · 세로 971 → 화면 비율이 넓을수록 조금 더 벌어짐 */
    const m=(h-971*s)/2;                         // 위아래 여백(화면 px)
    const sx0=Math.max(0,Math.min(220,((w-1920*s)/2-24*s)/s)); // 단서 카드·버튼만 화면 오른쪽 여백 쪽으로 밀어 십자말풀이와 사이를 벌림(캔버스 px)
    /* 좌우 여백 맞추기: 카드가 오른쪽으로 밀려 있어서 왼쪽(허수아비 그림 x≈92)만 여백이 넓었음.
       카드·버튼은 화면에서 그대로 두고, 나머지(칸·그림)만 왼쪽으로 옮겨 왼쪽 여백 = 오른쪽 여백(카드 오른쪽 끝 x=1845) */
    const left0=(w-1920*s)/2;
    const L=left0+92*s,R=w-(left0+(1845+sx0)*s);
    const shift=Math.max(0,(L-R))*.55; // 화면 px — 완전히 맞추면 너무 왼쪽으로 쏠려 보여서 차이의 55%만 옮김
    stage.style.left=(left0-shift)+'px';
    const sx=sx0+shift/s; // 카드·버튼은 옮긴 만큼 다시 오른쪽으로 되돌려 제자리 유지
    stage.style.setProperty('--sx',sx+'px');
  }
  fit();addEventListener('resize',fit);
})();
/* ===== 프로젝트 데이터 (내용/이미지는 여기서 수정) =====
   피그마 원본(node 75:308)의 격자를 셀 단위로 실측해서 그대로 재현함(단어는 실제 프로젝트명의 로마자 표기).
   가로/세로 교차 지점과 번호(1~6) 순서까지 원본과 동일 — 그래서 배경 장식 애셋도 피그마 원본 좌표를 그대로 쓸 수 있음 */
const projects=[
  {t:"소소복담",        tag:"Brand · Package", d:"누구나 쉽게 건강한 식사를 누릴 수 있도록 돕는 정다운 집밥 브랜드",                   img:"", word:"SOSOBOKDAM",   x:4, y:3,dir:"v"}, // 1 세로
  {t:"국순당 웹사이트 리디자인",  tag:"Web · Redesign",   d:"2009년에 머물러 있던 국순당 웹사이트를 글로벌 시대에 맞게 새롭게 리디자인한 프로젝트", img:"", word:"KOOKSOONDANG",x:16,y:3,dir:"v"}, // 2 세로
  {t:"AI와 디자인의 상관관계", tag:"Research · Editorial", d:"AI 시대에 디자이너의 역할과 창작 과정이 어떻게 달라지는지 탐구한 실험적인 편집 북", img:"", word:"CORRELATION", x:9, y:0,dir:"v"}, // 3 세로
  {t:"해잇",            tag:"UX/UI · App",    d:"발표가 막막한 분들을 위한 발표 준비·스피치·피드백 앱",                       img:"", word:"HAEIT",        x:7, y:4,dir:"h"}, // 4 가로
  {t:"삼토 페스티벌",   tag:"Redesign · Visual",     d:"차별화된 경험 제공과 아이덴티티를 보완하여 지역 축제 유치를 위한 프로젝트",                          img:"", word:"SAMTOFESTIVAL",x:0, y:8,dir:"h"}, // 5 가로
  {t:"집메이트",        tag:"UX/UI · App",        d:"셀프 인테리어의 시작부터 완성까지 함께하는 커뮤니티 앱, 집메이트",            img:"", word:"ZIPMATE",      x:12,y:12,dir:"h"}, // 6 가로
];
/* 회색 블록(DOM 순서: g6,g1,g2,g4,g3,g5) → 연동될 프로젝트 인덱스.
   AI와 디자인의 상관관계(2번, CORRELATION)는 연결된 이미지가 없고,
   삼토 페스티벌(4번, SAMTOFESTIVAL)은 허수아비(g4)·장바구니 인물(g3) 두 이미지가 같이 연동됨 */
const grayMap=[0,3,1,4,4,5,2]; // 마지막 g7 = AI와 디자인의 상관관계(피그마 232:3735)

/* ===== 십자말풀이 생성 ===== */
const grid=document.getElementById('grid');
const cells={};
let maxX=0,maxY=0,minX=Infinity,minY=Infinity;
projects.forEach((p,i)=>{
  [...p.word].forEach((ch,k)=>{
    const x=p.x+(p.dir==='h'?k:0), y=p.y+(p.dir==='v'?k:0), key=x+','+y;
    maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);minX=Math.min(minX,x);minY=Math.min(minY,y);
    let el=cells[key];
    if(!el){
      el=document.createElement('div');el.className='cell';el.dataset.p='';el.dataset.ch=ch;el.dataset.key=key;
      el.style.left=`calc(var(--c)*${x})`;el.style.top=`calc(var(--c)*${y})`;
      grid.appendChild(el);cells[key]=el;
    }
    el.dataset.p+=i+',';if(el.dataset.p.split(',').filter(Boolean).length>1)el.classList.add('x'); // 교차 칸(피그마처럼 조금 더 밝게)
    if(k===0){const s=document.createElement('sup');s.textContent=i+1;el.appendChild(s);}
  });
});
const gridPxW=60*(maxX+1),gridPxH=60*(maxY+1);
grid.style.width=gridPxW+'px';grid.style.height=gridPxH+'px';
const all=[...grid.children]; // 격자선 SVG를 넣기 전에 셀 목록부터 확정(안 그러면 SVG까지 '칸'으로 잘못 섞임)
// 격자선은 칸마다 따로 그리지 않고 SVG 하나에 선분만 모아서 그림: 내부에서 맞닿는 경계는 한쪽 칸의
// 오른쪽/아래쪽 선으로만 한 번 그리고(항상 그림), 바깥 테두리(이웃이 없는 쪽)만 위쪽/왼쪽 선을 추가로 그림
// → 모든 경계가 정확히 한 번씩만, 하나의 렌더링 패스로 그려져 확대해도 모서리가 어긋나지 않음
{
  const svgNS='http://www.w3.org/2000/svg';var lineOf=window.__lineOf={};
  const svg=document.createElementNS(svgNS,'svg');
  svg.setAttribute('class','gridlines');
  svg.setAttribute('width',gridPxW);svg.setAttribute('height',gridPxH);
  const addLine=(x1,y1,x2,y2,a,b)=>{ // a·b = 이 선을 사이에 둔 두 칸(파도타기 때 그 칸의 선만 잠깐 숨기려고 기록)
    const ln=document.createElementNS(svgNS,'line');
    ln.setAttribute('x1',x1);ln.setAttribute('y1',y1);ln.setAttribute('x2',x2);ln.setAttribute('y2',y2);
    (lineOf[a]=lineOf[a]||[]).push(ln);if(b)(lineOf[b]=lineOf[b]||[]).push(ln);
    svg.appendChild(ln);
  };
  Object.keys(cells).forEach(key=>{
    const [x,y]=key.split(',').map(Number),px=x*60,py=y*60;
    addLine(px,py+60,px+60,py+60,key,x+','+(y+1)); // 아래쪽 선(항상)
    addLine(px+60,py,px+60,py+60,key,(x+1)+','+y); // 오른쪽 선(항상)
    if(!cells[x+','+(y-1)])addLine(px,py,px+60,py,key); // 위쪽 이웃 없으면 위쪽 선도
    if(!cells[(x-1)+','+y])addLine(px,py,px,py+60,key); // 왼쪽 이웃 없으면 왼쪽 선도
  });
  grid.appendChild(svg);
}
// 격자 자체가 이제 피그마 원본과 셀 단위로 동일한 배치라서, 배경 장식(.g1~.g6)은 피그마 실측 좌표를 CSS에 그대로 박아두면 됨(별도 보정 불필요)
/* 칸 선택(클릭) + 키보드 타이핑 지원. 교차 칸을 다시 클릭하면 가로↔세로 방향이 바뀜(games.hankookilbo.com/crossword 방식) */
let selKey=null, selProj=null;
function setSel(key,proj){
  selKey=key;selProj=proj;
  document.querySelectorAll('.cell.selcell').forEach(c=>c.classList.remove('selcell'));
  const el=cells[key];if(el)el.classList.add('selcell');
  show(proj);
  updateHintButtons();
  window.deckGo&&deckGo(proj); // 칸을 누르면 단서 카드도 그 단어로 넘어감
}
function selectCell(key){
  const el=cells[key];if(!el)return;
  const ids=el.dataset.p.split(',').filter(Boolean).map(Number);
  if(!ids.length)return;
  const proj=(selKey===key&&ids.length>1)?ids[(ids.indexOf(selProj)+1)%ids.length]:ids[0];
  setSel(key,proj);
}
function keyXY(key){const[x,y]=key.split(',').map(Number);return{x,y};}
function moveInWord(delta){
  if(selProj==null||!selKey)return;
  const p=projects[selProj],{x,y}=keyXY(selKey);
  const idx=(p.dir==='h'?x-p.x:y-p.y)+delta;
  if(idx<0||idx>=p.word.length)return;
  const nx=p.x+(p.dir==='h'?idx:0),ny=p.y+(p.dir==='v'?idx:0),nkey=nx+','+ny;
  if(cells[nkey])setSel(nkey,selProj);
}
function moveGrid(dx,dy){
  if(!selKey)return;
  const{x,y}=keyXY(selKey),nkey=(x+dx)+','+(y+dy),el=cells[nkey];
  if(!el)return;
  const ids=el.dataset.p.split(',').filter(Boolean).map(Number);
  setSel(nkey,ids.includes(selProj)?selProj:ids[0]);
}
all.forEach(el=>{
  const ids=el.dataset.p.split(',').filter(Boolean).map(Number);
  el.addEventListener('mouseenter',()=>show(ids[0])); // 강조(focusArt)는 아래 마우스 추적기가 담당
  el.addEventListener('click',()=>{
    if(el.classList.contains('portal'))return goProject(+el.dataset.go); // 빙글 도는 칸 = 그 프로젝트 상세 페이지로 가는 버튼
    selectCell(el.dataset.key);
  });
});
/* 단어(칸·카드·그림)에 마우스를 올리면 그 프로젝트 그림만 또렷하게 강조하고,
   나머지 그림은 흑백 + 흐림 + 옅게 → 지금 보는 프로젝트가 눈에 띄게. 마우스가 빠지면 원래대로 */
function focusArt(i){
  const grays=[...document.querySelectorAll('.gray')];
  const has=i!=null&&projectSolved(i); // 그 단어를 맞혔을 때만 강조(그림이 없는 단어도 나머지를 흑백·흐림으로)
  document.getElementById('cwStage').classList.toggle('art-focus',has);
  grays.forEach((g,k)=>g.classList.toggle('focus',has&&grayMap[k]===i));
  // 십자말풀이 칸도 같이: 강조 중인 단어의 칸에만 표시(나머지는 CSS에서 흑백 처리)
  const mine=has?new Set(wordCells(i)):new Set();
  document.querySelectorAll('.cell').forEach(c=>c.classList.toggle('focus-w',mine.has(c)));
}
// (칸에서 마우스가 빠질 때의 강조 해제도 아래 마우스 추적기가 담당)
/* 단어를 맞히면 그 단어의 칸 중 하나(다른 단어와 겹치지 않는 칸)를 골라 가끔 빙글 도는 '버튼 칸'으로 만듦.
   누르면 화면이 밝게 덮이며 그 프로젝트의 상세 페이지(project.html?p=번호)로 넘어감 */
/* 버튼 칸 글자 밑 도형(피그마 node 144:1602, 1~6번 순서): 1 뱃지별, 2 항아리, 3 반짝별, 4 마이크, 5 꽃(기존 그대로), 6 집 */
const PORTAL_ICONS=["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 47 46'%3E%3Cpath d='M23.1426 0L29.4038 6.29752L38.2481 5.49796L38.9965 14.3468L46.2856 19.4193L41.171 26.6789L43.4942 35.25L34.9098 37.5236L31.1801 45.5828L23.1426 41.8065L15.1051 45.5828L11.3754 37.5236L2.79098 35.25L5.11419 26.6789L-0.000404358 19.4193L7.28868 14.3468L8.03707 5.49796L16.8814 6.29752L23.1426 0Z'/%3E%3C/svg%3E", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 39 54'%3E%3Cpath d='M9.16862 0.104369C11.3341 0.00882645 29.085 -0.137439 29.8205 0.283012C29.9659 1.95908 23.1039 6.26728 25.548 10.2322C29.0166 15.6833 33.9352 19.0118 36.8862 25.011C41.4483 34.2847 38.6124 48.5665 28.5086 53.1805C25.4749 54.1568 17.358 54.0802 14.0248 53.8616C10.5062 53.6308 7.74164 52.0654 5.45211 49.4735C2.65426 46.306 1.00578 42.4963 0.335622 38.3707C-2.50621 20.8764 13.6225 15.0969 13.996 8.37544C14.1131 6.27127 12.4164 4.57446 11.0844 3.13303C10.3479 2.33599 9.1164 1.23142 9.16862 0.104369Z'/%3E%3C/svg%3E", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 59 59'%3E%3Cpath d='M28.3374 0.740749C28.6556 -0.247185 30.2507 -0.247184 30.5688 0.74075C32.1637 5.69309 35.42 14.2775 40.0244 18.8819C44.6287 23.4862 53.2132 26.7425 58.1655 28.3374C59.1534 28.6556 59.1534 30.2507 58.1655 30.5688C53.2132 32.1637 44.6287 35.42 40.0244 40.0244C35.42 44.6287 32.1637 53.2132 30.5688 58.1655C30.2507 59.1534 28.6556 59.1534 28.3374 58.1655C26.7425 53.2132 23.4862 44.6287 18.8819 40.0244C14.2775 35.42 5.69309 32.1637 0.740749 30.5688C-0.247185 30.2507 -0.247184 28.6556 0.74075 28.3374C5.69309 26.7425 14.2775 23.4862 18.8819 18.8819C23.4862 14.2775 26.7425 5.69309 28.3374 0.740749Z'/%3E%3C/svg%3E", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Cpath d='M21.0086 4.93563C27.5894 -1.64521 38.2598 -1.64521 44.8406 4.93563C51.4211 11.5165 51.4212 22.186 44.8406 28.7667C40.9014 32.7059 35.497 34.2856 30.3816 33.5089L11.8553 49.296C11.0615 49.9724 9.88076 49.926 9.14336 49.1886L0.585742 40.63C-0.151326 39.8926 -0.198743 38.7127 0.477344 37.919L16.2654 19.3907C15.4899 14.2765 17.0705 8.87396 21.0086 4.93563Z'/%3E%3C/svg%3E", null, "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 54 46'%3E%3Cpath d='M25.6572 0.522461C26.4209 -0.174361 27.5899 -0.174404 28.3535 0.522461L53.3545 23.3369C54.7034 24.5679 53.8321 26.8145 52.0059 26.8145H47.084V43.3916C47.084 44.4962 46.1886 45.3916 45.084 45.3916H8.94727C7.84291 45.3913 6.94727 44.496 6.94727 43.3916V26.8145H2.00391C0.177693 26.8145 -0.692715 24.5679 0.65625 23.3369L25.6572 0.522461Z'/%3E%3C/svg%3E"];
const FLOWER_COLORS=['#FF8FA6','#FFB45E','#83B2FF','#5ED3A2','#FF928C','#B39BFF']; // 1 핑크, 2 노랑, 3 하늘, 4 민트, 5 피치, 6 라벤더 단어 위의 꽃 색
function markPortal(i){
  if(document.querySelector(`.cell.portal[data-go="${i}"]`))return;
  const own=wordCells(i).filter(el=>el&&el.dataset.p.split(',').filter(Boolean).length===1&&!el.classList.contains('portal'));
  const pool=own.length?own:wordCells(i).filter(el=>el&&!el.classList.contains('portal'));
  if(!pool.length)return;
  const el=pool[Math.floor(Math.random()*pool.length)];
  el.classList.add('portal');el.dataset.go=i;el.title=projects[i].t+' 자세히 보기';
  el.style.setProperty('--spin-delay',(Math.random()*6).toFixed(2)+'s');
  // 두께 있는 정육면체 만들기: 앞/뒤는 글자+꽃(첫 칸이면 번호도), 양옆은 ↗
  const sup=el.querySelector('sup'),lf=()=>`<span>${el.dataset.ch}</span>${sup?`<sup>${sup.textContent}</sup>`:''}`;
  const cube=document.createElement('div');cube.className='cube'+(projects[i].dir==='h'?' cube-x':''); // 가로 단어는 세로(위아래)로 굴러감
  cube.innerHTML=`<div class="f front face-l">${lf()}</div><div class="f right face-a"><svg viewBox="0 0 12 12"><path d="M1 11L11 1M2.5 1H11V9.5"/></svg></div><div class="f back face-l">${lf()}</div><div class="f left face-a"><svg viewBox="0 0 12 12"><path d="M1 11L11 1M2.5 1H11V9.5"/></svg></div>`;
  el.appendChild(cube);
  // 도는 칸 = 상세 페이지 입구라는 안내 말풍선(마우스를 올리거나, 처음 맞혔을 때 잠깐 보임)
  const tip=document.createElement('span');tip.className='pt-tip';tip.innerHTML='눌러서 프로젝트 보기 <b>↗</b>';el.appendChild(tip);
  if(!window.__quiet&&!window.__tipShown){window.__tipShown=true;setTimeout(()=>{tip.classList.add('show');setTimeout(()=>tip.classList.remove('show'),5200);},1400);}
  el.style.setProperty('--fc',FLOWER_COLORS[i%FLOWER_COLORS.length]);
  if(PORTAL_ICONS[i])el.style.setProperty('--shape',`url("${PORTAL_ICONS[i]}")`);else el.style.removeProperty('--shape'); // 칸 바탕(단어 색)보다 진한 같은 계열의 꽃
}
function goProject(i){
  try{sessionStorage.setItem('pf-return','1');}catch(e){} // 상세 페이지에서 돌아오면(새로 불러와도) 십자말풀이 화면으로 바로
  document.body.classList.add('leaving');
  setTimeout(()=>{location.href='project.html?p='+i;},550);
}
window.addEventListener('pageshow',e=>{document.body.classList.remove('leaving');if(e.persisted){try{sessionStorage.removeItem('pf-return');}catch(err){}}}); // 뒤로가기로 돌아왔을 때 덮개 걷기(화면 상태가 그대로 살아 있으면 복원 표시도 지움)
const RAINBOW=[[255,209,220],[255,222,196],[255,244,184],[201,245,227],[205,230,255]]; // 연분홍, 살구, 연노랑, 민트, 하늘색
function rainbowAt(t){
  const f=t*(RAINBOW.length-1),i=Math.min(RAINBOW.length-2,Math.floor(f)),u=f-i,a=RAINBOW[i],b=RAINBOW[i+1];
  return `rgb(${a.map((v,j)=>Math.round(v+(b[j]-v)*u)).join(',')})`;
}
/* 단어별 빛 색 = 첫 화면 스포트라이트 색(두 색 그라데이션 + 번짐 색). 빛이 들어간 단어는 그 빛 색
   (소소복담=핑크 육각형, 국순당=파랑 네잎, 해잇=초록 별), 나머지는 같은 톤으로 맞춘 하늘·살구·라벤더 */
const WORD_GLOW=[
  {a:'#FFA5AF',b:'#FFF6C3',g:'255,133,176'}, // 소소복담: 핑크 육각형
  {a:'#6F9DEB',b:'#D9F1EB',g:'75,132,225'},  // 국순당: 파랑 네잎
  {a:'#F3EC7C',b:'#FFFBD8',g:'238,222,100'}, // 상관관계: 은은한 노랑(별 빛의 연노랑 쪽)
  {a:'#83FF9E',b:'#EFFFB0',g:'110,235,150'}, // 해잇: 초록 별
  {a:'#FFBE7A',b:'#FFF1C4',g:'255,170,90'},  // 삼토: 살구
  {a:'#BFA8FF',b:'#EEE6FF',g:'170,140,255'}, // 집메이트: 라벤더
];
/* 고른 단어 하나를 통째로 덮는 빛 판(칸마다 따로 빛나지 않게) — 칸들 아래에 깔리고, 고른 칸은 바탕을 비워 이 판이 보이게 함 */
const wordGlow=document.createElement('div');wordGlow.className='word-glow';grid.insertBefore(wordGlow,grid.firstChild);
/* 빛이 꺼질 때 '띡' 하고 사라지지 않고, 첫 화면 스포트라이트가 켜질 때처럼 틱.. 티틱.. 깜빡이다 꺼짐.
   꺼지는 단어 자리에 빛 판을 하나 복제해 두고(칸 아래), 그 칸들의 바탕도 같은 박자로 빛↔회색을 오감 */
// 꺼짐: 켜진 채 → 틱(어두워짐) → 한 번 살짝 다시 켜졌다가 → 부드럽게 사라짐. [시점(0~1), 밝기, 다음까지 끊김(true)/부드럽게(false)]
const GLOW_OFF_MS=420,GLOW_OFF=[[0,1,true],[.2,.18,true],[.36,.72,false],[1,0,false]];
let glowIdx=null;
function holdFrames(fn){const fr=[];
  GLOW_OFF.forEach(([o,a],k)=>{const pv=GLOW_OFF[k-1];if(pv&&pv[2])fr.push(Object.assign({offset:Math.max(0,o-.001)},fn(pv[1])));fr.push(Object.assign({offset:o},fn(a)));});return fr;}
const rgbaOf=c=>{const m=(c.match(/[\d.]+/g)||[0,0,0,0]).map(Number);return m.length<4?[m[0],m[1],m[2],1]:m;};
function glowOff(prev,keep,snap){
  if(prev==null)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce)return;
  const ghost=snap||wordGlow.cloneNode(false);ghost.classList.add('ghost');ghost.classList.add('show');grid.insertBefore(ghost,wordGlow.nextSibling);
  const T=GLOW_OFF_MS;
  ghost.animate(holdFrames(a=>({opacity:a})),{duration:T,fill:'forwards'}).onfinish=()=>ghost.remove();
  wordCells(prev).forEach(c=>{
    if(!c||(keep&&keep.has(c)))return;
    const off=rgbaOf(getComputedStyle(c).backgroundColor); // 꺼진 뒤 바탕(회색/맞힌 색)
    c.animate(holdFrames(a=>({backgroundColor:`rgba(${off[0]},${off[1]},${off[2]},${(off[3]*(1-a)).toFixed(3)})`})),{duration:T});
  });
}
function show(i){
  const p=projects[i],prevSnap=(glowIdx!=null&&glowIdx!==i)?wordGlow.cloneNode(false):null; // 바뀌기 전 빛 판 모양을 떠 둠
  // 고른 단어 전체가 하나로 환하게: 단어 자리만큼의 빛 판(스포트라이트 색 그라데이션 + 같은 색 번짐)
  let gw=WORD_GLOW[i%WORD_GLOW.length];const n=p.word.length,hz=p.dir==='h';
  if(typeof projectSolved==='function'&&projectSolved(i)){ // 다 채운 단어: 채운 칸 색(WORD_COLORS)을 그대로 따라 빛남
    const wc=WORD_COLORS[i%WORD_COLORS.length],v=parseInt(wc.slice(1),16),rgb=[v>>16,(v>>8)&255,v&255];
    gw={a:wc,b:wc,g:rgb.join(',')};
  }
  Object.assign(wordGlow.style,{left:`calc(var(--c)*${p.x})`,top:`calc(var(--c)*${p.y})`,width:`calc(var(--c)*${hz?n:1})`,height:`calc(var(--c)*${hz?1:n})`,
    background:`linear-gradient(${hz?'90deg':'180deg'},${gw.a},${gw.b})`,boxShadow:`0 0 34px 6px rgba(${gw.g},.55),0 0 90px 20px rgba(${gw.g},.18)`});
  wordGlow.classList.add('show');
  // 단어를 바꿀 때 칸 바탕이 서서히 바뀌면(투명↔회색) 그 사이 잠깐 어두워졌다 밝아져 보여서, 이 순간만 전환 없이 바로 바꿈
  grid.classList.add('snap');
  all.forEach(c=>c.classList.toggle('on',c.dataset.p.split(',').includes(String(i))));
  if(glowIdx!==i){glowOff(glowIdx,new Set(wordCells(i)),prevSnap);glowIdx=i;} // 이전 단어 빛은 깜빡이며 꺼짐
  requestAnimationFrame(()=>requestAnimationFrame(()=>grid.classList.remove('snap')));
  // 퍼즐 전체를 대각선 하나의 무지개로 봄: 왼쪽 위 칸은 연분홍 → 오른쪽 아래 칸은 하늘색.
  // 마우스를 올린 단어는 자기 자리에 해당하는 색 구간만 보여서, 위쪽 단어는 분홍빛·아래쪽 단어는 파란빛이 됨
  if(!window.__rbRange){
    let mx=0,my=0;Object.keys(cells).forEach(k=>{const[x,y]=k.split(',').map(Number);mx=Math.max(mx,x);my=Math.max(my,y);});
    window.__rbRange=mx+my||1;
  }
  wordCells(i).forEach(c=>{if(!c)return;const[x,y]=c.dataset.key.split(',').map(Number);c.style.setProperty('--rb',rainbowAt((x+y)/window.__rbRange));});
  document.querySelectorAll('.it').forEach(e=>e.classList.toggle('act',+e.dataset.i===i));
}
/* 회색 장식 이미지는 더 이상 마우스 호버로 보여주지 않고, 그 단어를 실제로 다 맞혀야 보이게 함 */
function projectSolved(i){
  const p=projects[i];
  return [...p.word].every((ch,k)=>{
    const x=p.x+(p.dir==='h'?k:0), y=p.y+(p.dir==='v'?k:0), el=cells[x+','+y];
    return el&&el.querySelector('.ch').textContent===el.dataset.ch;
  });
}
function updateGrayReveal(){
  document.querySelectorAll('.gray').forEach((g,k)=>g.classList.toggle('cur',projectSolved(grayMap[k])));
}
/* 단어 단위 정답 확인: 그 단어의 칸이 전부 채워졌을 때만 채점한다(덜 채워진 상태는 그냥 둠).
   맞으면 그 단어의 칸을 초록으로 잠그고(교차 칸도 같이 포함되므로 자연히 함께 잠김) 단서 목록에 체크,
   틀리면 짧게 흔들었다가 원래대로 돌려서 다시 시도할 수 있게 둔다 */
function wordCells(i){
  const p=projects[i];
  return [...p.word].map((ch,k)=>{
    const x=p.x+(p.dir==='h'?k:0), y=p.y+(p.dir==='v'?k:0);
    return cells[x+','+y];
  });
}
/* 단어별 정답 색: 1 핑크, 2 노랑, 3 하늘, 4 민트, 5 피치, 6 라벤더.
   두 단어가 겹치는 칸은 두 단어를 다 맞히면 두 색을 곱하기(multiply)로 섞어서, 투명한 색지 두 장이 겹친 듯한 색이 됨 */
const WORD_COLORS=['#FFD1DC','#FFF1A8','#CBE3FF','#C4F0DC','#FFD9BD','#E2D8FF'];
function mulHex(a,b){ // 두 색을 곱하기(multiply)로 섞음
  const p=h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16));
  const A=p(a),B=p(b);
  // 순수 곱하기는 탁해져서, 두 색의 평균과 반쯤 섞어 파스텔 느낌을 유지(겹친 티는 나되 칙칙하지 않게)
  return '#'+A.map((v,k)=>Math.round(.55*(v*B[k]/255)+.45*((v+B[k])/2)).toString(16).padStart(2,'0')).join('');
}
function cellColor(el){ // 이 칸이 속한 단어 중 맞힌 단어들의 색(2개면 섞은 색)
  const ids=el.dataset.p.split(',').filter(Boolean).map(Number).filter(projectSolved);
  const cols=ids.map(k=>WORD_COLORS[k%WORD_COLORS.length]);
  return cols.length>1?cols.reduce(mulHex):cols[0];
}
/* ===== 단어를 맞혔을 때 축하: 칸이 차례로 톡톡 튀어 오르는 파도 + 팡파레 ===== */
const celebrated=new Set();
/* 파도타기: 칸이 튀어 오르는 동안 그 칸에 붙은 격자선(SVG)만 잠깐 숨기고, 칸이 자기 테두리를 달고 통째로 움직임.
   (격자 전체 선을 숨기고 칸마다 테두리를 그리면, 화면 배율 때문에 1px 선이 군데군데 흐려지거나 사라져 보였음) */
const lineHide=new Map();
function hideLines(key,on){
  (window.__lineOf[key]||[]).forEach(ln=>{
    const n=(lineHide.get(ln)||0)+(on?1:-1);lineHide.set(ln,n);
    ln.style.visibility=n>0?'hidden':'';
  });
}
function waveWord(i,delay=0){ // 단어 첫 칸부터 끝 칸까지 차례로 살짝 튀어 오름(칸 테두리까지 통째로)
  wordCells(i).forEach((el,k)=>{
    const key=el.dataset.key,d=delay+k*70;
    setTimeout(()=>hideLines(key,true),d);
    const an=el.animate(
      [{transform:'none',boxShadow:'0 0 0 1px #111',zIndex:5},{transform:'translateY(-10px) scale(1.05)',filter:'brightness(1.06) saturate(1.2)',boxShadow:'0 0 0 1px #111',zIndex:5,offset:.35},{transform:'none',boxShadow:'0 0 0 1px #111',zIndex:5}],
      {duration:700,delay:d,easing:'cubic-bezier(.3,1.1,.5,1)'});
    an.onfinish=()=>hideLines(key,false);
  });
}
/* 팡파레: 화면 양쪽 아래 모서리에서 폭죽 종이가 화면 가운데 위쪽을 향해 비스듬히 쏟아져 나왔다가,
   팔랑이며(좌우로 뒤집히며) 천천히 떨어져 사라짐. 화면 기준(position:fixed)이라 십자말풀이 배율과 상관없이 모서리에서 나옴 */
function fanfare(i,all=false){
  let layer=document.getElementById('fanfare');
  if(!layer){layer=document.createElement('div');layer.id='fanfare';document.body.appendChild(layer);}
  const col=FLOWER_COLORS[i%FLOWER_COLORS.length];
  // 한 단어: 그 단어 색 위주 / 전부 다 맞혔을 때: 모든 단어 색 + 빛 색을 섞어 다채롭게
  const cols=all?[...FLOWER_COLORS,...WORD_COLORS,'#FFD45E','#7ADB8C','#4A7CC0','#EE6882','#ffffff']
               :[col,col,WORD_COLORS[i%WORD_COLORS.length],'#FFD45E','#ffffff',FLOWER_COLORS[(i+2)%6]];
  const W=innerWidth,H=innerHeight,u=Math.min(W,H)/1000; // 화면 크기에 비례
  [[0,H,-58],[W,H,-122]].forEach(([x,y,angle],side)=>{
    for(let k=0;k<80;k++){
      const e=document.createElement('i');e.className='ff';
      const kind=k%4,w=(kind<2?6:kind===2?10:8)*u*1.4,h=(kind<2?(18+Math.random()*14):kind===2?10:8)*u*1.4;
      e.style.width=w+'px';e.style.height=h+'px';e.style.left=(x-w/2)+'px';e.style.top=(y-h/2)+'px';
      e.style.background=all?cols[Math.random()*cols.length|0]:cols[k%cols.length];
      if(kind<2)e.style.borderRadius=(w/2)+'px';else if(kind===3)e.style.borderRadius='50%';
      layer.appendChild(e);
      const a=(angle+(Math.random()-.5)*30)*Math.PI/180,v=(1700+Math.random()*1300)*u,vx=Math.cos(a)*v,vy=Math.sin(a)*v;
      const g=380*u,T=2.6+Math.random()*1.2,drag=2.1,kf=[];
      for(let j=0;j<=14;j++){ // 처음엔 세게 뿜어져 나오고(공기 저항으로 금방 느려짐) 이후엔 중력으로 천천히 팔랑이며 내려옴
        const t=T*j/14,d=(1-Math.exp(-drag*t))/drag,sway=Math.sin(t*5+k)*30*u*Math.min(1,t);
        kf.push({transform:`translate(${vx*d+sway}px,${vy*d+g*t*t/2}px) rotate(${(k%2?1:-1)*j*50}deg) scaleX(${Math.cos(j*1.1+k).toFixed(2)})`,opacity:j<11?1:1-(j-11)/3});
      }
      e.animate(kf,{duration:T*1000,delay:side*60+Math.random()*140,easing:'linear',fill:'backwards'}).onfinish=()=>e.remove();
    }
  });
}
function celebrate(i){
  if(window.__quiet||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const all=projects.every((q,k)=>projectSolved(k));
  // '자동으로 풀기' 중엔 팡파레를 전부 채워졌을 때 한 번만
  waveWord(i);
  if(!autoRunning||all)setTimeout(()=>fanfare(i,all),250);
  // 전부 다 맞혔으면 여섯 단어가 차례차례 한 번씩 더 파도
  if(all)projects.forEach((q,k)=>waveWord(k,900+k*220));
}

function checkWord(i){
  const els=wordCells(i);
  if(!els.every(el=>el.querySelector('.ch').textContent))return; // 아직 다 안 채워짐
  if(projectSolved(i)){
    els.forEach(el=>{
      el.style.setProperty('--wc',cellColor(el));
      el.classList.add('correct','locked');
    });
    markPortal(i);
    window.deckRefresh&&deckRefresh();
    document.querySelectorAll(`.it[data-i="${i}"]`).forEach(e=>e.classList.add('done'));
    if(!celebrated.has(i)){celebrated.add(i);celebrate(i);}
  }else{
    els.forEach(el=>{
      el.classList.remove('wrong');void el.offsetWidth; // 애니메이션 재시작을 위해 강제로 리플로우
      el.classList.add('wrong');
    });
    setTimeout(()=>els.forEach(el=>el.classList.remove('wrong')),300);
  }
}
/* 드래그 앤 드롭 + 키보드 + 힌트: 칸에 글자 넣기. 저장은 하지 않음 — 새로고침/재방문 때마다 항상 빈 칸에서 시작.
   isHint가 true면 힌트 버튼으로 채운 글자라는 표시(회색 글자색)를 남김. 정답으로 잠긴(.locked) 칸은 수정 불가 */
const putFns={};
Object.keys(cells).forEach(k=>{
  const el=cells[k],span=document.createElement('span');span.className='ch';el.appendChild(span);
  const put=(t,isHint)=>{
    if(el.classList.contains('locked'))return;
    const c=[...(t||'').trim()][0]||'';
    span.textContent=c;
    span.classList.toggle('hint-ch',!!(isHint&&c));
    checkSolved();updateGrayReveal();
    el.dataset.p.split(',').filter(Boolean).forEach(i=>checkWord(+i));
    updateHintButtons();
    updateAutoBtn();
  };
  putFns[k]=put;
  el.addEventListener('dragover',e=>{if(el.classList.contains('locked'))return;e.preventDefault();el.classList.add('over')});
  el.addEventListener('dragleave',()=>el.classList.remove('over'));
  el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');put(e.dataTransfer.getData('text/plain'))});
  el.addEventListener('dblclick',()=>put(''));
});
/* 키보드로 타이핑: 칸을 클릭해 선택한 뒤 알파벳을 치면 채워지고 단어 방향으로 자동 이동,
   백스페이스는 지우고 한 칸 뒤로, 방향키는 격자 위에서 자유롭게 이동. 잠긴 칸은 그냥 건너뜀 */
document.addEventListener('keydown',e=>{
  if(!selKey||!cells[selKey])return;
  if(e.key.length===1&&/[a-zA-Z]/.test(e.key)){
    putFns[selKey](e.key.toUpperCase());
    moveInWord(1);
    e.preventDefault();
  }else if(e.key==='Backspace'){
    const editable=!cells[selKey].classList.contains('locked');
    if(editable&&cells[selKey].querySelector('.ch').textContent){
      putFns[selKey]('');
    }else{
      moveInWord(-1);
      if(selKey&&!cells[selKey].classList.contains('locked'))putFns[selKey]('');
    }
    e.preventDefault();
  }else if(e.key==='ArrowLeft'){moveGrid(-1,0);e.preventDefault();}
  else if(e.key==='ArrowRight'){moveGrid(1,0);e.preventDefault();}
  else if(e.key==='ArrowUp'){moveGrid(0,-1);e.preventDefault();}
  else if(e.key==='ArrowDown'){moveGrid(0,1);e.preventDefault();}
});
/* 힌트 버튼: 한 글자만 열기 / 선택된 단어 전체 열기. 선택된 칸·단어가 없거나 이미 다 맞혔으면 비활성화 */
const btnHintLetter=document.getElementById('cwHintLetter'),btnHintWord=document.getElementById('cwHintWord');
function updateHintButtons(){
  const noSel=selKey==null;
  btnHintLetter.disabled=noSel||cells[selKey].classList.contains('locked');
  btnHintWord.disabled=noSel||projectSolved(selProj);
}
btnHintLetter.addEventListener('click',()=>{
  if(selKey==null)return;
  putFns[selKey](cells[selKey].dataset.ch,true);
});
btnHintWord.addEventListener('click',()=>{
  if(selProj==null)return;
  wordCells(selProj).forEach(el=>putFns[el.dataset.key](el.dataset.ch,true));
});
updateHintButtons();
/* 십자말풀이 자동으로 풀기: 한 번에 다 채우지 않고 1번 단어부터 차례대로, 글자도 하나씩 타이핑하듯 채움.
   이미 맞게 들어가 있는 칸(다른 단어와 겹치는 칸 등)은 건너뜀 */
const AUTO_LETTER_MS=70;  // 글자 사이 간격
const AUTO_WORD_MS=350;   // 단어 사이 쉬는 시간
let autoRunning=false;
const cwAutoBtn=document.getElementById('cwAuto');
const AUTO_LABEL=cwAutoBtn.textContent,RESET_LABEL='십자말풀이 다시 풀기';
/* 칸이 전부 채워져 있으면 버튼을 '리셋' 버튼으로 바꿈 (자동 채우는 중에는 바꾸지 않음) */
function allFilled(){return Object.keys(cells).every(k=>cells[k].querySelector('.ch').textContent);}
function updateAutoBtn(){
  if(autoRunning)return;
  const full=allFilled();
  cwAutoBtn.classList.toggle('is-reset',full);
  cwAutoBtn.textContent=full?RESET_LABEL:AUTO_LABEL;
}
/* 단어 하나만 비우기(카드의 '다시 풀기'): 그 단어 칸의 글자·정답 표시·버튼 칸(정육면체)을 지움.
   다른 맞힌 단어와 겹치는 칸은 그 단어 글자라 그대로 두고 색만 그 단어 색으로 */
function clearWord(i){
  const portal=document.querySelector(`.cell.portal[data-go="${i}"]`);
  if(portal){portal.classList.remove('portal');delete portal.dataset.go;portal.removeAttribute('title');portal.querySelector('.cube')?.remove();portal.querySelector('.pt-tip')?.remove();}
  const els=wordCells(i);
  els.forEach(el=>{
    const others=el.dataset.p.split(',').filter(Boolean).map(Number).filter(k=>k!==i&&projectSolved(k));
    if(others.length)return;
    el.classList.remove('correct','locked','wrong','over');el.style.removeProperty('--wc');
    const sp=el.querySelector('.ch');sp.textContent='';sp.classList.remove('hint-ch');
  });
  els.forEach(el=>{if(el.classList.contains('correct'))el.style.setProperty('--wc',cellColor(el));}); // 남은 겹침 칸은 남은 단어 색으로
  document.querySelectorAll(`.it[data-i="${i}"]`).forEach(e=>e.classList.remove('done'));
  celebrated.delete(i); // 다시 맞히면 또 축하
  cwSolved=false;
  updateGrayReveal();updateHintButtons();updateAutoBtn();
  window.deckRefresh&&deckRefresh();
  focusArt(null);
}
/* 리셋: 채운 글자·정답 잠금·힌트 표시·단서 체크·회색 이미지까지 전부 처음 상태로 되돌림 */
function resetCrossword(){
  Object.keys(cells).forEach(k=>{
    const el=cells[k],sp=el.querySelector('.ch');
    el.classList.remove('correct','locked','wrong','over');
    el.style.removeProperty('--wc');
    el.classList.remove('portal');delete el.dataset.go;el.removeAttribute('title');
    el.querySelector('.cube')?.remove();el.querySelector('.pt-tip')?.remove();
    sp.textContent='';sp.classList.remove('hint-ch');
  });
  document.querySelectorAll('.it.done').forEach(e=>e.classList.remove('done'));
  celebrated.clear();
  cwSolved=false;
  updateGrayReveal();updateHintButtons();updateAutoBtn();
  window.deckRefresh&&deckRefresh();
  window.Scenes&&Scenes.refresh();
  if(started)reveal(); // 초기화하면 칸들이 빛방울에서 박스로 떨어지는 등장 모션을 처음부터 다시 보여줌
  if(cwArrived&&window.scrollY>=cwSection.offsetTop-1){ // 십자말풀이 화면에 있으면 다시 스크롤 잠금
    window.scrollTo({top:cwSection.offsetTop,left:0,behavior:'instant'});
    document.body.classList.add('lock');
  }
}
cwAutoBtn.addEventListener('click',()=>{
  if(autoRunning)return;
  if(cwAutoBtn.classList.contains('is-reset'))return resetCrossword();
  autoRunning=true;cwAutoBtn.disabled=true;
  const steps=[];
  projects.forEach((p,i)=>{
    wordCells(i).forEach(el=>steps.push({el,gap:AUTO_LETTER_MS}));
    if(steps.length)steps[steps.length-1].endOfWord=true;
  });
  let n=0;
  (function next(){
    while(n<steps.length){
      const st=steps[n++],el=st.el;
      if(el.querySelector('.ch').textContent===el.dataset.ch){ // 이미 정답이면 건너뛰되, 단어 끝이면 잠깐 쉼
        if(st.endOfWord)return setTimeout(next,AUTO_WORD_MS);
        continue;
      }
      putFns[el.dataset.key](el.dataset.ch);
      return setTimeout(next,st.endOfWord?AUTO_WORD_MS:st.gap);
    }
    autoRunning=false;cwAutoBtn.disabled=false;
    updateAutoBtn();
  })();
});
/* 십자말풀이를 다 풀기 전에는 그 섹션에서 위/아래 어느 쪽으로도 스크롤이 안 되게 완전히 막음(인트로의
   스포트라이트 퍼즐과 같은 방식). 아래로 넘어가는 것만 막고 위로는 열어두면, 다시 스크롤하려 할 때마다
   위치를 되돌리는 보정이 반복돼 화면이 드득거리는 느낌이 남 — 그래서 도착하는 순간 body에 이미 있는
   .lock(overflow:hidden)을 그대로 씌워서 아예 스크롤 자체가 안 일어나게 함 */
let cwSolved=false;
function checkSolved(){
  cwSolved=Object.keys(cells).every(k=>cells[k].querySelector('.ch').textContent===cells[k].dataset.ch);
  if(cwSolved)document.body.classList.remove('lock');
  try{sessionStorage.setItem('pf-solved',JSON.stringify(projects.map((p,i)=>i).filter(projectSolved)));}catch(e){}
  window.Scenes&&Scenes.refresh();
}
const cwSection=document.getElementById('cw');
window.addEventListener('scroll',()=>{
  if(cwSolved)return;
  const cwTop=cwSection.offsetTop;
  if(window.scrollY>=cwTop-1){
    cwArrived=true;
    window.scrollTo({top:cwTop,left:0,behavior:'instant'});
    document.body.classList.add('lock');
  }
});
/* 화면 크기를 바꾸면 히어로 핀 구간 길이(화면 높이의 130%)가 달라져 십자말풀이 위치(offsetTop)도 바뀌는데,
   스크롤이 잠겨(.lock) 있어서 예전 위치에 그대로 멈춰 빈 화면이 보이던 문제 → 크기가 바뀌면 새 위치로 다시 맞춤 */
let cwArrived=false;
function resnapCw(){
  if(!cwArrived||cwSolved)return;
  window.scrollTo({top:cwSection.offsetTop,left:0,behavior:'instant'});
}
addEventListener('resize',()=>requestAnimationFrame(resnapCw));
if(window.ScrollTrigger)ScrollTrigger.addEventListener('refresh',resnapCw); // 핀 길이가 다시 계산된 직후에도 한 번 더
const chipBox=document.getElementById('chips');
[...new Set(projects.map(p=>p.word).join('').split(''))].forEach(ch=>{
  const c=document.createElement('div');c.className='chip';c.draggable=true;c.textContent=ch;
  c.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',ch);e.dataTransfer.effectAllowed='copy'});
  chipBox.appendChild(c);
});
document.querySelector('.cw-stage').addEventListener('mouseleave',()=>{
  grid.classList.add('snap');all.forEach(c=>c.classList.remove('on'));wordGlow.classList.remove('show');glowOff(glowIdx);glowIdx=null;
  requestAnimationFrame(()=>requestAnimationFrame(()=>grid.classList.remove('snap')));
  document.querySelectorAll('.it').forEach(e=>e.classList.remove('act'));
});
/* 소개 패널 */
function buildPanel(el,label,idx){
  el.innerHTML=`<h4>${label}</h4>`+idx.map(i=>{const p=projects[i];return `<div class="it" data-i="${i}"><div class="r1"><span class="n">0${i+1}</span><span class="t">${p.t}</span><span class="g">${p.tag}</span></div><div class="d">${p.d}</div></div>`}).join('');
  el.querySelectorAll('.it').forEach(e=>{e.addEventListener('mouseenter',()=>show(+e.dataset.i));e.addEventListener('click',()=>show(+e.dataset.i));});
}
buildPanel(document.getElementById('pa'),'가로',projects.map((p,i)=>p.dir==='h'?i:-1).filter(i=>i>=0));
buildPanel(document.getElementById('pd'),'세로',projects.map((p,i)=>p.dir==='v'?i:-1).filter(i=>i>=0));
/* ===== 단서 카드 덱(피그마 node 151:2220 카드 디자인, 1.5배 크기) =====
   오른쪽 위에 카드 한 묶음(맨 앞 1장 + 뒤로 2장이 아래로 살짝 비침).
   카드 = 왼쪽: 그 단어의 도형(맞히면 색) + 세로 번호 / 가운데: 제목, 글자 수만큼의 빈 칸(맞히면 글자가 채워짐), 설명
          오른쪽 위: ↗ 상자 → 상세 페이지 / 아래 양쪽: 이전·다음 카드 단어의 도형 위에 ← → (그 카드로 넘어감)
   카드를 옆으로 끌어도 넘어가고, 마우스를 올리면 그 단어가 격자에서 하이라이트, 누르면 첫 빈칸 선택. 격자 칸을 눌러도 카드가 따라옴 */
(()=>{
  const stage=document.getElementById('cwStage'),N=projects.length;
  const deck=document.createElement('div');deck.className='deck';
  deck.innerHTML='<div class="dk-cards"></div>';
  stage.appendChild(deck);
  const wrap=deck.querySelector('.dk-cards');
  const shapeOf=i=>PORTAL_ICONS[i]?`url("${PORTAL_ICONS[i]}")`:null;
  const AR_UR='<svg viewBox="0 0 12 12"><path d="M1 11L11 1M2.5 1H11V9.5"/></svg>';
  const AR_L='<svg viewBox="0 0 24 24"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>';
  const AR_R='<svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
  const cards=projects.map((p,i)=>{
    const c=document.createElement('div');c.className='dk-card';c.dataset.i=i;
    const prev=(i-1+N)%N,next=(i+1)%N;
    if(shapeOf(i))c.style.setProperty('--shape',shapeOf(i));
    if(shapeOf(prev))c.style.setProperty('--prev-shape',shapeOf(prev));
    if(shapeOf(next))c.style.setProperty('--next-shape',shapeOf(next));
    c.style.setProperty('--fc',FLOWER_COLORS[i%FLOWER_COLORS.length]);
    c.style.setProperty('--prev-fc',FLOWER_COLORS[prev%FLOWER_COLORS.length]);c.style.setProperty('--next-fc',FLOWER_COLORS[next%FLOWER_COLORS.length]);
    const label=[...(p.dir==='h'?'가로':'세로'),String(i+1)].map(ch=>`<b>${ch}</b>`).join('');
    c.innerHTML=`<div class="dk-side"><i class="dk-ic"></i><span class="dk-no">${label}</span></div>`+
      `<div class="dk-body"><h5>${p.t}</h5><div class="dk-boxes" style="--n:${p.word.length}">${[...p.word].map(()=>'<span></span>').join('')}</div><div class="dk-en">${p.word}</div><p>${p.d}</p><p class="dk-tip">칸에서 돌아가는 <b>↗</b>를 누르면 프로젝트 보기</p></div>`+
      `<button class="dk-open" type="button">문제 풀기</button>`+
      `<button class="dk-prev" type="button" aria-label="이전 카드: ${projects[prev].t}"><i></i>${AR_L}</button>`+
      `<button class="dk-next" type="button" aria-label="다음 카드: ${projects[next].t}"><i></i>${AR_R}</button>`;
    // 오른쪽 위 버튼: 아직 못 맞힌 단어면 '문제 풀기'(정답을 칸에 채움), 맞힌 단어면 '다시 풀기'(그 단어만 비워서 다시 풀기)
    c.querySelector('.dk-open').addEventListener('click',e=>{
      e.stopPropagation();
      if(projectSolved(i))clearWord(i);
      else{ // 자동 풀기처럼 한 글자씩 타이핑하듯 채움(이미 맞는 칸은 건너뜀). 힌트 회색이 아니라 직접 푼 것처럼 검정 글자로
        if(c.dataset.typing)return;c.dataset.typing='1';
        const todo=wordCells(i).filter(el=>el.querySelector('.ch').textContent!==el.dataset.ch);
        todo.forEach((el,k)=>setTimeout(()=>{
          putFns[el.dataset.key](el.dataset.ch);
          if(k===todo.length-1)delete c.dataset.typing;
        },k*AUTO_LETTER_MS*1.6));
        if(!todo.length)delete c.dataset.typing;
      }
    });
    c.querySelector('.dk-prev').addEventListener('click',e=>{e.stopPropagation();step(-1);});
    c.querySelector('.dk-next').addEventListener('click',e=>{e.stopPropagation();step(1);});
    c.addEventListener('mouseenter',()=>{if(order[0]===i){show(i);document.querySelector(`.cell.portal[data-go="${i}"]`)?.classList.add('tipon');}}); // 강조(focusArt)는 마우스 추적기가 담당. 맞힌 단어면 그 도는 칸 말풍선도 같이
    c.addEventListener('mouseleave',()=>document.querySelectorAll('.cell.portal.tipon').forEach(e=>e.classList.remove('tipon')));
    c.addEventListener('click',()=>{
      if(dragMoved)return;
      if(order[0]!==i){go(i);return;}
      const el=wordCells(i).find(el=>!el.querySelector('.ch').textContent)||wordCells(i)[0];
      if(el)setSel(el.dataset.key,i);
    });
    wrap.appendChild(c);return c;
  });
  let order=projects.map((_,i)=>i);
  function layout(){order.forEach((i,pos)=>{const c=cards[i];c.dataset.pos=Math.min(pos,3);c.style.zIndex=10-pos;});}
  function go(i){if(order[0]===i)return;const k=order.indexOf(i);order=order.slice(k).concat(order.slice(0,k));layout();window.__deckFocus&&__deckFocus(i);} // 카드에 마우스가 있으면 강조도 새 앞 카드 프로젝트로
  /* 한 장씩 넘길 때: 옆으로 빠지지 않고, 맨 앞 카드가 왼쪽으로 빠졌다가 묶음 뒤로 쏙 들어감(다음).
     이전은 반대로 맨 뒤 카드가 왼쪽으로 빠져나와서 맨 앞에 내려앉음 */
  const POS=['rotate(-.8deg)','translate(5px,5px) rotate(1.3deg)','translate(-4px,9px) rotate(-2.1deg)']; // style.css의 data-pos 0~2와 같은 값
  const FLIP_MS=700;let flipping=false;
  function step(d){
    if(flipping)return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target=(order[0]+d+N)%N;
    if(reduce||!Element.prototype.animate){go(target);return;}
    flipping=true;
    if(d>0){
      const f=cards[order[0]];
      go(target);f.style.zIndex=20;
      f.classList.add('flipping');
      f.animate([{transform:POS[0],opacity:1},{transform:'translate(-62%,-4%) rotate(-7deg) scale(.97)',opacity:1,offset:.42},{transform:POS[2],opacity:1,offset:.85},{transform:POS[2],opacity:0}],{duration:FLIP_MS,easing:'cubic-bezier(.45,0,.25,1)'});
      setTimeout(()=>{f.style.zIndex='';f.classList.remove('flipping');layout();},FLIP_MS*.45);
    }else{
      const c=cards[target],old=cards[order[0]];
      old.classList.add('flipping'); // 들어오는 카드가 뒤에서 빠져나오는 동안 기존 앞 카드 내용은 그대로 보이게
      go(target);c.style.zIndex=0;
      setTimeout(()=>old.classList.remove('flipping'),FLIP_MS*.5);
      c.animate([{transform:POS[2],opacity:0},{opacity:1,offset:.2},{transform:'translate(-62%,-4%) rotate(-7deg) scale(.97)',offset:.5},{transform:POS[0],opacity:1}],{duration:FLIP_MS,easing:'cubic-bezier(.45,0,.25,1)'});
      setTimeout(()=>{c.style.zIndex='';layout();},FLIP_MS*.5);
    }
    setTimeout(()=>{flipping=false;},FLIP_MS);
  }
  function refresh(){
    projects.forEach((p,i)=>{
      const solved=projectSolved(i),c=cards[i];
      c.classList.toggle('solved',solved);
      c.classList.toggle('prev-solved',projectSolved((i-1+N)%N));c.classList.toggle('next-solved',projectSolved((i+1)%N)); // 화살표 도형도 그 단어를 맞히면 그 색으로
      c.querySelectorAll('.dk-boxes span').forEach((b,k)=>b.textContent=solved?p.word[k]:'');
      c.querySelector('.dk-open').textContent=solved?'다시 풀기':'문제 풀기';
    });
  }
  // 옆으로 끌어서 넘기기
  let sx=0,dx=0,dragging=false,dragMoved=false;
  wrap.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;dragging=true;dragMoved=false;sx=e.clientX;dx=0;});
  addEventListener('pointermove',e=>{
    if(!dragging)return;dx=e.clientX-sx;if(Math.abs(dx)>6)dragMoved=true;
    const f=cards[order[0]];f.style.transition='none';f.style.transform=`translateX(${dx}px) rotate(${dx/40}deg)`;
  });
  addEventListener('pointerup',()=>{
    if(!dragging)return;dragging=false;
    const f=cards[order[0]];f.style.transition='';f.style.transform='';
    if(Math.abs(dx)>70)step(dx<0?1:-1);
    setTimeout(()=>{dragMoved=false;},0);
  });
  window.deckGo=go;window.deckRefresh=refresh;
  refresh();layout();
})();
/* 배경 장식(피그마 Union 애셋, HTML에 이미 심어둔 img). 마우스를 올려도 이미지가 나오진 않고
   해당 단어가 십자말풀이에서 어디인지만 참고로 하이라이트해줌(이미지 자체는 updateGrayReveal이 관리) */
/* 강조(focusArt)는 마우스가 "실제로 무엇 위에 있는지"를 매번 직접 확인해서 정함:
   - 그림(.gray)은 투명한 여백까지 포함한 네모 상자라, 상자 기준으로 판단하면 그림 밖으로 나가도 강조가 계속 남았음
     → 그림과 같은 모양의 벡터 실루엣(art-shapes.js) 안에 있을 때만 그 그림으로 인정
   - 십자말풀이 칸 사이 빈 곳, 장식 상자, 빈 배경 위에서는 강조를 바로 해제
   - 카드는 맨 앞 카드 위에 있을 때만 그 프로젝트 */
(()=>{
  const stage=document.getElementById('cwStage'),grays=[...document.querySelectorAll('.gray')];
  // 그림마다 같은 모양의 벡터 실루엣(art-shapes.js, assets/cw/unionN.svg와 동일)을 Path2D로 만들어 둠
  const hitCtx=document.createElement('canvas').getContext('2d');
  const shapes=grays.map(g=>{
    const base=g.querySelector('.g-base'),m=base&&(base.getAttribute('src')||'').match(/(union\d+)\.svg/);
    const sh=m&&window.ART_SHAPES&&ART_SHAPES[m[1]];
    return sh?{base,w:sh.w,h:sh.h,rule:sh.rule,path:new Path2D(sh.d)}:null;
  });
  // 실루엣 벡터의 실제 크기·위치(.g-base 자리, 그림이 컬러로 바뀌어 투명해져도 자리는 그대로)에 마우스 좌표를 맞춰서 모양 안인지 판단
  function onArt(g,cx,cy){
    const sh=shapes[grays.indexOf(g)];
    if(!sh)return true; // 실루엣 정보가 없으면 예전처럼 상자 기준
    const r=sh.base.getBoundingClientRect();
    if(cx<r.left||cx>=r.right||cy<r.top||cy>=r.bottom)return false;
    return hitCtx.isPointInPath(sh.path,(cx-r.left)/r.width*sh.w,(cy-r.top)/r.height*sh.h,sh.rule);
  }
  let cur=null,curGray=-1,overDeck=false;
  // 카드를 넘겨 앞 카드가 바뀌었을 때(화살표·드래그·키): 마우스가 카드 위에 있으면 강조도 바로 새 앞 카드로 옮김
  window.__deckFocus=i=>{if(overDeck&&i!==cur){cur=i;focusArt(i);}};
  function track(e){
    let i=null,gk=-1;
    overDeck=!!document.elementsFromPoint(e.clientX,e.clientY).some(el=>el.closest&&el.closest('.deck'));
    for(const el of document.elementsFromPoint(e.clientX,e.clientY)){
      if(!stage.contains(el))continue;
      const cell=el.closest('.cell');
      if(cell){i=+cell.dataset.p.split(',').filter(Boolean)[0];break;}
      const card=el.closest('.dk-card');
      if(card){i=card.dataset.pos==='0'?+card.dataset.i:null;break;}
      if(el.closest('.cw-toolbar,.deck'))break;
      const g=el.closest('.gray');
      if(g&&onArt(g,e.clientX,e.clientY)){gk=grays.indexOf(g);i=grayMap[gk];break;}
    }
    grays.forEach((g,k)=>g.style.cursor=k===gk?'pointer':'default');
    if(gk!==curGray){curGray=gk;if(gk>=0)show(i);} // 그림 위에 새로 올라왔을 때만 그 단어를 칸에서 짚어줌
    if(i!==cur){cur=i;focusArt(i);syncDeck(i);}
  }
  /* 칸·그림 위에 올린 단어에 맞춰 오른쪽 카드도 그 프로젝트 카드로 넘김(카드 위에선 그대로).
     칸을 쓸고 지나갈 때 카드가 마구 바뀌지 않도록 잠깐(120ms) 머물렀을 때만 넘김 */
  let deckT=0;
  function syncDeck(i){
    clearTimeout(deckT);
    if(i==null||overDeck||!window.deckGo)return;
    deckT=setTimeout(()=>deckGo(i),120);
  }
  stage.addEventListener('mousemove',track);
  stage.addEventListener('mouseleave',()=>{clearTimeout(deckT);cur=null;curGray=-1;overDeck=false;focusArt(null);});
})();
/* 회색 블록에 이미지 채우기 */
document.querySelectorAll('.gray').forEach((g,k)=>{
  const p=projects[grayMap[k]];
  if(p&&p.img){g.innerHTML=`<img src="${p.img}" alt="${p.t}">`;}
});
/* 장식용 컬러 사각 박스 (피그마 node 97:341 실측 좌표/색상 그대로, 십자말풀이 한 칸과 같은 60px 크기) */
const decoBoxes=[]; // 피그마 225:2641에는 장식 색 상자가 없어서 뺌
/* 십자말풀이 칸 격자선(가로 309+60n, 세로 161+60n)에 딱 맞도록 위치를 스냅 — 피그마 원본 좌표가
   몇 px씩 어긋나 있어서(예: 민트 546→549, 파랑 751→761) 칸 선과 박스 모서리가 정확히 이어지게 함 */
const GRID_X0=309,GRID_Y0=161,GRID_C=60;
decoBoxes.forEach(d=>{
  d.x=GRID_X0+Math.round((d.x-GRID_X0)/GRID_C)*GRID_C;
  d.y=GRID_Y0+Math.round((d.y-GRID_Y0)/GRID_C)*GRID_C;
});
decoBoxes.forEach(d=>{
  const b=document.createElement('div');
  b.className='deco-box'+(d.x<=GRID_X0?' edge-l':d.x>=1569?' edge-r':''); // 양 끝 색 상자 묶음은 여백 맞춤 때 바깥으로 벌어짐
  b.style.left=d.x+'px';b.style.top=d.y+'px';b.style.background=d.c;
  document.getElementById('cwStage').appendChild(b);
});

/* ===== 십자말풀이 등장 애니메이션 =====
   호출 시점은 아래 스포트라이트 IIFE 안(GSAP 스크롤 진행도 또는 reduced-motion 분기)에서 결정하고,
   실제 칸이 하나씩 나타나는 연출 자체는 그대로 둠 */
/* 전환 때 히어로 빛 3개가 각각 들어갈 칸(열,행)과 그 빛 색 — 순서는 히어로 BLOBS와 같음(초록 별, 핑크 육각형, 파랑 네잎).
   그 자리 그대로 곧장 내려가면 심심해서, 떨어지면서 서로 자리를 바꿔 엇갈려 들어가게 함:
   핑크 육각형 → 왼쪽(KOOKSOONDANG), 파랑 네잎 → 오른쪽(ZIPMATE), 초록 별 → 가운데(HAEIT) */
const DIVE_ORIGINS=[{k:'9,4',c:'#83FF9E'},{k:'4,8',c:'#FFA5AF'},{k:'16,12',c:'#4B84E1'}]; // 빛이 들어가는 칸 = 단어가 겹치는 칸: 초록 별 → HAEIT×CORRELATION, 핑크 육각형 → SOSOBOKDAM×SAMTOFESTIVAL, 파랑 네잎 → KOOKSOONDANG×ZIPMATE
let started=false;
function reveal(){
  // 뒤 배경 그림(실루엣)은 처음엔 숨겨 두었다가, 빛이 칸에 닿아 칸이 켜지기 시작하면 함께 서서히 나타남
  setTimeout(()=>document.getElementById('cwStage').classList.add('bg-in'),350);
  // 칸마다 퍼즐 전체 대각선 무지개 색(왼쪽 위 연분홍 → 오른쪽 아래 하늘색)을 미리 넣어둠 → 등장 반짝임에 사용
  if(!window.__rbRange){let mx=0,my=0;Object.keys(cells).forEach(k=>{const[x,y]=k.split(',').map(Number);mx=Math.max(mx,x);my=Math.max(my,y);});window.__rbRange=mx+my||1;}
  Object.keys(cells).forEach(k=>{const[x,y]=k.split(',').map(Number);cells[k].style.setProperty('--rb',rainbowAt((x+y)/window.__rbRange));});
  const lines=grid.querySelector('.gridlines'),decos=[...document.querySelectorAll('.deco-box')];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!Element.prototype.animate){ // 모션 줄이기: 예전처럼 제자리에서 하나씩
    if(lines)lines.style.opacity=1;decos.forEach(d=>d.classList.add('in'));
    all.forEach((c,i)=>setTimeout(()=>{c.classList.add('in','flash');setTimeout(()=>c.classList.remove('flash'),500);},i*45));
    setTimeout(()=>show(0),all.length*45+300);
    return;
  }
  /* 빛이 칸 속으로 들어가 번지기: 전환 때 빛 3개가 각각 들어간 칸(DIVE_ORIGINS)에서부터 시작해,
     가까운 칸부터 차례로 그 빛 색의 흐릿한 빛방울 → 선명한 네모 칸으로 켜짐(물결처럼 퍼져나감).
     장식 상자도 같은 방식으로 자기 색으로 켜짐. 격자선은 옅게 보이다가 다 켜지면 또렷해짐 */
  // 다시 재생될 때(초기화 버튼) 대비: 진행 중이던 모션을 멈추고 격자선·하이라이트를 처음 상태로
  if(lines){lines.style.transition='none';lines.style.opacity=.55;void lines.offsetWidth;lines.style.transition='';}
  [...all,...decos].forEach(el=>el.getAnimations().forEach(a=>a.cancel()));
  all.forEach(c=>c.classList.remove('on','flash','selcell'));wordGlow.classList.remove('show');glowIdx=null;
  document.querySelectorAll('.it.act').forEach(e=>e.classList.remove('act'));
  clearTimeout(window.__revealDone);
  const DROP_MS=1100,RIPPLE_MS=62; // 칸 하나 켜지는 시간 / 한 칸 멀어질 때마다 늦어지는 시간
  const org=DIVE_ORIGINS.map(o=>{const[x,y]=o.k.split(',').map(Number);return{x,y,c:o.c};});
  const nearest=(x,y)=>{let best=org[0],bd=1e9;org.forEach(o=>{const d=Math.hypot(x-o.x,y-o.y);if(d<bd){bd=d;best=o;}});return{o:best,d:bd};};
  const items=[
    ...all.map(el=>{const[x,y]=el.dataset.key.split(',').map(Number);return{el,cell:true,x,y};}),
    // 장식 상자는 캔버스 좌표 → 칸 단위로 바꿔서 같은 거리 기준으로
    ...decos.map(el=>({el,cell:false,x:(el.offsetLeft-GRID_X0)/GRID_C,y:(el.offsetTop-GRID_Y0)/GRID_C})),
  ];
  let last=0;
  items.forEach(it=>{
    const el=it.el,n=nearest(it.x,it.y);
    const delay=n.d*RIPPLE_MS+(it.cell?0:180)+Math.random()*50;
    // 칸은 마우스를 올렸을 때 나오는 연한 대각선 무지개 색(연분홍 → 연노랑·연두 → 연하늘)으로 켜짐
    const lc=it.cell?(el.style.getPropertyValue('--rb')||n.o.c):getComputedStyle(el).backgroundColor;
    last=Math.max(last,delay);
    if(it.cell)el.classList.add('dropping');
    el.classList.add('in');
    el.animate([
      {transform:'scale(.35)',opacity:0,borderRadius:'50%',filter:'blur(10px)',backgroundColor:lc},
      {transform:'scale(1.12)',opacity:1,borderRadius:'38%',filter:'blur(3px)',backgroundColor:lc,offset:.45},
      {transform:'scale(1)',opacity:1,borderRadius:'0%',filter:'blur(0px)'}
    ],{duration:DROP_MS,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
    if(it.cell)setTimeout(()=>{el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),600);},delay+DROP_MS*.7);
  });
  window.__revealDone=setTimeout(()=>{
    if(lines)lines.style.opacity=1;
    all.forEach(c=>c.classList.remove('dropping'));
    show(0);
  },last+DROP_MS*.9);
}
/* 십자말풀이는 빛 낙하가 끝났고(cwReady) + 십자말풀이 화면이 30% 이상 보일 때(cwVisible) 떨어지기 시작 —
   예전엔 화면 밖에서 미리 시작돼 도착했을 땐 이미 끝나 있거나 후두둑 끝부분만 보였음 */
let cwReady=false,cwVisible=false;
function maybeReveal(){if(cwReady&&cwVisible&&!started){started=true;reveal();}}
new IntersectionObserver(es=>{cwVisible=es[0].intersectionRatio>=.3;maybeReveal();},{threshold:[0,.3,.6,1]}).observe(document.getElementById('cw'));
/* ===== 스포트라이트: 가운데서 하나 켜지면 드래그해서 제자리에 놓기 → 고정되며 회색으로 → 다음 것 등장 → 셋 다 놓이면 전부 컬러로,
   그 뒤 스크롤하면 셋이 한 리본으로 모여 S자 곡선을 그리며 십자말풀이 그리드 쪽으로 흡수되는 전환까지 이어짐.
   성능: devicePixelRatio는 항상 1로 고정하고 캔버스 실제 해상도도 화면의 1/4로만 그려 CSS로 확대함(어차피
   전부 흐릿한 빛이라 확대해도 티가 안 남). 스크롤 중 매 프레임 blur 필터 값을 바꾸는 대신, 오래 지속되는
   구간(정지 상태·낙하 리본)은 blur 필터를 아예 안 쓰고 그라데이션 자체의 부드러운 감쇠로만 흐릿함을 표현함 ===== */
(()=>{
  const hero=document.getElementById('hero'),heroWrap=document.getElementById('heroWrap'),cv=document.getElementById('hc'),ctx=cv.getContext('2d');
  const bgLayer=document.getElementById('bgLayer');
  const grainEl=hero.querySelector('.grain'); // 배경은 여기 한 곳에서만 바꿈(섹션 경계에 색이 반으로 나뉘는 문제 방지)
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
  function size(){
    w=hero.clientWidth;h=hero.clientHeight;
    cv.width=w;cv.height=h; // devicePixelRatio 고정 1, 원래 해상도 그대로(저해상도 확대 안 함)
    const hr=hero.getBoundingClientRect();
    // 슬롯(글자 자리)은 실제 텍스트가 CSS로 놓인 위치를 그대로 읽어와 계산 — 화면 크기가 달라져도 항상 정확히 맞음
    // 원의 밝은 중심(하이라이트)이 빛줄기 방향(b.dir)으로 치우쳐 있어서, 원 자체를 글자 중심에 두면
    // 눈으로 보기엔 빛이 그 방향으로 밀려 보임 → 치우친 만큼 반대로 옮겨 "보이는 빛의 중심"이 글자 중심에 오게 함
    const scH=Math.max(w,h)*.62;
    HOMES=texts.map((el,i)=>{
      const tr=el.getBoundingClientRect(),b=BLOBS[i],r=b.rr*scH,a=b.dir*Math.PI/180,k=b.hiMag*r*.42;
      return {x:(tr.left+tr.right)/2-hr.left-Math.cos(a)*k,y:(tr.top+tr.bottom)/2-hr.top-Math.sin(a)*k};
    });
    /* 빛 세 개(=글자 자리)가 이루는 덩어리 전체를 화면 한가운데로: 모양별 실제 크기로 바깥 경계를 구해
       가로·세로 여백이 같아지도록 글자와 빛을 함께 옮김(--hx/--hy). 이미 옮겨둔 만큼은 빼고 다시 계산 */
    HOMES=HOMES.map(p=>({x:p.x-heroOff.x,y:p.y-heroOff.y}));
    const EXT={star:.9,clover:.82,hex:.86};
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    HOMES.forEach((p,i)=>{const e=BLOBS[i].rr*scH*EXT[BLOBS[i].shape];x0=Math.min(x0,p.x-e);x1=Math.max(x1,p.x+e);y0=Math.min(y0,p.y-e);y1=Math.max(y1,p.y+e);});
    // 가로: 가운데 빛(파랑 네잎)의 보이는 중심을 화면 가운데에 맞춤 / 세로: 덩어리 가운데보다 화면 높이의 4%만큼 위로
    const mid=BLOBS.findIndex(b=>b.shape==='clover');
    heroOff={x:Math.round(w/2-(mid>=0?HOMES[mid].x:(x0+x1)/2)),y:Math.round(h/2-(y0+y1)/2-h*.04)};
    HOMES=HOMES.map(p=>({x:p.x+heroOff.x,y:p.y+heroOff.y}));
    hero.style.setProperty('--hx',heroOff.x+'px');hero.style.setProperty('--hy',heroOff.y+'px');
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

  /* 히어로 → 십자말풀이 전환(피그마 node 161:346 흐름). 스크롤 없이 Scenes(맨 아래)가 pA·pB를 시간에 따라 0→1로 재생:
     ① pA: 글자가 사라지고 배경이 십자말풀이 배경색으로 밝아지는 동안 빛 3개가 모양 그대로 작아지며 가라앉음
     ② pB: 십자말풀이 화면이 서서히 나타나고, 빛이 각자 맡은 칸(DIVE_ORIGINS)으로 좌우로 흔들리며 들어감 →
        들어간 칸부터 켜지며 번짐(reveal). 이전 버튼으로 돌아가면 그대로 역재생 */
  const cwSec=document.getElementById('cw');
  const dive=createDive();
  const clamp01=v=>Math.max(0,Math.min(1,v));
  let pA=0,pB=0;
  function update(){
    transProgress=pA+pB; // 0보다 크면 히어로 캔버스는 빛을 안 그림(전환 캔버스가 같은 모양으로 이어받음)
    const op=Math.max(0,1-pA/.35);             // 히어로 글자 fade-out
    texts.forEach(t=>t.style.opacity=op);hh.style.opacity=op;
    const bp=smoothstep(clamp01((pA-.08)/.92)); // 배경 #080809 → #212124(은은한 어두움)
    const rC=Math.round(8+(33-8)*bp),bC=Math.round(9+(36-9)*bp);
    bgLayer.style.background=`rgb(${rC},${rC},${bC})`;
    document.body.style.background=bgLayer.style.background;
    if(grainEl)grainEl.style.opacity=(.12*(1-bp)).toFixed(3);
    cwSec.style.opacity=smoothstep(clamp01(pB/.55)).toFixed(3); // 십자말풀이 화면은 제자리에서 서서히 나타남(아래에서 올라오지 않음)
    const lines=grid.querySelector('.gridlines');
    if(lines&&!started)lines.style.opacity=(.55*smoothstep(clamp01((pB-.25)/.6))).toFixed(3);
    dive.render(pA,pB);
    if(pB>=.965&&!started){started=true;reveal();} // 빛이 칸에 닿는 순간 칸이 켜지기 시작
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
  /* 전환용 빛 캔버스: 화면에 고정(position:fixed)된 채 히어로 빛과 똑같은 모양·색으로 그림.
     (히어로는 핀이 풀리면 위로 스크롤돼 사라지므로, 빛은 히어로와 따로 떠 있어야 칸까지 따라갈 수 있음)
     절반 해상도 검정 바탕에 lighten으로 겹쳐 그린 뒤 밝기를 투명도로 바꿔서 → 밝은 배경 위에서도 빛처럼 보임 */
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
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    // 좌우 흔들림: 폭(화면 너비 비율), 전체 전환 동안 왕복 횟수, 빛마다 시작 박자·방향(서로 엇갈리게), 최대 기울기(rad)
    const SWAY_AMP=.055,SWAY_CYC=1.5,SWAY_PH=[0,.35,.7],SWAY_K=[1,.8,1.15],SWAY_ROT=.14;
    const SPIN_T=[1.25,-1,1.5]; // 빛마다 떨어지는 동안 도는 바퀴 수(음수는 반대 방향)
    const lerp=(a,b,t)=>a+(b-a)*t;
    function render(pA,pB){
      const vis=(pA>.0005||pB>0)&&pB<.9995;
      if(!vis){
        if(shown){
          /* 히어로로 되돌아온 끝(pA·pB 모두 0): 여기서 바로 숨기면 히어로 캔버스가 빛을 다시 그리기 전
             한두 프레임(첫 그리기가 무거워 100ms 안팎) 동안 빛이 없는 빈 화면이 보여 '깜빡'임.
             → 히어로 캔버스가 실제로 한 번 그린 뒤(frame()에서 hideAfterHeroDraw 호출) 숨김 */
          if(pB<=0)pendingHide=true;else{cvD.style.opacity=0;shown=false;pendingHide=false;}
        }
        return;
      }
      pendingHide=false;
      if(!sprites)build();
      const W=innerWidth,H=innerHeight;
      if(cvD.width!==W||cvD.height!==H){cvD.width=W;cvD.height=H;off.width=Math.ceil(W*LS);off.height=Math.ceil(H*LS);}
      const sc=Math.max(w,h)*.62;
      /* 하나의 흐름 u(0→1)로: 처음엔 빛이 살짝 커지며 눈앞으로 다가왔다가(가까이) → 점점 작아지며 멀어지듯
         칸 쪽으로 떨어짐. 크기는 거리감이 나도록 비율(로그)로 줄이고, 떨어지는 길은 처음엔 천천히 → 점점 빠르게 */
      const u=Math.min(1,pA*.3+pB*.7);
      const near=u<.34?Math.sin(Math.PI*u/.34):0; // 다가오는 정도(0→1→0)
      const rcd=Math.max(0,Math.min(1,(u-.1)/.9)),er=rcd*rcd*(3-2*rcd); // 멀어지는 정도
      ox.setTransform(1,0,0,1,0,0);ox.globalCompositeOperation='source-over';ox.globalAlpha=1;
      ox.fillStyle='#000';ox.fillRect(0,0,off.width,off.height);
      ox.setTransform(LS,0,0,LS,0,0);ox.globalCompositeOperation='lighten';
      BLOBS.forEach((b,i)=>{
        const D0=b.rr*sc*2,hx=HOMES[i].x,hy=HOMES[i].y;
        const cell=cells[DIVE_ORIGINS[i].k],r=cell.getBoundingClientRect(),cs=r.width||60;
        const tx=r.left+cs/2,ty=r.top+cs/2;
        const Dn=D0*(1+.16*near);                        // 가까이 다가와 커진 크기
        const D=Dn*Math.pow((cs*.8)/Dn,Math.pow(er,1.5)); // 멀어질수록 비율로 작아짐(원근감). 처음엔 천천히, 칸에 가까워질수록 빠르게
        const ex=er,ey=Math.pow(er,1.6);     // 가로는 부드럽게, 세로는 떨어지듯 점점 빠르게
        let x=hx+(tx-hx)*ex,y=hy+(ty-hy)*ey-H*.04*near;  // 다가올 땐 살짝 떠오름
        const a=1-smoothstep(Math.max(0,Math.min(1,(u-.9)/.1)));
        if(a<=.01)return;
        // 떨어지는 동안 좌우로 살짝 흔들림(시작·끝은 0)
        const env=Math.pow(Math.sin(Math.PI*rcd),2),ph=rcd*Math.PI*2*SWAY_CYC-SWAY_PH[i];
        x+=Math.sin(ph)*W*SWAY_AMP*.7*env*SWAY_K[i];
        const rot=Math.cos(ph)*SWAY_ROT*env+SPIN_T[i]*Math.PI*2*Math.pow(er,1.3); // 흔들림 + 떨어지며 빙글빙글(처음엔 천천히, 칸에 가까워질수록 빨리 돎. 시작은 0이라 히어로 모양 그대로 이어짐)
        ox.globalAlpha=a;
        const sz=D*PAD;
        ox.save();ox.translate(x,y);ox.rotate(rot);
        ox.drawImage(sprites[i],-sz/2,-sz/2,sz,sz);
        ox.restore();
      });
      ox.globalAlpha=1;
      // 검정 바탕 → 투명(밝기를 알파로). 뒤의 배경색 전환·격자선이 그대로 비쳐 보임
      const img=ox.getImageData(0,0,off.width,off.height),d=img.data;
      for(let q=0;q<d.length;q+=4){
        const m=Math.max(d[q],d[q+1],d[q+2]);
        if(!m){d[q+3]=0;continue;}
        const k=255/m;d[q]*=k;d[q+1]*=k;d[q+2]*=k;d[q+3]=m;
      }
      ox.putImageData(img,0,0);
      dctx.clearRect(0,0,W,H);dctx.imageSmoothingQuality='high';
      dctx.drawImage(off,0,0,W,H);
      if(!shown){cvD.style.transition='none';cvD.style.opacity=1;shown=true;}
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
/* ===== 인트로: 스위치 → 로딩 → 메인 ===== */
(()=>{
  const intro=document.getElementById('intro'),sw=document.getElementById('sw'),pct=document.getElementById('pct'),bar=document.getElementById('bar');
  let busy=false;
  scrollTo({top:0,left:0,behavior:'instant'}); // behavior:'instant'로 scroll-behavior:smooth를 무시하고 즉시 이동(안 그러면 스르륵 스크롤되는 게 보임)
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  // 눈을 뜨면: 주제 한 줄('시선')을 먼저 보여준 뒤 → 스포트라이트가 하나씩 켜짐. 위쪽 내비게이션도 이때 나타남
  function finish(){
    intro.classList.add('done');
    window.Scenes&&Scenes.start();
    const cap=document.getElementById('hCap');
    if(cap){cap.classList.add('show');setTimeout(()=>cap.classList.remove('show'),3000);}
    setTimeout(()=>window.__lightSeqStart&&window.__lightSeqStart(),cap?2700:0);
  }
  // 인트로 눈: 어두운 눈(배경과 비슷한 색). 평소엔 눈동자가 가끔 반대쪽을 흘끗 보고, 가끔 깜빡임
  const E=EyeKit.make(sw),POS=EyeKit.POS,glowB=sw.querySelector('.sw-glow b');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  E.theme({open:'#303030',closed:'#303030',stroke:'#262626'},true);
  E.pupil('#0a0a0a');E.set(0);E.look(POS.left,0);
  E.onFrame=e=>{ // 켜진 뒤 눈동자에서 번지는 빛이 눈동자를 따라다님(꺼풀이 덮이면 함께 약해짐)
    const k=sw.offsetWidth/65,d=19.28*k;
    glowB.style.cssText=`left:${e.p[0]*k}px;top:${e.p[1]*k}px;width:${d}px;height:${d}px;opacity:${Math.max(0,1-e.s/.35)}`; // 꺼풀이 조금만 내려와도 빛이 가려지듯 바로 약해짐(빛 테두리만 떠 있는 검은 원이 안 보이게)
  };
  let on=false,hov=false,idleT=0;
  async function idle(){
    if(on||hov||reduce)return;
    const r=Math.random();
    if(r<.35){await E.to(2,150);if(!on)await E.to(0,220);}
    else{const x=E.p[0]<32?POS.right:POS.left;await E.look(x,900);}
    idleT=setTimeout(idle,1800+Math.random()*2600);
  }
  idleT=setTimeout(idle,1400);
  sw.addEventListener('mouseenter',()=>{if(on)return;hov=true;clearTimeout(idleT);E.pupil('#161616');});
  sw.addEventListener('mouseleave',()=>{if(on)return;hov=false;E.pupil('#0a0a0a');idleT=setTimeout(idle,900);});
  async function openEye(){
    if(reduce){finish();return;}
    intro.classList.add('opening');                 // 로딩 글자는 먼저 사라짐
    await E.to(2,230);await E.to(0,330);            // 한 번 깜빡
    await new Promise(r=>setTimeout(r,160));
    await E.look(POS.center,750);                   // 눈동자가 가운데를 봄
    // 눈 윤곽·속눈썹이 먼저 스르륵 사라지고, 가운데 눈동자 빛만 잠깐 남았다가 옅어지면서 → 그 자리에서 첫 스포트라이트가 이어짐
    sw.classList.add('fadeout');await new Promise(r=>setTimeout(r,700));
    finish();
  }
  sw.addEventListener('click',()=>{
    if(busy)return;busy=true;on=true;clearTimeout(idleT);
    if(E.sTo!==0)E.to(0,200);
    E.pupil('#F5F5F5');
    E.look(E.p[0]<32?POS.right:POS.left,900);       // 켜지면 눈동자가 반대쪽으로 굴러감
    sw.classList.add('on');intro.classList.add('go');
    const t0=performance.now(),D=2600;
    (function step(now){
      const p=Math.min(1,(now-t0)/D),e=1-Math.pow(1-p,2);
      const n=Math.round(e*100);pct.textContent='LOADING '+n+'%';bar.style.width=n+'%';
      if(p<1)return requestAnimationFrame(step);
      setTimeout(openEye,350);
    })(t0);
  });
})();
/* ===== 03 REVEAL: 눌러서 빛 터뜨리기 =====
   화면을 누르면 그 자리에서 처음 LOOK의 세 빛(별 · 네잎 · 육각형 차례로) 모양이 도트로 '팡' 터짐:
   작은 알맹이 → 모양 테두리가 바깥으로 퍼지며(가운데 밝은 색 → 바깥 진한 색) → 점선처럼 흩어지며 사라짐.
   도트 한 칸 크기는 늘 같음(배경 격자 한 칸과 같은 크기).

   누르고 끌면 칸이 파스텔 무지개 색으로 칠해지는데, 숨은 글자 'Contact / Me?' 칸만 남고 나머지는 잠시 뒤 사라짐 → 글자가 드러나면 짧은 한 줄이 나타남 */
(()=>{
  const end=document.getElementById('end'),gridEl=document.getElementById('pxGrid');
  const btnAgain=document.getElementById('pxClear'),cap=document.getElementById('eyeCap'),hint=end.querySelector('.px-hint');
  hint.textContent='격자를 끌어서 칠해 보세요';btnAgain.hidden=true;
  const LIGHTS=[ // 첫 화면 스포트라이트 세 빛의 색(초록 별 · 파랑 클로버 · 분홍 육각형): 가운데(밝음) → 바깥(진함)
    {shape:'star',  c:['#EFFFB0','#B7FEC6','#83FF9E','#37B4BB']},
    {shape:'clover',c:['#D9F1EB','#9CC2F2','#4B84E1','#2D77ED']},
    {shape:'hex',   c:['#FFF6C3','#FFA5AF','#FF85B0','#F46171']},
  ];
  const inShape={
    star:(u,v)=>Math.pow(Math.abs(u),2/3)+Math.pow(Math.abs(v),2/3),
    hex:(u,v)=>{const a=Math.abs(u),b=Math.abs(v);return Math.max(a/.866,a*.5+b);},
    clover:(u,v)=>Math.min(...[[0,-.5],[.5,0],[0,.5],[-.5,0]].map(([p,q])=>Math.hypot(u-p,v-q)/.52)),
  };
  const cv=document.createElement('canvas');cv.className='px-fx';cv.setAttribute('aria-hidden','true');end.insertBefore(cv,gridEl.nextSibling);
  const ctx=cv.getContext('2d');
  // 칠하기 층: 드래그한 칸을 격자 칸 단위로 칠함(배경 문장 위, 격자선 아래)
  const pv=document.createElement('canvas');pv.className='px-paint';pv.setAttribute('aria-hidden','true');end.insertBefore(pv,gridEl);
  const pctx=pv.getContext('2d'),painted=new Map(),temp=new Map(),PAINT='#e0e0dd'; // painted: 칸 → 칠한 색 [r,g,b], temp: 칸 → {t,col}
  // 붓 색: 누를 때마다 다음 색(십자말풀이 꽃 색). 누르지 않고 지나가면 연한 회색 흔적
  const BRUSH=FLOWER_COLORS.map(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))),TRAIL=[62,62,66]; // 다크 배경 위 지나간 칸: 배경보다 한 톤 밝은 회색
  let brush=BRUSH[0],brushIdx=0,timers=[];
  const later=(fn,ms)=>{const id=setTimeout(fn,ms);timers.push(id);return id;};
  // 숨은 글자(격자 32×18칸): 칠하면 이 칸들만 남고, 나머지 칠한 칸은 잠시 뒤 사라짐.
  // 'Contact / Me?' 두 줄 — 위로 갈수록 한 칸씩 오른쪽으로 밀어 기울임꼴처럼
  // 숨은 그림: 직접 그린 픽셀 자화상(21×17칸, 목 맨 아래 한 줄은 잘라 위에 여백) — 화면 아래 끝에 딱 붙어서 올라옴
  const PAT=['.......########.......', '......###########...#.', '.....#############.#.#', '..#..####.#..#..#.#..#', '.#..####...........#..', '..#####..##.....##.#..', '.######............#..', '.#######..##....##.#..', '.####...#..#.###.#.##.', '.####.#.#....#.#...#..', '....#....####...###.#.', '.....##.............#.', '.......#.....##.....#.', '........##........##..', '........#.########....', '......###.....##......', '....##..##....#.#.....', '...##.....#..##..##...', '..#........##......#..', '..#................#..']; // 몸(어깨·팔) 아래 3줄 추가 — 바닥에 콕 박혀 보이지 않게(사용자 도트 시안)
  // 숨쉬기 두 번째 장면(피그마에서 그린 들썩이는 모습): 머리·몸이 한 칸 내려오고 옆머리가 살짝 퍼짐. 완성 뒤 PAT ↔ PAT_B를 번갈아 보여 줌
  const PAT_B=['......................', '.......########.......', '......###########...#.', '.....#############.#.#', '#....####.#..#..#.#...', '.#..####...........#..', '..#####..##.....##.#..', '.######............#..', '.#######..##....##.#..', '.####...#..#.###.#.##.', '.####.#.#....#.#...#..', '....#....####...###.#.', '.....##.............#.', '.......#.....##.....#.', '........##........##..', '.....####.########....', '....#...##....#..#....', '...#......#..##...#...', '..#........##......#..', '..#................#..'];
  // 눈 깜빡임 장면: 기본 모습에서 눈(7~8번째 줄)만 감긴 모양. 숨쉬는 동안 가끔 끼어듦
  const PAT_K=['.......########.......', '......###########...#.', '.....#############.#.#', '..#..####.#..#..#.#..#', '.#..####...........#..', '..#####..##.....##.#..', '.######............#..', '.#######...........#..', '.####...#.##.#####.##.', '.####.#.#....#.#...#..', '....#....####...###.#.', '.....##.............#.', '.......#.....##.....#.', '........##........##..', '........#.########....', '......###.....##......', '....##..##....#.#.....', '...##.....#..##..##...', '..#........##......#..', '..#................#..'];
  let patSetK=new Set(),patSetB=new Set(),breathT=0,breathTimer=0; // 숨쉬기(완성 후 두 장면 번갈아)
  let patX=0,patY=0,patSet=new Set(),revealDone=false,tabX=0,tabY=0;
  const TW=9; // (연락처 표는 우선 뺐음 — 자화상 위치는 표가 있던 때 그대로 유지)
  let C=40,P=10,ox=0,oy=0,W=0,H=0,dpr=1,cols=0,maxRows=0,bursts=[],parts=[],stack=[],running=false,count=0,kind=0;
  function layout(){
    W=end.clientWidth;H=end.clientHeight;dpr=Math.min(2,devicePixelRatio||1);
    cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
    pv.width=W*dpr;pv.height=H*dpr;pv.style.width=W+'px';pv.style.height=H+'px';
    C=Math.max(12,60*CW_K*Math.min(W/1920,H/1080));P=C; // 격자 한 칸 = 십자말풀이 칸과 같은 크기(1920 기준 60px을 같은 비율로 줄임). 도트 한 칸 = 격자 한 칸
    // 격자 위치 = 십자말풀이 칸 격자와 같은 자리(두 섹션 모두 한 화면 크기라, 십자말풀이 칸 원점을 칸 크기로 나눈 나머지만큼 밀어 줌)
    let fx=0,fy=H;
    const cwG=document.getElementById('grid'),cwS=document.getElementById('cw');
    if(cwG&&cwS){const a=cwG.getBoundingClientRect(),b=cwS.getBoundingClientRect();if(a.width||a.height){fx=a.left-b.left;fy=a.top-b.top;}}
    const md=v=>((v%C)+C)%C;
    ox=md(fx)-C;oy=md(fy)-C;
    const gr=Math.floor((H-C*.5-oy)/C)+1; // 절반 이상 보이는 마지막 줄까지 = 자화상이 놓일 바닥 줄
    gridEl.innerHTML='';gridEl.style.setProperty('--c',C+'px');gridEl.style.setProperty('--ox',ox+'px');gridEl.style.setProperty('--oy',oy+'px');
    cols=Math.ceil((W-ox)/P)+1;maxRows=Math.floor(H*.3/P); // 쌓이는 층은 화면 높이의 30%까지
    const old=stack;stack=Array.from({length:cols},(_,i)=>old[i]||[]);
    // 그림을 화면 가운데에 맞춰 놓음(칠한 칸은 그림 기준 좌표로 기억해서 화면 크기가 바뀌어도 유지)
    // 자화상 + 한 칸 띄우고 연락처 표(TW칸)를 한 덩어리로 가운데 정렬, 자화상은 맨 아래 줄에 붙임
    const c0=Math.ceil(-ox/C-.001),vc=Math.floor((W-(ox+c0*C))/C),pw=PAT[0].length,block=pw+2+TW;
    patX=c0; /* 자화상 자리(그림 왼쪽 첫 줄은 숨쉬기용 빈 줄) */patY=gr-PAT.length; // 자화상 맨 아래 줄 = 화면 바닥 줄
    tabX=vc>=block?patX+pw+2:c0+vc-TW;tabY=Math.max(Math.ceil(-oy/C),patY+5);
    Object.assign(hint.style,{left:'50%',top:'calc(3vh + 58px)',bottom:'auto',transform:'translateX(-50%)'}); // 안내는 가운데 위쪽
    patSet=new Set();PAT.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='#')patSet.add(x+','+y);}));
    patSetK=new Set();PAT_K.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='#')patSetK.add(x+','+y);}));
    patSetB=new Set();PAT_B.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='#')patSetB.add(x+','+y);}));
    placeLetter();kick();paintAll();
  }
  /* ===== 편지 모양 연락 폼(사용자 도트 시안): 자화상 오른쪽 끝 머리카락(그림 x=21)에서 2칸 띄우고, 머리카락 끝 줄보다 한 칸 아래에서부터
     격자 칸 단위로 그림. 14칸 × 15줄. 테두리 칸 + 입력 칸(이름·연락처·이메일·메시지) + 보내기 칸. 그림이 완성되면 나타남 */
  // 편지 모양 두 장면(사용자 도트 시안): A = 기본, B = 살짝 기울어진 모양. 완성 후 둘을 번갈아 보여 흔들림
  const LT_A=['############..','.#........###.','..#.......####','..#.###.##...#','..#..........#','..#.########.#','..#..........#','..#.#######..#','..#..........#','..#.########.#','..#.#######..#','..#.###......#','.#.......##.#.','.#..........#.','############..'];
  const LT_B=['############..','.#........##..','.#..........#.','.#.###.##...#.','.#..........#.','.#.########.#.','.#..........#.','.#.#######..#.','.#..........#.','.#.########.#.','.#.#######..#.','.#.###......#.','.#......##..#.','#..........#..','############..'];
  const LT_FIELDS=[ // 이름표, name, 칸들 [줄, 시작, 끝] — A 장면 기준(B에선 한 칸 왼쪽)
    {k:'이름',n:'name',cells:[[3,4,6]]},
    {k:'연락처',n:'phone',cells:[[5,4,11]]},
    {k:'이메일',n:'email',cells:[[7,4,10]]},
    {k:'메시지',n:'message',cells:[[9,4,11],[10,4,10],[11,4,6]]},
  ];
  const LT_SEND=[12,9,10];
  const letter=document.createElement('form');letter.className='ct-letter';letter.id='ctLetter';letter.noValidate=true;letter.setAttribute('aria-label','메일 보내기');
  const ltCells=new Map(); // 'r,c'(A 장면 기준) → 그 칸을 이루는 요소들(칠하면서 지나가면 드러남)
  const ltAdd=(k,el)=>{if(!ltCells.has(k))ltCells.set(k,[]);ltCells.get(k).push(el);};
  let LX=0,LY=0; // 편지 왼쪽 위 칸의 격자 좌표(placeLetter가 정함)
  {
    const cellDiv=(r,c0,c1,cls)=>{const d=document.createElement('i');d.className=cls;d.style.gridArea=`${r+1}/${c0+1}/${r+2}/${c1+2}`;d.style.setProperty('--d',(r+c0)*28+'ms');return d;};
    const inField=(r,c,shift)=>LT_FIELDS.some(f=>f.cells.some(([R,a,b])=>R===r&&c>=a-shift&&c<=b-shift))||(r===LT_SEND[0]&&c>=LT_SEND[1]-shift&&c<=LT_SEND[2]-shift);
    LT_A.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='#'&&!inField(r,c,0)){const d=cellDiv(r,c,c,'lt-f lt-a');letter.appendChild(d);ltAdd(r+','+c,d);}}));
    // B 장면은 시안보다 한 칸 오른쪽에 놓음 → 가운데(양옆 세로 테두리·입력 칸)는 A와 같은 자리에 고정되고, 위아래(윗줄·아랫줄·접힌 모서리)만 흔들림
    LT_B.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='#'&&!inField(r,c,1))letter.appendChild(cellDiv(r,c+1,c+1,'lt-f lt-b'));}));
    LT_FIELDS.forEach(f=>{
      const mine=[];
      f.cells.forEach(([r,a,b])=>{for(let c=a;c<=b;c++){const d=cellDiv(r,c,c,'lt-f lt-in lt-sh');letter.appendChild(d);ltAdd(r+','+c,d);mine.push(r+','+c);}});
      const [r0,a0]=f.cells[0],r1=f.cells[f.cells.length-1][0],b0=Math.max(...f.cells.map(c=>c[2]));
      const lab=document.createElement('label');lab.className='lt-field lt-sh'+(f.cells.length>1?' lt-multi':'');mine.forEach(k=>ltAdd(k,lab));
      lab.style.gridArea=`${r0+1}/${a0+1}/${r1+2}/${b0+2}`;lab.style.setProperty('--d',(r0+a0)*28+80+'ms');
      if(f.cells.length>1){ // 계단 모양 칸에 맞춰 글 쓰는 영역도 계단 모양으로 자름
        const w=b0-a0+1,h=r1-r0+1,pts=[];let y=0;pts.push('0% 0%');
        f.cells.forEach(([r,a,b],i)=>{const x=(b-a0+1)/w*100,yy=(r-r0)/h*100,yn=(r-r0+1)/h*100;pts.push(`${x}% ${yy}%`,`${x}% ${yn}%`);});
        pts.push('0% 100%');lab.style.clipPath=`polygon(${pts.join(',')})`;
      }
      lab.innerHTML=`<span>${f.k}</span>`+(f.n==='message'?`<textarea name="message" rows="3"></textarea>`:`<input name="${f.n}" type="${f.n==='email'?'email':f.n==='phone'?'tel':'text'}" autocomplete="${f.n==='phone'?'tel':f.n}">`);
      letter.appendChild(lab);
    });
    const send=document.createElement('button');send.type='submit';send.className='lt-send lt-sh';for(let c=LT_SEND[1];c<=LT_SEND[2];c++)ltAdd(LT_SEND[0]+','+c,send);send.textContent='보내기';send.style.gridArea='13/10/14/12';send.style.setProperty('--d',(12+9)*28+'ms');
    letter.appendChild(send);
    const msg=document.createElement('p');msg.className='lt-msg lt-sh';msg.setAttribute('aria-live','polite');msg.style.gridArea='14/3/15/12';letter.appendChild(msg);
    end.appendChild(letter);
    const say=(t,c='')=>{msg.textContent=t;msg.className='lt-msg lt-sh '+c;};
    letter.addEventListener('keydown',e=>e.stopPropagation()); // 입력 중 방향키·PageDown이 장면 이동으로 먹히지 않게
    // 연락처: 숫자만 쳐도 010-1234-5678처럼 자동으로 '-'를 넣음(02 지역번호는 02-123-4567 / 02-1234-5678)
    const fPhone=letter.querySelector('[name=phone]'),fMail=letter.querySelector('[name=email]');
    fPhone.setAttribute('inputmode','numeric');fPhone.maxLength=13;fPhone.placeholder='010-0000-0000';
    const fmtPhone=v=>{const d=v.replace(/\D/g,'').slice(0,11);
      if(d.startsWith('02')){if(d.length<3)return d;if(d.length<6)return d.slice(0,2)+'-'+d.slice(2);if(d.length<10)return d.slice(0,2)+'-'+d.slice(2,5)+'-'+d.slice(5);return d.slice(0,2)+'-'+d.slice(2,6)+'-'+d.slice(6,10);}
      if(d.length<4)return d;if(d.length<8)return d.slice(0,3)+'-'+d.slice(3);if(d.length<11)return d.slice(0,3)+'-'+d.slice(3,6)+'-'+d.slice(6);return d.slice(0,3)+'-'+d.slice(3,7)+'-'+d.slice(7);};
    fPhone.addEventListener('input',()=>{fPhone.value=fmtPhone(fPhone.value);});
    // 이메일: '@'나 '.com' 같은 도메인이 빠지면 칸을 벗어날 때(또는 고칠 때) 바로 안내
    const mailOk=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const mailHint=v=>!v.includes('@')?"이메일에 '@'가 빠졌어요 (예: name@gmail.com)":!/@[^\s@]+\.[^\s@]{2,}$/.test(v)?"'@' 뒤에 '.com' 같은 주소를 적어 주세요 (예: name@gmail.com)":'';
    const tip=document.createElement('p');tip.className='lt-tip lt-sh';tip.setAttribute('aria-live','polite');tip.style.gridArea='9/5/10/14';letter.appendChild(tip); // 이메일 칸 바로 아래 줄
    const checkMail=(live)=>{const v=fMail.value.trim(),lab=fMail.closest('label');
      if(!v||mailOk(v)){lab.classList.remove('bad');tip.textContent='';return;}
      if(live&&!lab.classList.contains('bad'))return; // 쓰는 중엔 이미 틀렸다고 알려준 경우에만 다시 확인
      lab.classList.add('bad');tip.textContent=mailHint(v);};
    fMail.addEventListener('blur',()=>checkMail(false));
    fMail.addEventListener('input',()=>checkMail(true));
    letter.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
    letter.addEventListener('submit',async e=>{
      e.preventDefault();
      const v=n=>letter.querySelector(`[name=${n}]`).value.trim();
      const name=v('name'),phone=v('phone'),email=v('email'),text=v('message');
      const bad=[['name',!name],['email',!mailOk(email)],['message',!text]];
      bad.forEach(([n,b])=>letter.querySelector(`[name=${n}]`).closest('label').classList.toggle('bad',b));
      tip.textContent=email&&!mailOk(email)?mailHint(email):'';
      if(bad.some(([,b])=>b)){say('이름·이메일·메시지를 확인해 주세요','err');return;}
      const body=text+'\n\n— '+name+' ('+email+(phone?' / '+phone:'')+')';
      if(!window.CONTACT_ENDPOINT_URL){
        location.href=`mailto:jodabin9098@gmail.com?subject=${encodeURIComponent('[포트폴리오] '+name+'님의 메시지')}&body=${encodeURIComponent(body)}`;
        say('메일 앱에서 보내기를 눌러 주세요');return;
      }
      send.disabled=true;say('보내는 중…');
      try{const r=await fetch(window.CONTACT_ENDPOINT_URL,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({name,phone,email,message:text})});
        if(!r.ok)throw 0;letter.reset();say('잘 보내졌어요. 곧 답장 드릴게요!','ok');}
      catch(err){say('보내지 못했어요. 잠시 뒤 다시 시도해 주세요','err');}
      send.disabled=false;
    });
  }
  function placeLetter(){
    const LW=14,tipX=21; // 자화상 오른쪽 끝 머리카락 칸(그림 기준 x=21, y=2)
    let avail=Math.floor((W-(ox+patX*C))/C);                   // 자화상 왼쪽부터 화면 안에 온전히 보이는 칸 수
    if(avail-(tipX+1)-LW<1){patX-=1;avail+=1;}                   // 화면이 좁으면(16:9 등) 자화상 맨 왼쪽 빈 줄을 화면 밖으로 한 칸 밀어 자리를 만듦
    const gap=Math.max(1,Math.min(2,avail-(tipX+1)-LW));        // 기본 2칸, 화면이 좁으면 1칸까지 줄임
    const gx=patX+tipX+1+gap,gy=patY+3; // 머리카락 끝 줄보다 한 칸 아래부터
    LX=gx;LY=gy;
    Object.assign(letter.style,{left:(ox+gx*C)+'px',top:(oy+gy*C)+'px'});
    letter.style.setProperty('--c',C+'px');
  }
  // 그림을 칠하며 지나간 칸이 편지 칸이면 그 칸도 드러남(완성되면 나머지가 전부 나타남)
  function revealLetterAt(gx,gy){const els=ltCells.get((gy-LY)+','+(gx-LX));if(els)els.forEach(el=>el.classList.add('on'));}
  // 흔들림: 완성 후 A·B 장면을 번갈아(가운데는 고정, 위아래만 펄럭). 칸에 글을 쓰는 중(포커스)에는 A에 멈춤
  let wobT=0,wobOn=false;
  // 속도는 옆 캐릭터 숨쉬기(1.2초마다 장면 전환)와 같은 박자로 맞춤 — 캐릭터가 바뀌는 순간 편지도 같이 바뀜
  function startWobble(){clearTimeout(wobT);letter.classList.add('lt-ready');(function beat(){
    const BEAT=1200,t=breathT?performance.now()-breathT:0,n=Math.floor(t/BEAT);
    const hold=letter.matches(':focus-within')||matchMedia('(prefers-reduced-motion: reduce)').matches;
    wobOn=!hold&&n%2===1;letter.classList.toggle('wob',wobOn);
    wobT=setTimeout(beat,BEAT-(t%BEAT)+5);})();}
  function resetLetter(){clearTimeout(wobT);wobOn=false;letter.classList.remove('wob','lt-ready');letter.querySelectorAll('.on').forEach(el=>el.classList.remove('on'));}
  letter.addEventListener('focusin',()=>letter.classList.remove('wob'));
  // 칠하는 색: 십자말풀이 칸과 같은 대각선 무지개 파스텔(연분홍 → 살구 → 연노랑 → 민트 → 하늘)
  // 칠해진 칸 중 일부(약 4칸 중 1칸)에는 작은 아이콘이 들어감 — 사이트에 나온 것들(세 빛 · 눈 · ↗ · 편지)
  const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return(h^(h>>>16))>>>0;};
  const INK=[245,245,245]; // 완성 후 색: 다크 배경이라 밝은 #F5F5F5로(예전 밝은 배경에선 검정 #080809)
  function paintCell(gx,gy,rgb,a=1,sc=1,ink=0,toBottom=false){ // ink: 0 원래 색 → 1 검정
    const cx=ox+gx*C+C/2,cy=oy+gy*C+C/2,z=C*sc;
    pctx.globalAlpha=a;pctx.fillStyle=`rgb(${rgb.map((v,i)=>Math.round(v+(INK[i]-v)*ink)).join(',')})`;
    const top=cy-z/2-.5,h=toBottom?Math.max(z+1,H-top):z+1; // 자화상 맨 아래 줄은 화면 바닥까지 늘려 아래 여백이 안 보이게
    pctx.fillRect(cx-z/2-.5,top,z+1,h); // 반 픽셀씩 겹쳐 칠해 칸 사이 격자선이 안 보이게
  }
  let fading=false,popT=0,inkT=0; // inkT: 완성 뒤 컬러가 검정으로 번지기 시작한 시각
  function paintAll(){
    pctx.setTransform(dpr,0,0,dpr,0,0);pctx.clearRect(0,0,W,H);
    const now=performance.now();let popping=false;
    const span=PAT.length+PAT[0].length;
    if(breathT){ // 숨쉬기: 1.2초마다 두 장면을 번갈아(검정). 다음 바뀌는 순간에 다시 그림
      const BEAT=1200,n=Math.floor((now-breathT)/BEAT),k=n%2;
      // 눈 깜빡임: 기본 모습(짝수 박자) 두 번에 한 번, 박자 가운데서 0.16초 동안 눈을 감음
      const inBeat=(now-breathT)%BEAT,blink=k===0&&n%4===2&&inBeat>520&&inBeat<680;
      const F=k?patSetB:blink?patSetK:patSet;
      F.forEach(key=>{const [x,y]=key.split(',').map(Number);paintCell(patX+x,patY+y,INK,1,1,0,y===PAT.length-1);});
      clearTimeout(breathTimer);
      const nextIn=(k===0&&n%4===2&&inBeat<520)?520-inBeat:(k===0&&n%4===2&&inBeat<680)?680-inBeat:BEAT-inBeat; // 깜빡이는 순간에도 다시 그림
      breathTimer=setTimeout(paintAll,nextIn+5);
    }else
    painted.forEach((rgb,k)=>{const [x,y]=k.split(',').map(Number);let sc=1,ink=0;
      if(popT){const t=(now-popT-(x+y)*28)/520;if(t<1)popping=true;if(t>0&&t<1)sc=1+.32*Math.sin(Math.PI*t);}
      if(inkT){const p=(now-inkT)/1100;ink=Math.max(0,Math.min(1,p*1.6-(x+y)/span*.6));if(ink<1)popping=true;} // 왼쪽 위부터 대각선으로 검정이 번짐
      paintCell(patX+x,patY+y,rgb,1,sc,ink,y===PAT.length-1&&sc===1);});
    temp.forEach((v,k)=>{const age=now-v.t,life=v.trail?[250,650]:[900,800],a=age<life[0]?1:1-(age-life[0])/life[1];if(a<=0){temp.delete(k);return;}const [x,y]=k.split(',').map(Number);paintCell(x,y,v.col,a);});
    pctx.globalAlpha=1;
    if((temp.size||popping)&&!fading){fading=true;requestAnimationFrame(()=>{fading=false;paintAll();});}
  }
  function paintAt(gx,gy){
    revealLetterAt(gx,gy);
    const pk=(gx-patX)+','+(gy-patY);
    if(patSet.has(pk)){ // 그림 칸: 계속 남음
      if(painted.has(pk))return;painted.set(pk,INK);btnAgain.hidden=false;paintAll(); // 편지처럼 칠하는 즉시 완성 색(흰색)으로 드러남
      if(!revealDone&&painted.size/patSet.size>=.6)finishReveal(gx,gy);
    }else{temp.set(gx+','+gy,{t:performance.now(),col:brush});paintAll();} // 그림이 아닌 칸: 잠깐 칠해졌다 사라짐
  }
  // 그림 칸의 60%를 칠하면 나머지가 마지막으로 칠한 자리부터 물결처럼 채워지고 한 줄이 나타남
  function finishReveal(gx,gy,multi){
    revealDone=true;autoBtn.hidden=true;btnAgain.hidden=false;stopDemo();
    const rest=[...patSet].filter(k=>!painted.has(k)).map(k=>{const [x,y]=k.split(',').map(Number);return{k,d:Math.hypot(patX+x-gx,patY+y-gy)};}).sort((a,b)=>a.d-b.d);
    const fill=INK;rest.forEach(c=>{const [x,y]=c.k.split(',').map(Number),col=fill;later(()=>{painted.set(c.k,col);paintAll();},c.d*30);});
    const doneT=(rest.length?rest[rest.length-1].d*30:0)+250;
    hint.classList.add('hide');
    later(()=>{ // 다 드러나면: 글자 전체가 대각선 물결로 한 번 튀어 오르고, 글자 둘레에서 빛이 터짐
      popT=performance.now();temp.clear();paintAll();
      later(()=>{inkT=performance.now();paintAll();},900); // 튀어 오른 뒤 컬러 → 검정
      later(()=>{breathT=performance.now();paintAll();},900+1400); // 다 검정이 되면 숨쉬기 시작
      const pw=PAT[0].length,ph=PAT.length;
      [[.1,.25],[.95,.1],[0,.7],[1,.55],[.5,-.05],[.35,.45]].forEach(([u,v],i)=>later(()=>spawn(ox+(patX+u*pw)*C,oy+(patY+v*ph)*C),200+i*140));
      end.classList.add('revealed');
      later(startWobble,900+1400+10); // 캐릭터가 숨쉬기 시작하는 순간부터 같은 박자로 흔들림(이름표·예시 글자도 이때 함께 나타남)
    },doneT);
  }
  const cell=(gx,gy,col,a=1)=>{ctx.globalAlpha=a;ctx.fillStyle=col;ctx.fillRect(ox+gx*P,oy+gy*P,P,P);};
  function spawn(px,py){
    const gx=Math.round((px-ox)/P),gy=Math.round((py-oy)/P),i=kind%3;kind++;
    bursts.push({gx,gy,i,t0:performance.now(),emitted:false});kick();
  }
  function kick(){if(!running){running=true;requestAnimationFrame(tick);}}
  // 터짐: t(초)에 따라 모양 테두리가 퍼져 나감
  function drawBurst(b,T){
    const L=LIGHTS[b.i],sh=inShape[L.shape],R=3.2;
    if(T<.1){ // 알맹이
      cell(b.gx,b.gy,L.c[0]);
      return;
    }
    const k=Math.min(1,(T-.1)/.7),r=1+k*(R-1);        // 퍼지는 크기
    const col=L.c[Math.min(3,Math.floor(k*4))];              // 밝은 색 → 진한 색
    const fade=k<.6?1:1-(k-.6)/.4,dotted=k>.45;
    const n=Math.ceil(r)+1;
    for(let y=-n;y<=n;y++)for(let x=-n;x<=n;x++){
      const d=sh(x/r,y/r);
      if(Math.abs(d-1)<Math.max(.2,.6/r)){ // 테두리
        if(dotted&&((x+y)&1))continue;
        cell(b.gx+x,b.gy+y,col,fade);
      }else if(k<.35&&d<.45){ // 초반엔 가운데도 밝게
        cell(b.gx+x,b.gy+y,L.c[0],1-k/.35);
      }
    }
  }
  function emit(b){ // 터진 조각들이 위로 떠오름
    const L=LIGHTS[b.i],n=7+Math.floor(Math.random()*4);
    for(let q=0;q<n;q++){
      const gx=b.gx+Math.round((Math.random()-.5)*8);
      if(gx<0||gx>=cols)continue;
      parts.push({gx,y:b.gy+Math.round((Math.random()-.5)*4),v:0,col:L.c[1+Math.floor(Math.random()*3)],delay:Math.random()*.35});
    }
  }
  let last=performance.now();
  function tick(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    bursts=bursts.filter(b=>{const T=(now-b.t0)/1000;if(T>.95)return false;drawBurst(b,T);return true;});
    parts=parts.filter(p=>{
      if(p.delay>0){p.delay-=dt;return true;} // 테두리가 흩어질 즈음부터 하나씩 떠오름
      p.v=Math.min(16,p.v+22*dt);p.y-=p.v*dt;               // 점점 빨라지며 위로
      const top=stack[p.gx]?stack[p.gx].length:0;
      if(p.y<=top){ if(top<maxRows)stack[p.gx].push(p.col); return false; } // 층에 닿으면 쌓임
      cell(p.gx,Math.round(p.y),p.col);return true;
    });
    ctx.globalAlpha=1;
    if(bursts.length||parts.length)requestAnimationFrame(tick);else running=false;
  }
  /* 누르고 끌면(드래그) 지나간 격자 칸이 연한 색으로 칠해짐. 끌지 않고 톡 누르기만 하면 빛이 터짐 */
  let down=null,dragging=false,lastCell=null;
  const toG=e=>{const r=end.getBoundingClientRect();return[Math.floor((e.clientX-r.left-ox)/C),Math.floor((e.clientY-r.top-oy)/C),e.clientX-r.left,e.clientY-r.top];};
  end.addEventListener('pointerdown',e=>{
    if(e.target.closest&&e.target.closest('a,button,form'))return; // 폼·링크를 누를 땐 반응하지 않음
    if(revealDone){ // 그림이 완성되면 더는 칠하거나 끌 수 없음 — 대신 이스터에그: 그림 밖 빈 곳을 누르면 폭죽이 터짐
      const g=toG(e),pk=(g[0]-patX)+','+(g[1]-patY);
      if(!patSet.has(pk)&&!patSetB.has(pk)&&!patSetK.has(pk))spawn(g[2],g[3]);
      return;
    }
    down=toG(e);dragging=false;lastCell=[down[0],down[1]];stopDemo();
    brush=BRUSH[brushIdx++%BRUSH.length]; // 누를 때마다 다음 색 붓
  });
  let hoverLast=null;
  function trailAt(gx,gy){ // 누르지 않고 지나간 칸: 연한 회색으로 잠깐 채워졌다 사라짐(칠한 칸은 그대로)
    if(revealDone)return;
    const k=gx+','+gy,v=temp.get(k);
    if(painted.has((gx-patX)+','+(gy-patY))||(v&&!v.trail))return;
    temp.set(k,{t:performance.now(),col:TRAIL,trail:true});
  }
  addEventListener('pointermove',e=>{
    if(down&&revealDone){down=null;dragging=false;return;} // 끄는 도중 완성돼도 거기서 멈춤
    if(!down){
      if(e.pointerType!=='mouse'||!(e.target.closest&&e.target.closest('#end'))||e.target.closest('a,button,.ct-card,.ct-letter')){hoverLast=null;return;}
      const g=toG(e);
      if(hoverLast){const [x0,y0]=hoverLast,n=Math.max(Math.abs(g[0]-x0),Math.abs(g[1]-y0));for(let i=1;i<=Math.min(n,30);i++)trailAt(Math.round(x0+(g[0]-x0)*i/n),Math.round(y0+(g[1]-y0)*i/n));}
      else trailAt(g[0],g[1]);
      hoverLast=[g[0],g[1]];paintAll();return;
    }
    const g=toG(e);
    if(!dragging){if(Math.hypot(g[2]-down[2],g[3]-down[3])<6)return;dragging=true;hint.classList.add('hide');paintAt(down[0],down[1]);} // 칠하기 시작하면 안내는 사라짐
    const [x0,y0]=lastCell,n=Math.max(Math.abs(g[0]-x0),Math.abs(g[1]-y0)); // 빠르게 끌어도 칸이 비지 않게 사이 칸도 칠함
    for(let i=1;i<=n;i++)paintAt(Math.round(x0+(g[0]-x0)*i/n),Math.round(y0+(g[1]-y0)*i/n));
    lastCell=[g[0],g[1]];
  });
  addEventListener('pointerup',()=>{
    if(!down)return;
    if(!dragging){
      spawn(down[2],down[3]);
    }
    down=null;dragging=false;
  });
  // 오른쪽 위 '그림 지우기': 칠한 칸·완성 연출·연락처 표를 모두 처음 상태로
  // 오른쪽 위 '그림 한 번에 완성하기'(십자말풀이 '자동으로 풀기'처럼): 칠하지 않아도 그림 가운데부터 여러 색으로 채워져 완성 연출까지 한 번에
  const autoBtn=document.getElementById('pxAuto')||{hidden:true,addEventListener(){}}; // 시안 html처럼 버튼이 없는 페이지에서도 안 깨지게
  autoBtn.addEventListener('click',()=>{if(revealDone)return;finishReveal(patX+Math.floor(PAT[0].length/2),patY+Math.floor(PAT.length/2),true);});
  btnAgain.textContent='그림 지우기';
  btnAgain.addEventListener('click',()=>{
    timers.forEach(clearTimeout);timers=[];
    resetLetter();
    painted.clear();temp.clear();bursts=[];parts=[];revealDone=false;popT=0;inkT=0;brushIdx=0;breathT=0;clearTimeout(breathTimer);
    end.classList.remove('revealed');btnAgain.hidden=true;autoBtn.hidden=false;
    setHint('<i class="ph-drag"></i>화면을 드래그해서 숨은 그림을 찾아보세요');
    paintAll();
  });
  // 들어오면 손 모양 커서가 한 번 칸을 문질러 보이며 '끌어서 칠하기'를 알려 줌(사용자가 누르면 바로 멈춤)
  const ghost=document.createElement('div');ghost.className='px-ghost';ghost.setAttribute('aria-hidden','true');
  ghost.innerHTML='<svg viewBox="0 0 24 24"><path d="M5 3l14 7.5-6.2 1.6L10 18.5z"/></svg>';end.appendChild(ghost);
  let demo=null;
  function setHint(t,prog){hint.innerHTML=t;hint.classList.remove('hide');hint.classList.toggle('prog',!!prog);}
  function stopDemo(){if(!demo)return;cancelAnimationFrame(demo.raf);demo=null;ghost.classList.remove('show');}
  function runDemo(){
    if(revealDone||demo)return;
    const r=8,x0=patX+3,x1=patX+PAT[0].length-2,D=2200;
    const pts=[[x0,patY+r-2],[x0+(x1-x0)*.35,patY+r+1],[x0+(x1-x0)*.7,patY+r-2],[x1,patY+r+1]]; // 지그재그로 문지름
    let last=null;demo={t0:performance.now()};ghost.classList.add('show');
    (function step(now){
      if(!demo)return;
      const p=Math.min(1,(now-demo.t0-500)/D);
      if(p>=0){
        const f=p*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),k=f-i,e=k*k*(3-2*k);
        const gx=pts[i][0]+(pts[i+1][0]-pts[i][0])*e,gy=pts[i][1]+(pts[i+1][1]-pts[i][1])*e;
        ghost.style.transform=`translate(${ox+gx*C+C/2}px,${oy+gy*C+C/2}px)`;
        const c=[Math.floor(gx),Math.floor(gy)],pk=(c[0]-patX)+','+(c[1]-patY);
        if(!last||last[0]!==c[0]||last[1]!==c[1]){last=c;if(!patSet.has(pk)){temp.set(c[0]+','+c[1],{t:performance.now(),col:brush});paintAll();}}
      }else ghost.style.transform=`translate(${ox+pts[0][0]*C+C/2}px,${oy+pts[0][1]*C+C/2}px)`;
      if(p<1)demo.raf=requestAnimationFrame(step);else{demo=null;setTimeout(()=>ghost.classList.remove('show'),300);}
    })(performance.now());
  }
  setHint('<i class="ph-drag"></i>화면을 드래그해서 숨은 그림을 찾아보세요');
  let shown=false;
  new MutationObserver(()=>{if(document.body.dataset.scene==='reveal'&&!shown){shown=true;setTimeout(runDemo,700);}})
    .observe(document.body,{attributes:true,attributeFilter:['data-scene']});
  layout();
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(layout,150);});
})();
/* ===== REVEAL 메일 폼 =====
   CONTACT_ENDPOINT에 폼 전송 주소(예: Formspree https://formspree.io/f/xxxx)를 넣으면 페이지 안에서 바로 메일이 보내짐.
   비어 있으면 적은 내용이 채워진 채로 메일 앱이 열림(mailto) */
const CONTACT_ENDPOINT='';window.CONTACT_ENDPOINT_URL=CONTACT_ENDPOINT; // 편지 폼(REVEAL)도 같은 주소를 씀
(()=>{
  const f=document.getElementById('ctForm');if(!f)return;
  const msg=document.getElementById('ctMsg'),btn=f.querySelector('button');
  const [fName,fMail,fText]=['[name=name]','[name=email]','[name=message]'].map(s=>f.querySelector(s)); // f.name은 폼 자체 이름이라 따로 찾음
  const say=(t,c='')=>{msg.textContent=t;msg.className='ct-msg '+c;};
  document.getElementById('ctJump').addEventListener('click',e=>{e.preventDefault();f.classList.remove('flash');void f.offsetWidth;f.classList.add('flash');fName.focus();});
  f.addEventListener('keydown',e=>e.stopPropagation()); // 입력 중 방향키·PageDown 등이 장면 이동으로 먹히지 않게
  f.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    const name=fName.value.trim(),email=fMail.value.trim(),text=fText.value.trim();
    const bad=[[fName,!name],[fMail,!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)],[fText,!text]];
    bad.forEach(([el,b])=>el.classList.toggle('bad',b));
    if(bad.some(([,b])=>b)){say('빈 칸이나 이메일 형식을 확인해 주세요','err');return;}
    if(!CONTACT_ENDPOINT){
      location.href=`mailto:jodabin9098@gmail.com?subject=${encodeURIComponent('[포트폴리오] '+name+'님의 메시지')}&body=${encodeURIComponent(text+'\n\n— '+name+' ('+email+')')}`;
      say('메일 앱에서 보내기를 눌러 주세요');return;
    }
    btn.disabled=true;say('보내는 중…');
    try{
      const r=await fetch(CONTACT_ENDPOINT,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({name,email,message:text})});
      if(!r.ok)throw 0;
      f.reset();say('잘 보내졌어요. 곧 답장 드릴게요!','ok');
    }catch(err){say('보내지 못했어요. 잠시 뒤 다시 시도해 주세요','err');}
    btn.disabled=false;
  });
})();
/* ===== 장면(한 화면) 진행 =====
   페이지를 아래로 스크롤하지 않고, 늘 100vh 한 화면 안에서 장면만 바뀜: 01 LOOK(빛) → 02 FIND(십자말풀이) → 03 REVEAL(기획 의도).
   위쪽 내비게이션·아래 이전/다음 버튼·휠(한 번)·PageUp/PageDown·스와이프로 이동.
   앞으로 가려면 그 장면을 끝내야 함(빛 3개를 제자리에 / 십자말풀이를 모두 풀기). 뒤로는 언제든 */
const Scenes=(()=>{
  const heroWrap=document.getElementById('heroWrap'),cw=document.getElementById('cw'),end=document.getElementById('end');
  const nav=document.getElementById('snav'),navBtns=[...nav.querySelectorAll('[data-s]')];
  const ctl=document.getElementById('sctl'),prevB=document.getElementById('scPrev'),nextB=document.getElementById('scNext'),msg=document.getElementById('sctlMsg');
  const NAMES=['LOOK','FIND','REVEAL'];
  const LOCK_MSG=['빛 세 개를 모두 제자리에 놓으면 다음으로 넘어갈 수 있어요','십자말풀이를 모두 풀면 다음 장면이 열려요',''];
  let cur=0,busy=false,started=false;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canLeave=i=>i===0?!!window.__heroDone:i===1?!!cwSolved:false;
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
  /* 십자말풀이 ↔ REVEAL 도트 전환: 격자 칸 크기(십자말풀이 칸과 같은 자리)의 배경색 도트가 화면 가운데부터
     조금씩 무작위로 퍼지며 덮고 → 장면을 바꾼 뒤 → 같은 순서로 작아지며 열림 */
  const wipeCv=document.createElement('canvas');wipeCv.className='dot-wipe';wipeCv.setAttribute('aria-hidden','true');document.body.appendChild(wipeCv);
  const wHash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;};
  function dotWipe(swap){
    if(reduce){swap();return Promise.resolve();}
    const W=innerWidth,H=innerHeight,dpr=Math.min(2,devicePixelRatio||1),x=wipeCv.getContext('2d');
    wipeCv.width=Math.round(W*dpr);wipeCv.height=Math.round(H*dpr);wipeCv.style.width=W+'px';wipeCv.style.height=H+'px';wipeCv.style.display='block';x.setTransform(1,0,0,1,0,0); // 기기 픽셀 단위로 직접 그림(배율 125%·150%에서도 칸 사이 틈이 안 생기게)
    const C=Math.max(12,60*CW_K*Math.min(W/1920,H/1080));
    let fx=0,fy=0;const g=document.getElementById('grid');if(g){const r=g.getBoundingClientRect();if(r.width){fx=r.left;fy=r.top;}}
    const md=v=>((v%C)+C)%C,ox=md(fx)-C,oy=md(fy)-C,cols=Math.ceil((W-ox)/C)+1,rows=Math.ceil((H-oy)/C)+1;
    const cells=[];
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const X=Math.round((ox+i*C)*dpr),Y=Math.round((oy+j*C)*dpr); // 칸 경계를 기기 픽셀 정수로: 다음 칸 시작 = 이 칸 끝
      const dx=(i+.5)/cols-.5,dy=((j+.5)/rows-.5)*rows/cols; // 예전 '도트 등장' 시안 B: 가운데에서 바깥으로(약간 무작위)
      cells.push({X,Y,w:Math.round((ox+(i+1)*C)*dpr)-X,h:Math.round((oy+(j+1)*C)*dpr)-Y,d:Math.min(1,Math.hypot(dx,dy)/.62)*.75+wHash(i,j)*.18});
    }
    const BG='#212124',DUR=950,SPAN=.16;
    // 칸 크기는 그대로, 칸마다 배경색이 옅어지거나 짙어지기만 함(커지지 않음). 칸 경계는 정수 픽셀로 딱 붙게
    const pass=(closing)=>new Promise(res=>{const t0=performance.now();x.fillStyle=BG;(function f(now){
      const T=Math.min(1,(now-t0)/DUR);x.clearRect(0,0,wipeCv.width,wipeCv.height);
      cells.forEach(c=>{
        const t=Math.max(0,Math.min(1,(T*1.05-c.d)/SPAN)),a=closing?t:1-t;
        if(a<=0)return;x.globalAlpha=a;x.fillRect(c.X,c.Y,c.w,c.h);
      });
      x.globalAlpha=1;T<1?requestAnimationFrame(f):res();})(t0);});
    return pass(true).then(()=>{swap();x.fillStyle=BG;x.fillRect(0,0,wipeCv.width,wipeCv.height);return new Promise(r=>setTimeout(r,60));})
      .then(()=>pass(false)).then(()=>{x.clearRect(0,0,wipeCv.width,wipeCv.height);wipeCv.style.display='none';});
  }
  async function step(d){
    const from=cur,to=cur+d;
    if(busy||to<0||to>2||(d>0&&!canLeave(from)))return;
    busy=true;refresh();
    dispatchEvent(new CustomEvent('scene-move',{detail:NAMES[to].toLowerCase()})); // 내비 눈: 넘어가기 시작할 때 눈을 뜨고 그쪽을 봄
    if(from===0&&to===1){
      vis(cw,true);
      await tween(3200,t=>{const u=t;__heroCw.set(Math.min(1,u/.3),Math.max(0,(u-.3)/.7));},sine);
      vis(heroWrap,false);showCap();
    }else if(from===1&&to===0){
      vis(heroWrap,true);
      await tween(2600,t=>{const u=1-t;__heroCw.set(Math.min(1,u/.3),Math.max(0,(u-.3)/.7));},sine);
      vis(cw,false);
    }else if(from===1&&to===2){ // 도트 전환: 칸만 한 색 도트가 가운데서 퍼지며 화면을 덮고 → 같은 순서로 열리며 REVEAL이 드러남
      await dotWipe(()=>{vis(end,true);end.style.opacity=1;vis(cw,false);cw.style.transform='';end.classList.add('on');});
    }else if(from===2&&to===1){
      await dotWipe(()=>{vis(cw,true);cw.style.opacity=1;end.classList.remove('on');vis(end,false);cw.style.transform='';});
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
    const c=document.getElementById('cwCap');if(!c)return;
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
    if(e.defaultPrevented||busy)return; // 십자말풀이 칸을 고른 상태면 방향키는 칸 이동에 씀(위 핸들러가 먼저 처리)
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
    // 상세 페이지에서 돌아왔을 때: 모션 없이 바로 십자말풀이 화면으로
    jumpToCw(){vis(cw,true);__heroCw.set(1,1);vis(heroWrap,false);cur=1;capShown=true;this.start();refresh();}
  };
})();
window.Scenes=Scenes;
/* 상세 페이지에서 돌아온 경우(새로 불러와졌을 때): 인트로·빛 퍼즐을 건너뛰고, 풀어뒀던 단어를 그대로 채운 십자말풀이 화면으로 */
(()=>{
  let back=false;try{back=sessionStorage.getItem('pf-return')==='1';sessionStorage.removeItem('pf-return');}catch(e){}
  if(!back)return;
  const intro=document.getElementById('intro');intro.classList.add('done');intro.style.display='none';
  window.__heroComplete();
  Scenes.jumpToCw();
  let solved=[];try{solved=JSON.parse(sessionStorage.getItem('pf-solved')||'[]');}catch(e){}
  window.__quiet=true;window.__tipShown=true;
  solved.forEach(i=>{celebrated.add(i);wordCells(i).forEach(el=>putFns[el.dataset.key](el.dataset.ch));});
  window.__quiet=false;
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
