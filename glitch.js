/* ===== 로딩 바 글리치 도트 =====
   로딩 바(와 그 바로 위아래)에서만, 가끔(1~2.5초마다) 0.15~0.3초 동안 '지직':
   바를 따라 작은 네모 도트가 튀고, 검정 도트가 바를 끊어 먹은 듯 보임. 평소엔 아주 드물게 한두 개만 깜빡임.
   로딩 화면이 사라지면 멈추고 캔버스도 지움 */
(()=>{
  const intro=document.getElementById('intro');if(!intro)return;
  const ld=intro.querySelector('.ld'),bar=ld&&ld.querySelector('.bar');if(!bar)return;
  const cv=document.createElement('canvas');cv.className='gl-cv';cv.setAttribute('aria-hidden','true');intro.appendChild(cv);
  const ctx=cv.getContext('2d');
  const COLS=['#F46171','#F99E94','#E5FF7F','#B7FEC6','#6A9DD1']; // 로딩 바 색
  let W=0,H=0,dpr=1,burstEnd=0,nextBurst=performance.now()+600;
  function size(){dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;}
  size();addEventListener('resize',size);
  const rnd=(a,b)=>a+Math.random()*(b-a);
  window.__glitchBurst=()=>{burstEnd=performance.now()+rnd(150,300);}; // 확인용: 바로 한 번 지직
  function frame(now){
    if(intro.classList.contains('done')||intro.style.display==='none'){cv.remove();return;}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const vis=parseFloat(getComputedStyle(ld).opacity)>.1,r=bar.getBoundingClientRect(),fill=bar.firstElementChild?bar.firstElementChild.getBoundingClientRect().width:r.width;
    if(vis&&r.width>0){
      if(now>nextBurst){burstEnd=now+rnd(150,300);nextBurst=now+rnd(1000,2500);}
      const B=Math.max(3,Math.round(r.width/70)),y0=r.top+r.height/2; // 도트 한 칸(바 길이의 1/70)
      const snapX=x=>r.left+Math.round((x-r.left)/B)*B;
      if(now<burstEnd){
        // 바 위를 따라 이어지는 도트 줄(2~3줄): 색 도트 + 바를 끊는 검정 도트
        const runs=2+Math.floor(rnd(0,2));
        for(let k=0;k<runs;k++){
          const row=Math.floor(rnd(-2,3)),x0=snapX(r.left+rnd(0,Math.max(B,fill-B*6))),len=Math.floor(rnd(3,10));
          for(let i=0;i<len;i++){
            if(Math.random()<.3)continue;
            const t=Math.random(),x=x0+i*B;if(x>r.right)break;
            ctx.globalAlpha=row===0&&t<.35?1:rnd(.55,1);
            ctx.fillStyle=row===0&&t<.35?'#080809':t<.6?'#F5F5F5':COLS[Math.min(4,Math.floor((x-r.left)/r.width*5))];
            ctx.fillRect(x,y0-B/2+row*B,B,B);
          }
        }
        // 바 주변에 흩어진 도트 몇 개
        for(let i=0,n=Math.floor(rnd(4,9));i<n;i++){
          const x=snapX(r.left+rnd(0,r.width));ctx.globalAlpha=rnd(.35,.9);
          ctx.fillStyle=Math.random()<.5?'#F5F5F5':COLS[Math.min(4,Math.floor((x-r.left)/r.width*5))];
          ctx.fillRect(x,y0-B/2+Math.floor(rnd(-3,4))*B,B,B);
        }
      }else if(Math.random()<.05){ // 평소: 아주 드물게 한 개
        const x=snapX(r.left+rnd(0,Math.max(B,fill)));ctx.globalAlpha=rnd(.3,.7);ctx.fillStyle='#F5F5F5';
        ctx.fillRect(x,y0-B/2+Math.floor(rnd(-2,3))*B,B,B);
      }
      ctx.globalAlpha=1;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
