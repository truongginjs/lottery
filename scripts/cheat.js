const path = './resources/data.json';

$(document).ready(async function () {
    const response = await fetch(path)

    const db = await response.json()

    let departments = db.map(x => x.Department).filter((value, index, array) => array.indexOf(value) === index);
    const Default = 'all';
    departments = [Default, ...departments]
    let members = db.map(x => ({ ID: x.ID, Name: x.Name }))
    members = [{ ID: 0, Name: Default }, ...members]
    const response1 = await fetch(`https://lottery.ginjs.click/rate`);
    const response2 = await fetch(`https://lottery.ginjs.click/department`);
    const response3 = await fetch(`https://lottery.ginjs.click/id`);

    const currentrate = parseInt(await response1.text())
    const currentDepartment = await response2.text()
    const currentId = await response3.text()

    $('#percent').val(currentrate);

    $('select#set-dept').html(
        departments.map(department => `<option value="${department}" ${currentDepartment == department ? "selected" : ""}>${department}</option>`).join('')
    );

    $('select#set-id').html(
        members.map(member => `<option value="${member.ID}" ${currentId == member.ID ? "selected" : ""}>${member.Name}</option>`).join('')
    );

    $('#set-rate').click(async function () {
        const t = $('#percent').val()
        if(!t) return
        const response = await fetch(`https://lottery.ginjs.click/rate/${t}`);
        const data = await response.text();
        alert(data)
    })


    $('#set-dept').change(async function(){
        var t = $(this).val();
        if(!t) return
        const response = await fetch(`https://lottery.ginjs.click/department/set?department=${t}`);
        const data = await response.text();
        alert(data)
    })
    

    $('#set-id').change(async function () {
        var t = $(this).val();
        if(!t) return
        const response = await fetch(`https://lottery.ginjs.click/id/${t}`);
        const data = await response.text();
        alert(data)
    })
})