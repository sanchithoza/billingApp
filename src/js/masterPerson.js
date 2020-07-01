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
    let type = $('#type').val();
    let name = $('#partyName').val();
    let address = $('#address').val();
    let state = $('#state').val();
    let gst = $('#gst').val();
    let pan = $('#pan').val();
    db.run("INSERT INTO person(type,name,address,state,gst,pan) VALUES(?,?,?,?,?,?)", [type, name, address, state, gst, pan], function(err) {
        if (err) {
            return $('#result').text(error);
        }
        $('#result').text("data inserted");
    });
});