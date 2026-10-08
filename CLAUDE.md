# 조다빈 포트폴리오 (portfolio2)

Cowork(Claude 앱)와 Claude Code가 번갈아 작업하는 폴더입니다. 작업 전에 이 파일을 먼저 읽고, 구조가 바뀌면 이 파일도 같이 고쳐 주세요.

## 대화 규칙
- 사용자에게는 항상 존댓말로 답합니다.
- 사용자가 보내는 피그마 이미지는 "분위기 시안"입니다. 그대로 베끼지 말고 분위기를 맞춰 구현한 뒤 디테일은 함께 다듬습니다.

## 구조 (정적 HTML/CSS/JS, 빌드 없음)
- `index.html` — 한 화면(100vh) 안에서 장면 3개가 바뀌는 메인. 스크롤하지 않고 `script.js` 맨 아래 `Scenes`가 장면을 전환합니다.
  - 01 LOOK `#heroWrap`: 빛 3개(초록 별·핑크 육각형·파랑 네잎)를 커서로 옮겨 숨은 글자를 찾는 스포트라이트 퍼즐 (`script.js` 히어로 IIFE, canvas `#hc`).
  - 02 FIND `#find`: **형광펜 장면** (`find.js`). 옅은 배경 문장 사이의 프로젝트 이름에 형광펜이 칠해지고, 마우스를 올리면 미리보기, 누르면 `project.html?p=번호`로 이동합니다.
  - 03 REVEAL `#end`: **종이접기 장면** (`paper.js`). 색 밑판 위에 배경과 같은 색의 종이가 덮여 있고(바깥쪽 두 변만 색 띠로 보임), 바깥 모서리를 누르거나 끌면 종이가 접히면서 접힌 자리 밑의 색 밑판과 글(ABOUT·CONTACT·경력사항)이 드러납니다. 접힌 날개(종이 뒷면)는 배경보다 어둡게. 사용자가 확정한 방향이니 이 구조는 유지할 것.
- `find.js` — FIND 장면 전체. 글·형광펜 목록은 `FIND_ITEMS`, 색은 `HL`에서 수정합니다. `window.Find`의 `play()`·`reset()`·`rect(i)`·`paint(i,k)`·`done`을 `script.js`가 씁니다.
- `paper.js` — REVEAL 장면 전체. 종이는 HTML의 `.pf`(data-corner = 접히는 모서리, data-open = 크게 접혔을 때 모서리가 갈 자리를 종이 크기 비율로). 밑판 글은 `.pf-back`(접히는 모서리 쪽에 붙고 드러나는 삼각형에 맞게 자동 축소). `window.Paper.enter()`·`reset()`을 `Scenes`가 부릅니다.
- `script.js` — 히어로, 히어로→FIND 전환(`update()`, `createDive()`: 빛 점 → 빛 꼬리 → 형광펜), `Scenes`(FIND↔REVEAL은 `fadeSwap`).
- `style.css` — 파일 맨 끝에 `02 FIND: 형광펜`, `03 REVEAL: 종이접기` 블록이 있습니다.
- `project.html` / `project.js` / `project.css` — 프로젝트 상세 페이지. 데이터는 `project.js`의 `PROJECTS`(0 소소복담, 1 국순당, 2 AI와 디자인, 3 해잇, 4 삼토, 5 집메이트).

## 디벨롭 방향 (점 · 선 · 면)
1. 점: 스포트라이트(완성됨).
2. 선: 형광펜. 전환(`script.js` createDive): 히어로 빛 모양이 줄어들어 반짝이는 점이 되고 → 빛 꼬리와 반짝이 가루를 남기며 휘어진 길로 날아가 → 맡은 형광펜을 그대로 쓸며 칠함(`Find.paint`). 다 오면 나머지 형광펜이 차례로(`Find.play`). 빛 색은 `GLOW`, 타이밍은 `SHRINK_END`·`TRAVEL_START`·`SWEEP_START`, 꼬리 길이는 `TL`.
3. 면: 종이접기. 1차 구현을 마쳤습니다. 개연성이 부족하면 빛 컨셉으로 바꿀 수도 있습니다. 제목 `REVEAL THE UNSEEN`과 위쪽 두 단 글은 임시 문구입니다.

## 참고
- 예전 2번 장면(십자말풀이)과 예전 3번 장면(도트 그림·메일 폼)은 코드에서 모두 지웠습니다. `art-shapes.js`, `assets/cw/`, `assets/hover/`의 g1~g6는 이제 쓰지 않습니다. `assets/hover/g7.png`는 FIND 미리보기(AI와 디자인)에 씁니다.
- 원본 사이트는 별도 폴더(`../../portfolio`)와 별도 저장소입니다. 여기서 push해도 원본에는 영향이 없습니다.
