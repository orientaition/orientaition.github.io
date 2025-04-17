// 전역 변수 선언
let money = 0;
let begLevel = 1;
let begAmount = 1;
let begUpgradeCost = 10;
let helper = 0;
let helperCost = 10000;
let house = 0;
let houseCost = 500000;

// 숫자 포맷 함수
function formatNumber(num) {
  return num.toLocaleString();
}

// 화면 갱신 함수
function updateScreen(msg) {
  document.getElementById("money").innerText = `💰 ${formatNumber(money)} 원`;
  document.getElementById("beg-level").innerText = begLevel;
  document.getElementById("helper-count").innerText = helper;
  document.getElementById("estate-count").innerText = house;
  document.getElementById("beg-amount-info").innerText = formatNumber(begAmount);
  document.getElementById("beg-upgrade-cost").innerText = formatNumber(begUpgradeCost);
  document.getElementById("helper-cost").innerText = formatNumber(helperCost);
  document.getElementById("house-cost").innerText = formatNumber(houseCost);
  if (msg) {
    document.getElementById("log").innerText = msg;
    setTimeout(() => {
      document.getElementById("log").innerText = "";
    }, 1500);
  }
}

// 구걸하기
function earnMoney() {
  money += begAmount;
  updateScreen();
}

// 구걸 업그레이드
function upgradeBeg() {
  if (money >= begUpgradeCost) {
    money -= begUpgradeCost;
    begLevel += 1;
    begAmount = Math.ceil(begAmount * 1.3);
    begUpgradeCost = Math.floor(begUpgradeCost * 1.7);
    updateScreen("구걸 레벨이 올랐습니다!");
  } else {
    updateScreen("돈이 부족합니다!");
  }
}

// 알바생 고용
function buyHelper() {
  if (money >= helperCost) {
    money -= helperCost;
    helper += 1;
    helperCost = Math.floor(helperCost * 1.8);
    updateScreen("알바생을 고용했습니다!");
  } else {
    updateScreen("돈이 부족합니다!");
  }
}

// 부동산 구매
function buyHouse() {
  if (money >= houseCost) {
    money -= houseCost;
    house += 1;
    houseCost = Math.floor(houseCost * 1.9);
    updateScreen("부동산을 구매했습니다!");
  } else {
    updateScreen("돈이 부족합니다!");
  }
}

// 자동 수익 (알바생, 부동산)
function autoIncome() {
  // 알바생: 1초당 100원씩, 부동산: 1초당 1000원씩
  let helperIncome = helper * 100;
  let houseIncome = house * 1000;
  money += helperIncome + houseIncome;
  document.getElementById("sec-income-info").innerText = formatNumber(helperIncome + houseIncome);
  updateScreen();
}

// 1초마다 자동 수익
setInterval(autoIncome, 1000);

// 페이지 로드시 초기화
window.onload = function() {
  updateScreen();
}
