/* 포트폴리오 상세 페이지 데이터 — 순서는 index의 십자말풀이 번호(1~6)와 같음.
   link: 오른쪽 위 버튼이 열 주소(비어 있으면 회색 '포트폴리오 링크 이동' 버튼, 눌러도 아무 데도 안 감) / linkLabel: 링크가 있을 때 버튼 문구
   images: 큰 이미지 영역에 위에서부터 차례로 들어갈 이미지 경로(비어 있으면 회색 자리만 표시)
   ppt: PPT를 이미지로 내보낸 폴더(assets/slides/프로젝트/1.jpg, 2.jpg … — 화질을 위해 내보낸 JPG를 다시 압축하지 않고 그대로 씀) {dir:'폴더 경로',count:장 수,ext:'png'} — 1.png, 2.png … 순서대로 images 대신 들어감
   dir: 십자말풀이에서의 방향. 'v'(세로 단어)면 글자 상자를 세로로 쌓고 설명을 그 오른쪽에(피그마 node 246:913), 'h'면 글자 상자를 가로로 두고 설명은 그 아래에
   date: 작업 기간 / team: 몇 인 프로젝트 / desc: 설명 두 문단(① 프로젝트 소개 ② 느낀 점·개선할 점) / contrib: 기여도 [항목, %] / tools: 툴 아이콘 키(아래 TOOLS) */
const PROJECTS=[
  {t:'소소복담',word:'SOSOBOKDAM',dir:'v',date:'2025. 4 - 2025. 10',team:2,
    desc:['65세 이상 중 27.8%가 영양 관리가 필요하지만, 몸이 불편한 중장년층이 건강한 식사를 챙기기는 어렵습니다. 소소복담은 \'소소한 복을 담다\'라는 이름처럼 정다운 집밥을 전하는 건강 도시락 브랜드로, 집과 수저를 결합한 로고와 식욕을 돋우는 주황색, 우표·도장 그래픽을 더한 소포 형태의 웰컴 키트로 마음을 담아 보내는 경험을 표현했습니다.',
          '브랜드의 기획부터 실행까지 전 과정을 처음 경험하며, 기획과 어울리는 콘셉트를 세우고 초기 기획 의도와의 일관성을 지키는 것이 얼마나 중요한지 배웠습니다. 다만 구상했던 온·오프라인 홍보 방식과 일부 굿즈는 디자인으로 구체화하는 과정에서 제외되어, 앞으로는 더 구체적이고 실현 가능한 기획으로 프로젝트를 완성하고자 합니다.'],
    contrib:[['기획',50],['디자인',70]],tools:['ps','ai','id'],
    link:'',images:[],ppt:{dir:'assets/slides/sosobokdam',count:10,ext:'jpg'}},
  {t:'국순당 웹사이트 리디자인',word:'KOOKSOONDANG',dir:'v',date:'2026. 5 - 2026. 8',team:5,
    desc:['100년 전통주 브랜드 국순당의 웹사이트는 2009년에 멈춰 있어 모바일에서도 해외에서도 사용자에게 닿지 못했습니다. 저희는 \'Tradition Meets Interactive Experience\'를 콘셉트로 주막 문화를 유쾌한 2D 손그림 캐릭터로 풀어내고, 모든 조합에 결과를 설계한 페어링 게임과 언어 전환에 대응하는 컴포넌트를 더해 7개 페이지를 반응형으로 구현하고 배포했습니다.',
          '팀으로 작업하며 사소한 것까지 처음부터 세세하게 정해야 기획이 흔들리지 않는다는 것을 배웠고, 일정이 밀리지 않게 팀 프로젝트를 이끄는 방식을 익혔습니다. 다만 시간이 부족해 기획한 내용을 모두 담지 못했고 페이지 간 디자인 무드를 완전히 통일하지 못한 점이 아쉬워, 제품 상세·테스트 페이지를 다시 디자인하고 반응형을 완성하는 디벨롭을 이어가고자 합니다.'],
    contrib:[['기획',30],['디자인',40],['일러스트',85],['개발',20]],tools:['ps','ai','clipstudio','figma','html','css','js','vscode','claude'],
    link:'https://kooksoondang-phi.vercel.app/',linkLabel:'국순당 홈페이지 이동',images:[],ppt:{dir:'assets/slides/kooksoondang',count:33,ext:'jpg'}},
  {t:'AI와 디자인의 상관관계',word:'CORRELATION',dir:'v',date:'2024. 11 - 2024. 12',team:3,
    desc:['AI가 디자인의 창작 방식을 빠르게 바꾸고 있지만, 그 가능성과 위험을 함께 짚는 자료는 부족했습니다. 이 책은 AI의 개념과 활용 사례부터 악용 사례, 아티스트를 보호하는 방지 필터, 앞으로의 공존까지 하나의 흐름으로 구성하고, 아직 정제되지 않은 AI의 모습을 실험적인 레이아웃과 타이포그래피로 표현했습니다.',
          '누구나 AI로 영상과 포스터를 만드는 시대를 체감하며 디자이너만의 역할과 디자인의 본질이 무엇인지 고민하게 되었습니다. 다만 기계적이면서도 사람을 흉내 내는 듯한 일그러진 표현을 의도한 만큼 과감하게 풀어내지 못했고 인디자인 숙련도도 부족했던 만큼, 다음에는 주제가 디자인에 더 직접 드러나도록 다양한 표현을 실험해보고 싶습니다.'],
    contrib:[['기여도',40]],tools:['id','ai','ps'],
    link:'',images:[]},
  {t:'해잇',word:'HAEIT',dir:'h',date:'2025. 5 - 2025. 10',team:2,
    desc:['학생과 일반인의 약 20%가 발표불안을 겪지만, 혼자서는 무엇을 고쳐야 할지 알기 어렵습니다. 해잇은 발표 영상에 구간별 AI 피드백을 받아 습관과 행동을 스스로 교정하는 스피치 연습 앱으로, 발표 타입 테스트와 데일리 챌린지, 랭킹으로 꾸준히 연습하게 하고 멤버십 수익 구조까지 함께 설계했습니다.',
          '아이콘·컬러·레이아웃 같은 작은 요소부터, 사용자가 왜 이 앱을 선택하고 계속 써야 하는지와 앱을 어떻게 운영하고 수익을 낼지까지 함께 고민해야 한다는 것을 배웠습니다. 다만 한 가지 컬러 중심이라 요소 간 대비가 약했고 영상·녹음·텍스트를 한 화면에 담으려다 사용 흐름이 매끄럽지 못했던 점이 아쉬워, 다음에는 기능 간의 관계와 사용 흐름부터 설계하고자 합니다.'],
    contrib:[['기여도',50]],tools:['figma','ai','ps'],
    link:'',images:[],ppt:{dir:'assets/slides/haeit',count:14,ext:'jpg'}},
  {t:'삼토 페스티벌',word:'SAMTOFESTIVAL',dir:'h',date:'2025. 5 - 2025. 10',team:2,
    desc:['1964년부터 이어진 원주 농업 축제 삼토 페스티벌은 뚜렷한 아이덴티티가 없어 원주시 지역 축제 중 인지도가 가장 낮았습니다. 20~30대의 관심을 끌기 위해 채도 높은 컬러로 올드한 이미지를 벗고, 특산물인 복숭아·쌀·배와 흙을 통통 튀는 무빙포스터로 표현했으며, \'새참\'을 소풍 콘셉트로 재해석한 도시락 패키지와 굿즈를 더했습니다.',
          '지역 축제에 관심을 갖게 되었고, 지역 특성을 살리는 디자인이 무엇인지와 요즘 트렌드 속에서 축제를 어떻게 살릴지 고민할 수 있었습니다. 다만 삼토만의 캐릭터를 쓰임새에 맞게 충분히 활용하지 못했고, 배·복숭아·허수아비 같은 굿즈 요소에 원주만의 특색을 더 담지 못한 점이 아쉬움으로 남았습니다.'],
    contrib:[['기여도',60]],tools:['ai','ps','ae','clipstudio'],
    link:'',images:[],ppt:{dir:'assets/slides/samto',count:14,ext:'jpg'}},
  {t:'집메이트',word:'ZIPMATE',dir:'h',date:'2026. 8 - 2026. 9',team:4,
    desc:['SNS에는 완성된 사진만 있어 셀프 인테리어 입문자는 어디서부터 시작해야 할지 모르고, 사용자의 60%가 실패할까 봐 망설였습니다. 집메이트는 결과가 아닌 \'과정\'에 집중해 집로그와 진행률 챌린지로 작업을 단계별로 관리하고 실패담과 꿀팁까지 나누는 커뮤니티를 설계했으며, 4주 만에 기획부터 React 개발, 배포까지 완료했습니다.',
          '처음 사용한 React로 수정이 바로 반영되는 과정이 재미있었지만, 구현할 페이지가 계속 늘어나며 앱 하나에도 신경 쓸 부분이 많다는 것을 체감했습니다. 처음 PM을 맡아 일정 관리의 어려움을 느꼈고, 팀원들과 UX·UI를 함께 고민하고 브랜치를 나눠 개발하며 협업이 얼마나 중요한지 다시 한 번 배웠습니다.'],
    contrib:[['기획',25],['디자인',30],['개발',20],['기획서 디자인',30]],tools:['figma','react','vscode','claude'],
    link:'https://zipmate-rouge.vercel.app/',linkLabel:'집메이트 사이트 이동',images:[],ppt:{dir:'assets/slides/zipmate',count:20,ext:'jpg'}},
];
/* 툴 아이콘: assets/skills/이름.svg — h는 1920 화면 기준 아이콘 높이(피그마 261:924 실측, 없는 건 비슷한 비율로) */
const TOOLS={
  ps:{n:'Photoshop',h:31},ai:{n:'Illustrator',h:31},id:{n:'InDesign',h:31},clipstudio:{n:'Clip Studio',h:31},
  figma:{n:'Figma',h:31.8},html:{n:'HTML',h:31.6},css:{n:'CSS',h:31.6},js:{n:'JavaScript',h:22},
  react:{n:'React',h:31},vscode:{n:'VS Code',h:31.3},claude:{n:'Claude',h:31},ae:{n:'After Effects',h:28},pr:{n:'Premiere Pro',h:28},
};

(()=>{
  const n=parseInt(new URLSearchParams(location.search).get('p'),10);
  const i=Number.isInteger(n)&&PROJECTS[n]?n:0,p=PROJECTS[i];
  document.title=p.t+' — Portfolio';
  if(p.dir==='v')document.querySelector('.pd').classList.add('pd-v'); // 세로 단어 레이아웃

  // 단어를 십자말풀이처럼 한 글자씩 상자에 담음(첫 상자에 번호)
  const word=document.getElementById('pdWord');
  [...p.word].forEach((ch,k)=>{
    const b=document.createElement('span');b.className='b';b.style.setProperty('--i',k);b.textContent=ch;
    if(k===0){const s=document.createElement('sup');s.textContent=i+1;b.appendChild(s);}
    word.appendChild(b);
  });
  word.setAttribute('aria-label',p.word);
  // 글자 칸을 누를 때마다 파도타기: 첫 칸부터 차례로 살짝 튀어 오름(세로 단어는 옆으로). 연달아 눌러도 처음부터 다시
  const boxes=[...word.querySelectorAll('.b')];
  word.addEventListener('click',()=>{
    boxes.forEach(b=>{b.classList.remove('wave');void b.offsetWidth;b.classList.add('wave');});
  });
  boxes.forEach(b=>b.addEventListener('animationend',e=>{if(e.animationName==='boxWave'||e.animationName==='boxWaveV')b.classList.remove('wave');}));
  // 십자말풀이에서 넘어온 경우엔 뒤로가기(풀어둔 상태 그대로 돌아감), 아니면 첫 페이지로
  // 제목 상자·X 버튼 모두: 십자말풀이에서 넘어왔으면 뒤로가기(풀어둔 상태 그대로), 아니면 첫 페이지로
  // (새로 불러와지더라도 index 쪽에서 sessionStorage로 십자말풀이 화면을 바로 복원함)
  const goBack=e=>{
    try{sessionStorage.setItem('pf-return','1');}catch(err){}
    if(document.referrer&&history.length>1){e.preventDefault();history.back();}
  };
  // X·Esc: 자료를 크게 보고 있으면 먼저 그것만 닫고, 아니면 십자말풀이로 돌아감
  document.getElementById('pdClose').addEventListener('click',e=>{if(document.body.classList.contains('sheet-open')){e.preventDefault();window.__closeSheet();}else goBack(e);});
  addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.body.classList.contains('sheet-open'))window.__closeSheet();else goBack(e);}});

  // 제목·기간·설명 두 단·기여도·툴 (피그마 246:913)
  document.getElementById('pdTitle').textContent=p.t;
  const dt=document.getElementById('pdDate');if(p.date)dt.textContent=p.date;else dt.remove();
  [0,1].forEach(k=>{const el=document.getElementById('pdDesc'+(k+1));if(p.desc&&p.desc[k])el.textContent=p.desc[k];else el.remove();});
  const ct=document.getElementById('pdContrib');
  if(p.team){const s=document.createElement('span');s.className='team';s.textContent=`${p.team}인 프로젝트`;ct.appendChild(s);} // 기여도 앞에 몇 인 프로젝트였는지
  if(p.contrib&&p.contrib.length)p.contrib.forEach(([k,v])=>{const s=document.createElement('span');s.textContent=`${k} ${v}%`;ct.appendChild(s);});
  if(!ct.children.length)ct.remove();
  const tl=document.getElementById('pdTools');
  (p.tools||[]).forEach(k=>{const t=TOOLS[k];if(!t)return;
    const li=document.createElement('li');li.innerHTML=`<img src="assets/skills/${k}.svg" alt="" style="--h:${t.h}"><span>${t.n}</span>`;tl.appendChild(li);});

  const btn=document.getElementById('pdLink');
  if(p.link){btn.href=p.link;btn.textContent=p.linkLabel||`${p.t} 사이트 이동`;} // 링크가 있으면 버튼 문구도 그 사이트 이름으로
  else{btn.removeAttribute('href');btn.setAttribute('aria-disabled','true');btn.removeAttribute('target');}

  const media=document.getElementById('pdMedia'),slides=document.getElementById('pdSlides');
  const pptImgs=p.ppt?Array.from({length:p.ppt.count},(_,k)=>`${p.ppt.dir}/${k+1}.${p.ppt.ext||'png'}`):[];
  const imgs=pptImgs.length?pptImgs:p.images.length?p.images:[null];
  imgs.forEach(src=>{
    if(src){const im=document.createElement('img');im.src=src;im.alt=p.t;im.loading='lazy';slides.appendChild(im);}
    else{const d=document.createElement('div');d.className='ph';slides.appendChild(d);}
  });

  /* 오른쪽 단축 바(크게 볼 때만): 장마다 작은 미리보기 — 누르면 그 장으로 바로 이동, 지금 보고 있는 장은 진하게 표시 */
  const rail=document.createElement('nav');rail.className='pd-rail';rail.setAttribute('aria-label','슬라이드 바로가기');
  const items=[...slides.children];
  if(items.length>1){
    items.forEach((el,k)=>{
      const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',(k+1)+'번째 장으로');
      if(el.tagName==='IMG'){const t=document.createElement('img');t.src=el.src;t.alt='';t.loading='lazy';b.appendChild(t);}
      const n=document.createElement('span');n.textContent=String(k+1);b.appendChild(n);
      b.addEventListener('click',()=>goTo(k));
      rail.appendChild(b);
    });
    document.body.appendChild(rail);document.body.classList.add('has-rail');
  }
  let curIdx=-1,railHold=0;
  function goTo(k){ // k번째 장을 화면 가운데로 부드럽게
    k=Math.max(0,Math.min(items.length-1,k));const el=items[k];if(!el)return;
    slides.scrollTo({top:el.offsetTop-(slides.clientHeight-el.offsetHeight)/2,behavior:'smooth'});
  }
  const markCur=()=>{
    const mid=slides.scrollTop+slides.clientHeight/2;let best=0,bd=1e9;
    items.forEach((el,k)=>{const d=Math.abs(el.offsetTop+el.offsetHeight/2-mid);if(d<bd){bd=d;best=k;}});
    if(best===curIdx)return;curIdx=best;
    [...rail.children].forEach((b,k)=>b.classList.toggle('cur',k===best));
    const b=rail.children[best];if(b&&performance.now()>railHold)rail.scrollTo({top:b.offsetTop-(rail.clientHeight-b.offsetHeight)/2,behavior:'smooth'}); // 방금 바를 직접 굴렸으면 자동으로 되돌리지 않음
  };
  /* 단축 바 위아래 끝을 그라데이션으로 흐리게: 위로 더 있으면 위쪽을, 아래로 더 있으면 아래쪽을 흐려서 뚝 끊겨 보이지 않게 */
  const railFade=()=>{
    const max=rail.scrollHeight-rail.clientHeight;
    rail.style.setProperty('--ft',(max>1&&rail.scrollTop>1?40:0)+'px');
    rail.style.setProperty('--fb',(max>1&&rail.scrollTop<max-1?40:0)+'px');
  };
  rail.addEventListener('scroll',railFade,{passive:true});addEventListener('resize',railFade);
  requestAnimationFrame(railFade);rail.querySelectorAll('img').forEach(im=>im.addEventListener('load',railFade,{once:true}));
  slides.addEventListener('scroll',markCur,{passive:true});markCur();
  // 크게 본 상태에선 ↑↓ 키로도 한 장씩
  addEventListener('keydown',e=>{
    if(!media.classList.contains('open')||!(e.key==='ArrowDown'||e.key==='ArrowUp'))return;
    e.preventDefault();const k=Math.max(0,Math.min(items.length-1,curIdx+(e.key==='ArrowDown'?1:-1)));
    goTo(k);
  });

  /* 자료 시트: 누르거나 아래로 스크롤(손가락은 위로 쓸기)하면 올라와 크게 보고,
     크게 본 상태에서 맨 위에서 더 위로 스크롤하거나 Esc·X·바깥(흐린 곳)을 누르면 다시 내려감 */
  let lock=0;
  const isOpen=()=>media.classList.contains('open');
  const setSheet=o=>{
    if(o===isOpen())return;
    media.classList.toggle('open',o);document.body.classList.toggle('sheet-open',o);
    media.setAttribute('aria-label',o?'자료 (위로 스크롤하거나 Esc로 닫기)':'자료 크게 보기');
    if(!o)slides.scrollTop=0;
    lock=performance.now()+700; // 올라가고 내려가는 동안 휠이 연달아 먹지 않게
  };
  media.addEventListener('click',()=>{if(!isOpen())setSheet(true);});
  media.addEventListener('keydown',e=>{if(!isOpen()&&(e.key==='Enter'||e.key===' ')){e.preventDefault();setSheet(true);}});
  document.getElementById('pdDim').addEventListener('click',()=>setSheet(false));
  // 휠: 닫혀 있으면 아래로 굴려 열기 / 열려 있으면 한 번 굴릴 때마다 한 장씩 부드럽게 넘어감(첫 장에서 위로 굴리면 닫힘)
  let wheelAcc=0,wheelT=0;
  addEventListener('wheel',e=>{
    if(isOpen()&&e.target.closest&&e.target.closest('.pd-rail')){ // 단축 바 위에서 굴리면 장은 그대로 두고 바만 스크롤(원하는 장을 찾아 바로 누를 수 있게)
      e.preventDefault();rail.scrollTop+=e.deltaMode===1?e.deltaY*16:e.deltaY;railHold=performance.now()+1500;return;
    }
    if(isOpen())e.preventDefault();
    const now=performance.now();
    if(now<lock)return;
    if(!isOpen()){if(e.deltaY>8)setSheet(true);return;}
    if(now-wheelT>250)wheelAcc=0;wheelT=now;wheelAcc+=e.deltaY; // 트랙패드처럼 잘게 들어오는 휠은 모아서 한 번으로
    if(Math.abs(wheelAcc)<30)return;
    const dir=wheelAcc>0?1:-1;wheelAcc=0;
    if(dir<0&&curIdx<=0){setSheet(false);return;}
    goTo(curIdx+dir);lock=now+750;
  },{passive:false});
  let ty=null;
  addEventListener('touchstart',e=>{ty=e.touches[0].clientY;},{passive:true});
  addEventListener('touchend',e=>{
    if(ty===null)return;const dy=ty-e.changedTouches[0].clientY;ty=null;
    if(!isOpen()&&dy>40)setSheet(true);else if(isOpen()&&dy<-60&&slides.scrollTop<=0)setSheet(false);
  },{passive:true});

  window.__closeSheet=()=>setSheet(false);
  /* 배경 도형이 마우스 쪽으로 아주 살짝 밀림(도형마다 깊이가 달라 겹겹이 떠 있는 느낌) */
  const bg=document.getElementById('pdBg');
  addEventListener('pointermove',e=>{
    bg.style.setProperty('--px',(e.clientX/innerWidth-.5).toFixed(3));
    bg.style.setProperty('--py',(e.clientY/innerHeight-.5).toFixed(3));
  },{passive:true});
})();
