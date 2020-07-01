//const main = require('../main');
const {ipcRenderer} = require('electron');
const $ = require('jquery');
const db = require('./../db/config');
document.addEventListener('DOMContentLoaded',pageLoaded);
function pageLoaded(){
    //alert('The page is loade');
    //ipcRenderer.send('Am_I_Ready',"Im ready");
}
$('#submit').on('click',()=>{
    //alert($('#username').val());
    let name = $('#username').val();
    let password = $('#password').val();
    db.run("INSERT INTO appuser(username,password) VALUES(?,?)", [name,password], function(err) {
        if (err) {
          return $('#result').text(error);
        }
        $('#result').text("data inserted");
    });
});