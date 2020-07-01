//const main = require('../main');
const $ = require('jquery');
const db = require('./../db/config');
document.addEventListener('DOMContentLoaded',pageLoaded);
function pageLoaded(){
    //alert('The page is loade');
    //ipcRenderer.send('Am_I_Ready',"Im ready");
}
$('#submit').on('click',()=>{
    //alert($('#username').val());
    let type = $('#type').val();
    let grade = $('#grade').val();
    let size = $('#size').val();
    let rate = $('#rate').val();
    let mrp = $('#mrp').val();
    db.run("INSERT INTO product(type,grade,size,rate,mrp) VALUES(?,?,?,?,?)", [type,grade,size,rate,mrp], function(err) {
        if (err) {
          return $('#result').text(error);
        }
        $('#result').text("data inserted");
    });
});