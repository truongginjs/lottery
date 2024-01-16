const path = "./resources/data.json";
var audio = new Audio("./resources/music.mp3");
var audiospin = new Audio("./resources/spin.mp3");
var audio2000 = new Audio("./resources/2000.mp3");
var audiohuu = new Audio("./resources/huu.mp3");

audio.loop = true;
audiospin.loop = true;
// audio2000.loop = true;
// audiohuu.loop = true;
function fade() {
  audio.pause();
}
const REWARD = [
  { message: "GIẢI KHUYẾN KHÍCH", count: 0, rewardedMenberList: [] },
  { message: "GIẢI BA", count: 0, rewardedMenberList: [] },
  { message: "GIẢI NHÌ", count: 0, rewardedMenberList: [] },
  { message: "GIẢI NHẤT", count: 0, rewardedMenberList: [] },
  { message: "GIẢI ĐẶC BIỆT", count: 0, rewardedMenberList: [], spec: true },
//   { message: "GIẢI CHƠI MỘT MÌNH", count: 0, rewardedMenberList: [] },
];
let indexReward = 0;

let members = [];
let rewardedMenberList = [];

const el = document.getElementById("odometer"); //.innerHTML = Math.floor(Math.random() * 1000) + 1;
const od = new Odometer({
  el: el,
  format: "d",
  duration: 2000,
  minIntegerLen: 7,
  theme: "train-station",
});

async function fetchApi() {
  try {
    const [response1, response2, response3] = await Promise.all([
      fetch(`https://lottery.ginjs.click/rate`),
      fetch(`https://lottery.ginjs.click/department`),
      fetch(`https://lottery.ginjs.click/id`),
    ]);

    const [currentrateText, currentDepartmentText, currentIdText] =
      await Promise.all([response1.text(), response2.text(), response3.text()]);

    const currentrate = parseInt(currentrateText) / 100.0;

    return {
      rate: currentrate,
      department: currentDepartmentText,
      id: currentIdText,
    };
  } catch (e) {
    throw e;
  }
}

function setOdometer(ID) {
  od.update(ID);
}

const getMembers = async (dirFile) => {
  let rs = null;
  try {
    const response = await fetch(dirFile);
    const json = await response.json();
    rs = json;
  } catch (e) {
    throw e;
  }
  return rs;
};

const selectRandomMember = async (
  candidates,
  rewardedMenberList,
  ratioForIT
) => {
  let { rate, department, id } = await fetchApi();

  candidates = candidates.filter((c) => !rewardedMenberList.includes(c));
  const totalMenbers = candidates.length;

  const itMenbersArray =
    id == "0"
      ? candidates.filter((c) => c.Department === department)
      : candidates.filter((value) => {
          return value.ID == id;
        });

  const menbersInDept = itMenbersArray.length;

  if (department == "all") {
    rate = 0;
  }

  if (id != "0") {
    rate = 1;
    await fetch(`https://lottery.ginjs.click/id/0`);
  }

  const numOfMenbersInDept = totalMenbers - menbersInDept;

  const NonDeptMenbersArray = candidates.filter(
    (c) => c.Department !== department
  );

  const nonITMenbersIndex = Math.floor(Math.random() * numOfMenbersInDept);
  const selectedNonDeptMenber = NonDeptMenbersArray[nonITMenbersIndex];

  if (Math.random() < rate && menbersInDept > 0) {
    const itMenbersIndex = Math.floor(Math.random() * menbersInDept);
    const selecteddeptMenber = itMenbersArray[itMenbersIndex];

    return selecteddeptMenber;
  } else {
    return selectedNonDeptMenber;
  }
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const renderReward = () => {
    resultName.innerHTML = `<div class="col d-flex justify-content-center align-items-center font-weight-bold" style="color: red; font-size: 24px">${REWARD[indexReward].message}</div>`;
    resultListElement.innerHTML = "";
    REWARD[indexReward].rewardedMenberList.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.className =
        "d-flex justify-content-start align-items-center text-white";
      listItem.style.fontSize = "20px";
      listItem.textContent = `${index + 1}) ${item.Name} - ${item.ID} - ${
        item.Department
      }`;
      const listItemWrapper = document.createElement("ul");
      listItemWrapper.className = "col-6";
      listItemWrapper.appendChild(listItem);
      resultListElement.appendChild(listItemWrapper);
    });
}

let loop = false;
let spinNum = null;
let trueNum = null;
const resultListElement = document.getElementById("result");
const randomRewarded = document.getElementById("randomRewarded");
const resultName = document.getElementById("resultName");

$(document).ready(function () {
  const rateEle = $("#rate-for-it");

  $(this).keydown(function (e) {
    const code = e.code;
    console.log(code, loop)
    if (code == "KeyS") {
      e.preventDefault();   
      if (!loop) randomRewarded.click()
      else {
        loop = false;
        randomRewarded.className = 'btn btn-success'
      }
    }

    if (code == "Space") {
      e.preventDefault();
      console.log('spinNumL: ', spinNum)
      if (!spinNum) return;
      for (let i = 0; i < spinNum.length; i++) {
        const v = spinNum[i];
        if (v < 0) {
            
            spinNum[i] = trueNum[i];
            break;
        }
        if(spinNum[5] == 0 )  randomRewarded.className = 'btn btn-success'
      }
    }

    if (code.startsWith("Digit")) {
      e.preventDefault();
      const k = parseInt(code.slice(-1));
      if (k < 6) {
        $(`#option-reward input#option${k}`).trigger("click");
      }
    }
  });

  $("#modal-container").click(function () {
    $(this).addClass("out");
    $("body").removeClass("modal-active");
    fade();
    stopConfetti();
  });

  $("#option-reward input").click(function () {
    $(this).attr("checked", "true");
    const t = $(this).attr("id");
    var num = t.slice(-1);
    rate = parseInt(num * 1.5 + 1) * 10;
    indexReward = num - 1;
    renderReward();
    rateEle.val(rate);
  });

  $("#randomRewarded").click(async function () {
    randomRewarded.className = 'btn btn-danger'
    console.log(loop)
    if (loop) {
      loop = false;
        randomRewarded.className = 'btn btn-success'
      return;
    }
    audiospin.volume = 1;
    audiospin.currentTime = 0;
    audiospin.play();

    const selectedMenber = await selectRandomMember(
      members,
      rewardedMenberList
    );
    const num = selectedMenber.ID.replace(/[A-Za-z]+/, "");
    trueNum = [...num.toString().padStart(7, "0")];
    trueNum.sort();
    spinNum = trueNum.map((x) => -1);
    rewardedMenberList.push(selectedMenber);

    await loopSpinning();

    if (spinNum.every((x) => parseInt(x) >= 0)) {
      audiospin.pause();
      audiohuu.currentTime = 0;
      audiohuu.play();
      await delay(2000);
    }

    setOdometer(num);
    await delay(spinNum.every((x) => x >= 0) ? 2000 : 2000);

    if (spinNum.every((x) => parseInt(x) >= 0)) {
      audiohuu.pause();
    } else {
      audiospin.pause();
    }

    setReward(selectedMenber);
  });

  async function loopSpinning() {
    loop = true;
    let num1 = 0;
    let num2 = 5;
    let num3 = 9;

    while (loop && spinNum.some((x) => x < 0)) {
      setOdometer(setStep(num1));
      await delay(1000);
      setOdometer(setStep(num3));
      await delay(1000);
    }
  }

  function setStep(num) {
    let result = parseInt(spinNum.map((x) => (x < 0 ? num : x)).join(""));
    return result;
  }

  async function setReward(selectedMenber) {
    REWARD[indexReward].count++;
    REWARD[indexReward].rewardedMenberList.push(selectedMenber);
    resultListElement.innerHTML = "";
    renderReward();
    console.log(REWARD);

    $("#modal-text").html(
      `Congratulations to ${selectedMenber.Name} - ${selectedMenber.ID} - ${selectedMenber.Department}!`
    );
    $("#modal-p").html(`${REWARD[indexReward].message}`);

    const numImg = Math.floor(Math.random() * 5) + 1;

    const l = selectedMenber.Avatar
      ? `./images/${selectedMenber.Avatar}`
      : `./resources/dog${numImg}.gif`;
    $("#avatar").attr("src", l);
    $("#img-left").attr("src", `./resources/cat${numImg}.gif`);
    $("#img-right").attr("src", `./resources/cat${numImg - 1}.gif`);

    $("#modal-container").removeAttr("class").addClass("one");
    $("body").addClass("modal-active");
    startConfetti();
    audio.volume = 1;
    audio.currentTime = 0;
    audio.play();
  }
});

const execute = async () => {
  members = await getMembers(path);
};

execute();

const summaryButton = document.getElementById("summary");
const modalTableResult = document.getElementById("bd-example-modal-result-sm")
if (summaryButton) {
  summaryButton.addEventListener("click", () => {
      const rewardedRows = (listPer) => listPer.map((per, index) => {
          return (
              `<tr>
                  <th scope="row">${index + 1}</th>
                  <td>${per.Name}</td>
                  <td>${per.ID}</td>
                  <td>${per.Department}</td>
              </tr>`
          );
      });
    const contentModal =  REWARD.map((item, index) => {
        return (`<tr class = "${item.spec ? "bg-danger" : "bg-info"} text-light ">
                    <th colspan="4">${item.message}</th>
                </tr>
                ${rewardedRows(item.rewardedMenberList).join('')}
            `
        )
    });
    modalTableResult.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header border-0 bg-warning">
                    <h5 class="modal-title w-100 d-flex justify-content-center font-weight-bold text-danger " style="font-size: 30px" id="exampleModalLabel">KẾT QUẢ</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body pt-0">
                    <table class="table table-striped">
                        <thead>
                        <tr>
                            <th class="border-top-0" scope="col">#</th>
                            <th class="border-top-0" scope="col">Họ và tên</th>
                            <th class="border-top-0" scope="col">Mã số nhân viên</th>
                            <th class="border-top-0" scope="col">Phòng</th>
                        </tr>
                        </thead>
                        <tbody>
                            ${contentModal.join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
    
  });
}
