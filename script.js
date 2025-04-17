// =================== 전역 변수 =====================
let money = 0;
let begLevel = 1;
let begAmount = 1;
let begUpgradeCost = 10;
let helper = 0;
let helperCost = 10000;
let helperIncomeBase = 1000; // 알바생 1명당 기본 초당 수익
let house = 0;
let houseCost = 500000;
let houseIncomeBase = 50000; // 부동산 1채당 기본 초당 수익
let prestige = 0;
let stars = 0;
let clickCount = 0;
let theme = 0; // 0: 기본, 1: 다크
let bgmOn = true;
let clickSoundOn = true;

// 업적, 미션, 랭킹, 연구소, 이벤트 관련
let achievements = [
  { id: 'money1', name: '1억 거지', desc: '1억 원 달성', check: () => money >= 100000000, reward: 1, achieved: false },
  { id: 'helper10', name: '알바생 대장', desc: '알바생 10명 고용', check: () => helper >= 10, reward: 1, achieved: false },
  { id: 'estate10', name: '부동산 부자', desc: '부동산 10채 보유', check: () => house >= 10, reward: 1, achieved: false },
  { id: 'prestige1', name: '환생의 시작', desc: '첫 환생 달성', check: () => prestige >= 1, reward: 3, achieved: false },
  { id: 'click100', name: '클릭 마스터', desc: '클릭 100회', check: () => clickCount >= 100, reward: 1, achieved: false },
];
let missions = [
  { id: 'daily_click', name: '오늘의 클릭', desc: '클릭 100회', check: () => clickCount - missionProgress.daily_click >= 50, reward: 5000, done: false },
  { id: 'daily_helper', name: '알바생 고용', desc: '알바생 2명 고용', check: () => helper - missionProgress.daily_helper >= 2, reward: 10000, done: false },
  { id: 'daily_house', name: '부동산 구매', desc: '부동산 1채 구매', check: () => house - missionProgress.daily_house >= 1, reward: 20000, done: false },
];
let missionProgress = { daily_click: 0, daily_helper: 0, daily_house: 0, lastDate: "" };
let allMissionsDone = false;
let prestigeBonus = 0;
let prestigeCostBase = 100000000;
let prestigeCostIncrement = 10000000;
let research = { helperBoost: 0, houseBoost: 0 };
let buff = { click: 1, auto: 1, remain: 0 };
let eventActive = false;
let localRanking = { maxMoney: 0, maxClick: 0, maxPrestige: 0 };

// =================== 유틸 함수 =====================
function formatNumber(num) {
  return num.toLocaleString();
}
function saveGame() {
  const save = {
    money, begLevel, begAmount, begUpgradeCost, helper, helperCost, house, houseCost,
    prestige, stars, clickCount, theme, bgmOn, clickSoundOn, helperIncomeBase,
    achievements: achievements.map(a=>a.achieved), houseIncomeBase,
    missions: missions.map(m=>m.done), randomBoxCooldown,
    missionProgress, allMissionsDone, prestigeBonus, prestigeCostBase, prestigeCostIncrement,
    research, buff, localRanking
  };
  localStorage.setItem('idle_save', JSON.stringify(save));
}

function loadGame() {
  const save = JSON.parse(localStorage.getItem('idle_save'));
  if (!save) return;
  money = save.money; begLevel = save.begLevel; begAmount = save.begAmount; begUpgradeCost = save.begUpgradeCost;
  helper = save.helper; helperCost = save.helperCost; house = save.house; houseCost = save.houseCost;
  prestige = save.prestige; stars = save.stars; clickCount = save.clickCount; theme = save.theme ?? 0;
  bgmOn = save.bgmOn !== false; clickSoundOn = save.clickSoundOn !== false;
  if (save.achievements) save.achievements.forEach((ach, i) => achievements[i].achieved = ach);
  if (save.missions) save.missions.forEach((done, i) => missions[i].done = done);
  missionProgress = save.missionProgress || missionProgress;
  helperIncomeBase = save.helperIncomeBase || 1000;
  houseIncomeBase = save.houseIncomeBase || 50000;
  randomBoxCooldown = save.randomBoxCooldown || 0;
  allMissionsDone = save.allMissionsDone || false;
  prestigeBonus = save.prestigeBonus || 0;
  prestigeCostBase = save.prestigeCostBase ?? 100000000;
  prestigeCostIncrement = save.prestigeCostIncrement ?? 10000000;
  research = save.research || { helperBoost: 0, houseBoost: 0 };
  buff = save.buff || { click: 1, auto: 1, remain: 0 };
  localRanking = save.localRanking || localRanking;
}

// =================== UI 함수 =====================
function updateScreen(msg) {
  document.getElementById("money").innerText = `💰 ${formatNumber(money)} 원`;
  document.getElementById("beg-level").innerText = begLevel;
  document.getElementById("helper-count").innerText = helper;
  document.getElementById("estate-count").innerText = house;
  document.getElementById("prestige-count").innerText = prestige;
  document.getElementById("star-count").innerText = stars;
  document.getElementById("beg-amount-info").innerText = formatNumber(Math.floor(begAmount * (1 + prestigeBonus/100) * buff.click));
  document.getElementById("sec-income-info").innerText = formatNumber(getSecIncome());
  document.getElementById("beg-upgrade-cost").innerText = formatNumber(begUpgradeCost);
  document.getElementById("helper-cost").innerText = formatNumber(helperCost);
  document.getElementById("house-cost").innerText = formatNumber(houseCost);
  if (msg) {
    document.getElementById("log").innerText = msg;
    setTimeout(() => { document.getElementById("log").innerText = ""; }, 1500);
  }
  // 테마 적용
  if (theme === 0) {
  document.body.classList.remove('dark-theme');
  document.body.style.background = '#fff';
} else {
  document.body.classList.add('dark-theme');
  document.body.style.background = '#333';
}


}

function showPopup(msg) {
  let popup = document.getElementById('achievement-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'achievement-popup';
    popup.className = 'popup';
    document.body.appendChild(popup);
  }
  popup.innerHTML = msg + '<br><button onclick="closePopup()">닫기</button>';
  popup.style.display = 'block';
}
function closePopup() {
  let popup = document.getElementById('achievement-popup');
  if (popup) popup.style.display = 'none';
}
function closeModal(id) {
  let modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

// =================== 게임 액션 =====================
function earnMoney() {
  money += Math.floor(begAmount * (1 + prestigeBonus/100) * buff.click);
  clickCount += 1;
  playClickSound();
  updateScreen();
  checkAchievements();
  checkMissions();
  saveGame();
}
function upgradeBeg() {
  if (money >= begUpgradeCost) {
    money -= begUpgradeCost;
    begLevel += 1;
    begAmount = Math.ceil(begAmount * 0.17);
    begUpgradeCost = Math.floor(begUpgradeCost * 0.18);
    updateScreen("구걸 레벨이 올랐습니다!");
    checkAchievements();
    saveGame();
  } else {
    updateScreen("돈이 부족합니다!");
  }
}
function buyHelper() {
  if (money >= helperCost) {
    money -= helperCost;
    helper += 1;
    helperCost = Math.floor(helperCost * 0.16);
    helperIncomeBase = Math.floor(helperIncomeBase * 0.19); // 1.5배 증가!
    updateScreen("알바생을 고용했습니다!");
    checkAchievements();
    saveGame();
  } else {
    updateScreen("돈이 부족합니다!");
  }
}

function buyHouse() {
  if (money >= houseCost) {
    money -= houseCost;
    house += 1;
    houseCost = Math.floor(houseCost * 1.9);
    houseIncomeBase = Math.floor(houseIncomeBase * 1.5); // 1.5배 증가!
    updateScreen("부동산을 구매했습니다!");
    checkAchievements();
    saveGame();
  } else {
    updateScreen("돈이 부족합니다!");
  }
}


// =================== 자동 수익 =====================
function getSecIncome() {
  let helperIncome = Math.floor(helper * helperIncomeBase * (1 + research.helperBoost/100));
  let houseIncome = Math.floor(house * houseIncomeBase * (1 + research.houseBoost/100));
  return Math.floor((helperIncome + houseIncome) * (1 + prestigeBonus/100) * buff.auto);
}

function autoIncome() {
  money += getSecIncome();
  updateScreen();
  saveGame();
}
setInterval(autoIncome, 1000);

// =================== 업적 =====================
function checkAchievements() {
  achievements.forEach(a => {
    if (!a.achieved && a.check()) {
      a.achieved = true;
      stars += a.reward;
      saveGame();
      showPopup(`업적 달성!<br><b>${a.name}</b><br>${a.desc}<br>보상: ⭐${a.reward}개`);
    }
  });
}
function showAchievements() {
  let html = `<b>업적 목록</b><div class="achievements-list">`;
  achievements.forEach(a => {
    html += `<div style="margin:5px 0;${a.achieved ? 'color:gold;' : ''}">${a.name} - ${a.desc} ${a.achieved ? '⭐' : ''}</div>`;
  });
  html += `</div><button onclick="closeModal('achievements-modal')">닫기</button>`;
  showModal('achievements-modal', html);
}

// =================== 미션 =====================
function checkMissions() {
  const today = new Date().toISOString().slice(0,10);
  if (missionProgress.lastDate !== today) {
    missionProgress = { daily_click: clickCount, daily_helper: helper, daily_house: house, lastDate: today };
    missions.forEach(m => m.done = false);
    allMissionsDone = false;
  }
  let doneCount = 0;
  missions.forEach(m => {
    if (!m.done && m.check()) {
      m.done = true;
      money += m.reward;
      saveGame();
      showPopup(`미션 완료!<br><b>${m.name}</b><br>${m.desc}<br>보상: 💰${formatNumber(m.reward)}원`);
    }
    if (m.done) doneCount++;
  });
  if (doneCount === missions.length && !allMissionsDone) {
    allMissionsDone = true;
    money += 100000;
    saveGame();
    showPopup(`일일 미션 모두 완료!<br>특별 보상: 💰100,000원`);
  }
}
function showMissions() {
  let html = `<b>오늘의 미션</b><div class="missions-list">`;
  missions.forEach(m => {
    html += `<div style="margin:5px 0;${m.done ? 'color:green;' : ''}">${m.name} - ${m.desc} ${m.done ? '✅' : ''}</div>`;
  });
  html += `</div><button onclick="closeModal('missions-modal')">닫기</button>`;
  showModal('missions-modal', html);
}

// =================== 환생(프레스티지) =====================
function canPrestige() {
  return money >= getPrestigeCost();
}
function getPrestigeCost() {
  return prestigeCostBase + (prestige * prestigeCostIncrement);
}
function showPrestige() {
  let html = `<b>환생(프레스티지)</b><div class="prestige-list">`;
  html += `<div>환생 조건: ${formatNumber(getPrestigeCost())} 원 보유</div>`;
  html += `<div>환생 시 전체 수익 +10% 보너스, 별 5개 지급</div>`;
  html += `<div>환생 시 초기 구걸 값 증가</div>`;
  html += `<div>현재 환생: ${prestige}회, 보너스: +${prestigeBonus}%</div>`;
  html += `<button onclick="doPrestige()" ${canPrestige() ? '' : 'disabled'}>환생하기</button>`;
  html += `<button onclick="closeModal('prestige-modal')">닫기</button>`;
  showModal('prestige-modal', html);
}
function doPrestige() {
  if (!canPrestige()) return;
  money -= getPrestigeCost();
  prestige += 1;
  stars += 5;
  prestigeBonus = prestige * 10;
  prestigeCostBase += prestigeCostIncrement;
  // 상태 초기화
  money = 0; helper = 0; house = 0; begLevel = 1; begAmount = 1 + prestige; begUpgradeCost = 10; clickCount = 0;
  saveGame();
  closeModal('prestige-modal');
  showPopup("환생 성공!<br>전체 수익 +10% 보너스<br>별 5개 획득<br>초기 구걸 값: " + begAmount + "원");
  updateScreen();
}

// =================== 연구소(업그레이드) =====================
function showResearch() {
  let html = `<b>연구소</b><div class="research-list">`;
  html += `<div>알바생 수익 영구 증가: +${research.helperBoost}% (⭐10개) <button onclick="buyResearch('helperBoost')" ${stars >= 10 ? '' : 'disabled'}>구매</button></div>`;
  html += `<div>부동산 수익 영구 증가: +${research.houseBoost}% (⭐10개) <button onclick="buyResearch('houseBoost')" ${stars >= 10 ? '' : 'disabled'}>구매</button></div>`;
  html += `</div><button onclick="closeModal('research-modal')">닫기</button>`;
  showModal('research-modal', html);
}
function buyResearch(type) {
  if (stars < 10) return;
  stars -= 10;
  if (type === 'helperBoost') research.helperBoost += 5;
  else if (type === 'houseBoost') research.houseBoost += 5;
  saveGame();
  showResearch();
  updateScreen();
}

// =================== 이벤트/랜덤박스 =====================
// 랜덤박스 쿨타임(초)
let randomBoxCooldown = 0; // 0이면 즉시 사용 가능

function showEvent() {
  let html = `<b>무료 랜덤박스</b><br>`;
  if (randomBoxCooldown > 0) {
    html += `<div>다음 랜덤박스까지: <span id="randombox-timer">${formatTime(randomBoxCooldown)}</span></div>`;
    html += `<button disabled>랜덤박스 열기</button>`;
  } else {
    html += `<button onclick="doEvent()">랜덤박스 열기</button>`;
  }
  html += `<br><button onclick="closeModal('event-modal')">닫기</button>`;
  showModal('event-modal', html);
}

// 랜덤박스 열기
function doEvent() {
  if (randomBoxCooldown > 0) return;
  eventActive = true;
  const rand = Math.random();
  if (rand < 0.5) {
    // 돈 획득
    const reward = Math.floor(Math.random() * 100000);
    money += reward;
    showPopup(`랜덤 박스 결과: 💰${formatNumber(reward)}원 획득!`);
  } else {
    // 버프 획득
    const buffType = Math.random() < 0.5 ? 'click' : 'auto';
    const buffAmount = Math.random() * 2 + 1; // 1~3배
    buff[buffType] *= buffAmount;
    buff.remain = 30; // 30초 지속
    showPopup(`랜덤 박스 결과: ${buffType === 'click' ? '클릭' : '자동'} 수익 x${buffAmount.toFixed(1)} 버프 획득! (30초)`);
  }
  saveGame();
  updateScreen();
  closeModal('event-modal');
  randomBoxCooldown = 1800; // 30분(1800초)
  setTimeout(() => { eventActive = false; }, 1000);
}

// 쿨타임 타이머 및 화면 갱신
setInterval(() => {
  if (randomBoxCooldown > 0) {
    randomBoxCooldown--;
    // 이벤트 모달이 열려 있으면 타이머 갱신
    const timerElem = document.getElementById('randombox-timer');
    if (timerElem) timerElem.innerText = formatTime(randomBoxCooldown);
    saveGame();
  }
}, 1000);

// 시간 포맷 함수 (mm:ss)
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// =================== 랭킹 =====================
function showRanking() {
  let html = `<b>랭킹 (최고 기록)</b><div class="rank-list">`;
  html += `<div>최고 자산: 💰${formatNumber(localRanking.maxMoney)}원</div>`;
  html += `<div>최다 클릭: ${formatNumber(localRanking.maxClick)}회</div>`;
  html += `<div>최고 환생: ${formatNumber(localRanking.maxPrestige)}회</div>`;
  html += `</div><button onclick="closeModal('ranking-modal')">닫기</button>`;
  showModal('ranking-modal', html);
}
function updateRanking() {
  if (money > localRanking.maxMoney) localRanking.maxMoney = money;
  if (clickCount > localRanking.maxClick) localRanking.maxClick = clickCount;
  if (prestige > localRanking.maxPrestige) localRanking.maxPrestige = prestige;
  saveGame();
}

// =================== 테마 변경 =====================
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  theme = 1 - theme;
  updateScreen();
  saveGame();
}

// =================== 효과음 =====================
function playClickSound() {
  if (!clickSoundOn) return;
  let click = document.getElementById('click-sound');
  if (!click) {
    click = document.createElement('audio');
    click.id = 'click-sound';
    click.src = "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4f6e.mp3";
    document.body.appendChild(click);
  }
  click.currentTime = 0;
  click.play();
}
function toggleBgm() {
  let bgm = document.getElementById('bgm');
  if (!bgm) {
    bgm = document.createElement('audio');
    bgm.id = 'bgm';
    bgm.src = "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4f6e.mp3";
    bgm.loop = true;
    document.body.appendChild(bgm);
  }
  bgmOn = !bgmOn;
  bgm.muted = !bgmOn;
  if (bgmOn) bgm.play();
  saveGame();
}

// ================== 리셋 =================
function resetGame() {
  if (!confirm("정말로 모든 데이터를 초기화하고 처음부터 시작하시겠습니까?")) return;
  localStorage.removeItem('idle_save');
  // 모든 변수 초기화
  money = 0;
  begLevel = 1;
  begAmount = 1;
  begUpgradeCost = 10;
  helper = 0;
  helperCost = 10000;
  helperIncomeBase = 1000;
  house = 0;
  houseCost = 500000;
  houseIncomeBase = 50000;
  prestige = 0;
  stars = 0;
  clickCount = 0;
  theme = 0;
  bgmOn = true;
  clickSoundOn = true;
  achievements.forEach(a => a.achieved = false);
  missions.forEach(m => m.done = false);
  missionProgress = { daily_click: 0, daily_helper: 0, daily_house: 0, lastDate: "" };
  allMissionsDone = false;
  prestigeBonus = 0;
  prestigeCostBase = 100000000;
  prestigeCostIncrement = 10000000;
  research = { helperBoost: 0, houseBoost: 0 };
  buff = { click: 1, auto: 1, remain: 0 };
  eventActive = false;
  localRanking = { maxMoney: 0, maxClick: 0, maxPrestige: 0 };
  randomBoxCooldown = 0;
  updateScreen("게임이 완전히 초기화되었습니다!");
  saveGame();
}


// =================== 모달 생성 =====================
function showModal(id, html) {
  let modal = document.getElementById(id);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = html;
  modal.style.display = 'block';
}

// =================== 초기화 =====================
window.onload = function() {
  loadGame();
  updateScreen();
  setInterval(updateRanking, 3000);
  let bgm = document.getElementById('bgm');
  if (!bgm) {
    bgm = document.createElement('audio');
    bgm.id = 'bgm';
    bgm.src = "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa4f6e.mp3";
    bgm.loop = true;
    bgm.muted = !bgmOn;
    document.body.appendChild(bgm);
    if (bgmOn) bgm.play();
  }
}
