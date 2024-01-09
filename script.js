var path = './data.json';

var themes = [{
    name: 'train-station',
    numbers: [
        {
            number: 682,
            description: 'train cars',
            detail: 'on the longest train in the world',
            source: 'http://en.wikipedia.org/wiki/Longest_trains'
        }, {
            number: 853,
            description: 'people',
            detail: 'capacity of the largest commercial airplane',
            source: 'http://en.wikipedia.org/wiki/Airbus_A380'
        }
    ]
}]

const el = document.getElementById('odometer');//.innerHTML = Math.floor(Math.random() * 1000) + 1;
const od = new Odometer({
    el: el,
    format: 'd',
    duration: 2000,
    minIntegerLen: 7,
    theme: 'train-station'
});



function setOdometer(mnv) {
    od.update(mnv)
}

const getCandidates = async (dirFile) => {

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
const main = async () => {
    const candidates = await getCandidates(path)
    var rewardedMenberList = [];
    // const candidates = [
    //     {
    //      "Name": "LÊ HIỆU HỮU",
    //      "MNV": "80248",
    //      "Year": 1994,
    //      "Place": "Quảng Ngãi",
    //      "Department": "Bộ phận Kho"
    //     }]


    $(document).ready(function () {
        $("#draw-btn").click(async function () {
            let ratioForIT = parseInt($("#ratio-for-it").val()) / 100.0;

            const selectedMenber = selectRandomMember(candidates, rewardedMenberList, ratioForIT);
            rewardedMenberList.push(selectedMenber)

            setOdometer(0)
            await delay(1000)

            setOdometer(selectedMenber.MNV)

            await delay(2000)


            let result = rewardedMenberList.map(menber => `<li>congratulation to ${menber.Name} - ${menber.MNV} - ${menber.Department} to get reward</li>`).join('');
            $("#result").html(result);

            $('#modal-text').html(`Congratulations to ${selectedMenber.Name} - ${selectedMenber.MNV} - ${selectedMenber.Department} to get reward!`);
            $('#modal-p').html(`Congratulations to ${selectedMenber.Name} - ${selectedMenber.MNV} - ${selectedMenber.Department} to get reward!`);

            $('#modal-container').removeAttr('class').addClass('one');
            $('body').addClass('modal-active');
        });
    });
}

$('#modal-container').click(function () {
    $(this).addClass('out');
    $('body').removeClass('modal-active');
});

main()
