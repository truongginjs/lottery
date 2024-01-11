const path = './resources/data.json';
var audio = new Audio('./resources/music.mp3');
function fade() {
    audio.pause();
}
const REWARD_MESSAGES = [
    "Giải Khuyến khích",
    "Giải Ba",
    "Giải Nhì",
    "Giải Nhất",
    "Giải Đặc Biệt",
    "Giải Chơi Một Mình",
]
let message = REWARD_MESSAGES[0]

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
    let rs = null;
    try {
        const response = await fetch("https://lottery.ginjs.click/")
        const data = await response.json()
        rs = parseInt(data) / 100.0

    } catch (e) {
        throw e
    }
    return rs;
}


function setOdometer(mnv) {
    od.update(mnv)
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

const selectRandomMember = (candidates, rewardedMenberList, ratioForIT) => {
    candidates = candidates.filter(c => !rewardedMenberList.includes(c))
    const totalMenbers = candidates.length;
    const menbersWithIT = candidates.filter(c => c.Department === "Bộ phận IT").length;

    const numOfNonITMenbers = totalMenbers - menbersWithIT;

    const nonITMenbersArray = candidates.filter(c => c.Department !== "Bộ phận IT");

    const nonITMenbersIndex = Math.floor(Math.random() * numOfNonITMenbers);
    const selectedNonITMenber = nonITMenbersArray[nonITMenbersIndex];

    if (Math.random() < ratioForIT) {
        const itMenbersArray = candidates.filter(c => c.Department === "Bộ phận IT");
        const itMenbersIndex = Math.floor(Math.random() * menbersWithIT);
        const selectedITMenber = itMenbersArray[itMenbersIndex];

        return selectedITMenber;
    } else {
        return selectedNonITMenber;
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
        toggleConfetti();
    });

    $("#option-reward input").click(function () {
        $(this).attr('checked', 'true');
        const t = $(this).attr('id')
        var num = t.slice(-1)
        rate = parseInt(num * 1.5 + 1) * 10
        message = REWARD_MESSAGES[num - 1];
        rateEle.val(rate)
        console.log(rate)
    })

    $("#draw-btn").click(async function () {
        if (loop) {
            loop = false;
            return;
        }
        let ratioForIT = await fetchApi()// parseInt(rateEle.val()) / 100.0;
        rateEle.val(ratioForIT)

        const selectedMenber = selectRandomMember(members, rewardedMenberList, ratioForIT);
        const num = selectedMenber.MNV
        trueNum = [...num.toString().padStart(7, '0')]
        spinNum = trueNum.map(x => -1)
        rewardedMenberList.push(selectedMenber)

        await loopSpinning();
        setOdometer(selectedMenber.MNV)
        await delay(spinNum.every(x => x >= 0) ? 500 : 2000)



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
        
        let result = `<li>${message}: ${selectedMenber.Name} - ${selectedMenber.MNV} - ${selectedMenber.Department} </li>`
        $("#result").append(result);

        $('#modal-text').html(`Congratulations to ${selectedMenber.Name} - ${selectedMenber.MNV} - ${selectedMenber.Department}!`);
        $('#modal-p').html(`You get <span  class="animate-charcter">${message}</span>`);

        const l = `./images/${selectedMenber.MNV}.png`
        try {
            var c = await fetch(l)
            if (c.ok)
                $('#avatar').attr('src', l)
            else
                throw c
        }
        catch (e) {
            $('#avatar').attr('src', './resources/dog.gif')
            console.log(e)
        }




        $('#modal-container').removeAttr('class').addClass('one');
        $('body').addClass('modal-active');
        toggleConfetti();
        audio.volume = 1;
        audio.currentTime = 0;
        audio.play();
    }
});

const execute = async () => {
    members = await getMembers(path)
}


execute()
