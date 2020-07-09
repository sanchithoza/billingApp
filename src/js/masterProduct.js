//const main = require('../main');
const $ = require('jquery');
const db = require('./../db/config');
document.addEventListener('DOMContentLoaded', pageLoaded);

function pageLoaded() {
    //alert('The page is loade');
    //ipcRenderer.send('Am_I_Ready',"Im ready");
}
$('#submit').on('click', () => {
    //alert($('#username').val());
    let name = $('#proName').val();
    let type = $('#type').val();
    let grade = $('#grade').val();
    let size = $('#size').val();
    let rate = $('#rate').val();
    let mrp = $('#mrp').val();
    console.log(name);

    db.run("INSERT INTO product(name,type,grade,size,rate,mrp) VALUES(?,?,?,?,?,?)", [name, type, grade, size, rate, mrp], function(err) {
        if (err) {
            return console.log(err);
        }
        $('#result').text("data inserted");
    });
});