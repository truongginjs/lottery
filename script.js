const path = './data.json';
var audio = new Audio('./resources/music.mp3');
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
    duration: 5000,
    minIntegerLen: 7,
    theme: 'train-station'
});

const rateEle = $("#rate-for-it");


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


$('#modal-container').click(function () {
    $(this).addClass('out');
    $('body').removeClass('modal-active');
    audio.pause();
    audio.currentTime = 0;
});


$(document).ready(function () {
    $("#draw-btn").click(async function () {
        let ratioForIT = parseInt(rateEle.val()) / 100.0;

        const selectedMenber = selectRandomMember(members, rewardedMenberList, ratioForIT);
        rewardedMenberList.push(selectedMenber)

        setOdometer(0)
        await delay(1000)
        setOdometer(9999999)
        await delay(1500)
        setOdometer(5555555)
        await delay(1500)

        setOdometer(selectedMenber.MNV)

        await delay(2000)



        let result = rewardedMenberList.map(menber => `<li>congratulation to ${menber.Name} - ${menber.MNV} - ${menber.Department} ${message}</li>`).join('');
        $("#result").html(result);

        $('#modal-text').html(`Congratulations to ${selectedMenber.Name} - ${selectedMenber.MNV} - ${selectedMenber.Department}!`);
        $('#modal-p').html(`Bạn đã nhận được ${message}`);

        $('#modal-container').removeAttr('class').addClass('one');
        $('body').addClass('modal-active');

        audio.play();
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
});

const execute = async () => {
    members = await getMembers(path)
}


execute()
