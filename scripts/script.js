const path = './resources/data.json';
var audio = new Audio('./resources/music.mp3');
var audiospin = new Audio('./resources/spin.mp3');
var audio2000 = new Audio('./resources/2000.mp3');
var audiohuu = new Audio('./resources/huu.mp3');

audio.loop = true;
audiospin.loop = true;
audio2000.loop = true;
audiohuu.loop = true;
function fade() {
    audio.pause();
}
const REWARD_MESSAGES = [
    { message: "GIẢI KHUYẾN KHÍCH", count: 0 },
    { message: "GIẢI BA", count: 0 },
    { message: "GIẢI NHÌ", count: 0 },
    { message: "GIẢI NHẤT", count: 0 },
    { message: "GIẢI ĐẶC BIỆT", count: 0 },
    { message: "GIẢI CHƠI MỘT MÌNH", count: 0 },
]
let indexReward = 0;//REWARD_MESSAGES[0].message

let listMessage = []

let members = []
let rewardedMenberList = [];

const el = document.getElementById('odometer');//.innerHTML = Math.floor(Math.random() * 1000) + 1;
const od = new Odometer({
    el: el,
    format: 'd',
    duration: 2000,
    minIntegerLen: 7,
    theme: 'train-station'
});


async function fetchApi() {
    try {
        const [response1, response2, response3] = await Promise.all([
            fetch(`https://lottery.ginjs.click/rate`),
            fetch(`https://lottery.ginjs.click/department`),
            fetch(`https://lottery.ginjs.click/id`)
        ]);

        const [currentrateText, currentDepartmentText, currentIdText] = await Promise.all([
            response1.text(),
            response2.text(),
            response3.text()
        ]);

        const currentrate = parseInt(currentrateText) / 100.0;

        return {
            rate: currentrate,
            department: currentDepartmentText,
            id: currentIdText
        };

    } catch (e) {
        throw e;
    }
}

function setOdometer(ID) {
    od.update(ID)
}

const getMembers = async (dirFile) => {

    let rs = null;
    try {
        const response = await fetch(dirFile)
        const json = await response.json()
        rs = json

    } catch (e) {
        throw e
    }
    return rs;
}

const selectRandomMember = async (candidates, rewardedMenberList, ratioForIT) => {

    let { rate, department, id } = await fetchApi()

    candidates = candidates.filter(c => !rewardedMenberList.includes(c))
    const totalMenbers = candidates.length;

    const itMenbersArray = id == '0' ?
        candidates.filter(c => c.Department === department) :
        candidates.filter((value) => { return value.ID == id })

    const menbersInDept = itMenbersArray.length

    if (department == 'all') {
        rate = 0
    }

    if (id != '0') {
        rate = 1;
        await fetch(`https://lottery.ginjs.click/id/0`)
    }

    const numOfMenbersInDept = totalMenbers - menbersInDept;

    const NonDeptMenbersArray = candidates.filter(c => c.Department !== department);

    const nonITMenbersIndex = Math.floor(Math.random() * numOfMenbersInDept);
    const selectedNonDeptMenber = NonDeptMenbersArray[nonITMenbersIndex];

    if (Math.random() < rate && menbersInDept > 0) {

        const itMenbersIndex = Math.floor(Math.random() * menbersInDept);
        const selecteddeptMenber = itMenbersArray[itMenbersIndex];

        return selecteddeptMenber;
    } else {
        return selectedNonDeptMenber;
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));





let loop = false;
let spinNum = null
let trueNum = null;

$(document).ready(function () {
    const rateEle = $("#rate-for-it");

    $(this).keydown(function (e) {
        const code = e.code
        console.log(code)
        if (code == 'KeyS') {
            e.preventDefault();
            if ($('body').hasClass('modal-active')) {
                $('#modal-container').trigger('click')
                return;
            }
            if (!loop)
                $("#draw-btn").trigger('click');
            else
                loop = false;
        }

        if (code == 'Space') {
            e.preventDefault();
            for (let i = 0; i < spinNum.length; i++) {
                const v = spinNum[i];
                if (v < 0) {
                    spinNum[i] = trueNum[i];
                    break;
                }
            }
        }

        if (code.startsWith('Digit')) {
            e.preventDefault();
            const k = parseInt(code.slice(-1))
            if (k < 6) {
                $(`#option-reward input#option${k}`).trigger('click')
            }
        }
    });

    $('#modal-container').click(function () {
        $(this).addClass('out');
        $('body').removeClass('modal-active');
        fade()
        stopConfetti();
    });

    $("#option-reward input").click(function () {
        $(this).attr('checked', 'true');
        const t = $(this).attr('id')
        var num = t.slice(-1)
        rate = parseInt(num * 1.5 + 1) * 10
        indexReward = num - 1// REWARD_MESSAGES[num - 1].message;
        rateEle.val(rate)
        console.log(rate)
    })

    $("#draw-btn").click(async function () {
        if (loop) {
            loop = false;
            return;
        }
        audiospin.volume = 1;
        audiospin.currentTime = 0;
        audiospin.play();

        const selectedMenber = await selectRandomMember(members, rewardedMenberList);
        const num = selectedMenber.ID.replace(/[A-Za-z]+/, '')
        trueNum = [...num.toString().padStart(7, '0')]
        spinNum = trueNum.map(x => -1)
        rewardedMenberList.push(selectedMenber)

        await loopSpinning();
        setOdometer(num)
        await delay(spinNum.every(x => x >= 0) ? 500 : 2000)
        audiospin.pause();



        setReward(selectedMenber);


    });

    async function loopSpinning() {
        loop = true;
        let num1 = 0
        let num2 = 5
        let num3 = 9

        while (loop && spinNum.some(x => x < 0)) {
            setOdometer(setStep(num1));
            await delay(1000);
            setOdometer(setStep(num3));
            await delay(1000);
        }
    }

    function setStep(num) {
        let result = parseInt(spinNum.map(x => x < 0 ? num : x).join(''))
        return result
    }

    async function setReward(selectedMenber) {
        REWARD_MESSAGES[indexReward].count++

        listMessage.push(`${REWARD_MESSAGES[indexReward].count}) ${REWARD_MESSAGES[indexReward].message}: ${selectedMenber.Name} - ${selectedMenber.ID} - ${selectedMenber.Department}`)
        let temp = listMessage.map(x => `<li class="list-group-item list-group-item-success">${x}</li>`)
        var temp2 = []
        const chunkSize = 5;
        for (let i = 0; i < temp.length; i += chunkSize) {
            const chunk = temp.slice(i, i + chunkSize);
            temp2.push(`<div class="col-sm"></ul class="list-group">${chunk.join('')}</ul></div>`)
        }
        const result = ` <div class="container"><div class="row">
        ${temp2.join('')}
        </div></div>`

        $("#result").html(result);

        $('#modal-text').html(`Congratulations to ${selectedMenber.Name} - ${selectedMenber.ID} - ${selectedMenber.Department}!`);
        $('#modal-p').html(`${REWARD_MESSAGES[indexReward].message}`);

        const numImg = Math.floor(Math.random() * 5) + 1

        const l = selectedMenber.Avatar ? `./images/${selectedMenber.Avatar}` : `./resources/dog${numImg}.gif`;
        $('#avatar').attr('src', l)
        $('#img-left').attr('src', `./resources/cat${numImg}.gif`)
        $('#img-right').attr('src', `./resources/cat${numImg - 1}.gif`)




        $('#modal-container').removeAttr('class').addClass('one');
        $('body').addClass('modal-active');
        startConfetti();
        audio.volume = 1;
        audio.currentTime = 0;
        audio.play();
    }
});

// const image = [
//     "111125.jpeg",
//     "111125.jpg",
//     "111127.png",
//     "114671.jpg",
//     "117499.jpg",
//     "117934.jpg",
//     "118478.jpg",
//     "118478.png",
//     "119102.jpg",
//     "120700.jpg",
//     "120960.jpg",
//     "120980.jpg",
//     "121246.jpg",
//     "121487.jpg",
//     "121488.JPEG",
//     "121488.png",
//     "122077.jpg",
//     "40174.jpg",
//     "40720.jpg",
//     "41179.jpg",
//     "43455.jpg",
//     "44690.jpeg",
//     "44708.jpg",
//     "45425.jpg",
//     "45544.jpg",
//     "46798.jpg",
//     "73657.jpg",
//     "8008489.jpg",
//     "8008913.jpg",
//     "8009259.jpg",
//     "8010678.jpg",
//     "8013888.jpg",
//     "8019035.jpg",
//     "8023775.jpg",
//     "8023850.jpg",
//     "8024701.jpg",
//     "81006.jpg",
//     "81935.jpg",
//     "85354.jpg",
//     "86254.jpg",
//     "92982.jpg",
//     "93040.jpg",
//     "VCB01.jpg",
//     "VCB02.jpg",
//     "VCB03.jpg",
//     "VCB04.jpg",
//     "VCB05.jpg",
//     "VCB06.jpg",
//     "VCB07.jpg",
// ]
const execute = async () => {
    members = await getMembers(path)
    // const tt = members.map(x => ({ ...x, 'Avatar': image.find(i => i.split('.')[0] == x.ID) }))
    // console.log(JSON.stringify(tt))
}


execute()


