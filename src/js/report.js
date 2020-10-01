//const $ = require('jquery');
var dt = require('datatables.net')();
var buttons = require('datatables.net-dt')();
//const { dialog } = require('electron').remote;
const db = require('./../db/config');
//const { Callbacks } = require('jquery');

let transType;
let data1;
$(async function() {
    let urlParams = getUrlParams(location.search);
    transType = urlParams.type;
    console.log(transType);
    $('#transactionHeader').append(`${transType} Records`)
    data1 = await fillRecord(transType);

    setTimeout(() => {
        console.log(data1);
        $('#example').DataTable({
            data: data1,
            columns: [
                { title: "Id" },
                { title: "Date" },
                { title: "Party" },
                { title: "Mode" },
                { title: "Gross Amount" },
                { title: "Edit/Delete" },
            ]
        });
    }, 1000);

});



function getUrlParams(urlOrQueryString) {
    if ((i = urlOrQueryString.indexOf('?')) >= 0) {
        const queryString = urlOrQueryString.substring(i + 1);
        if (queryString) {
            return _mapUrlParams(queryString);
        }
    }

    return {};
}

function _mapUrlParams(queryString) {
    return queryString
        .split('&')
        .map(function(keyValueString) { return keyValueString.split('=') })
        .reduce(function(urlParams, [key, value]) {
            if (Number.isInteger(parseInt(value)) && parseInt(value) == value) {
                urlParams[key] = parseInt(value);
            } else {
                urlParams[key] = decodeURI(value);
            }
            return urlParams;
        }, {});
}

async function fillRecord(type) {
    let data = [];
    await db.each(`SELECT id,onDate,personID,payment,grossAmt,type FROM transactions WHERE type = "${type}"`, async function(err, row) {
        //console.log(row.id);
        let name = await getPerson(row.personID);
        console.log(name);
        let rowArray = [];
        rowArray.push(row.id);
        rowArray.push(row.onDate);
        rowArray.push(name);
        rowArray.push(row.payment);
        rowArray.push(row.grossAmt);
        rowArray.push(`<a href="" class="editor_edit">Edit</a> / <a href="" class="editor_remove">Delete</a>`)
        data.push(rowArray)

        /*   $row =   $('#records').append(`<tr> <td>${row.id}</td><td>${row.onDate} </td><td>${row.personID} </td><td>${row.payment} </td><td>${row.grossAmt} </td></tr>`);
           
         var table = $('#example').DataTable();
           table.row.add({
               "id": row.id,
               "Date": row.onDate,
               "Party": row.personID,
               "Mode": row.payment,
               "Gross Amount": row.grossAmt
           }).draw();*/
    });
    console.log(data);
    return data;
}

function getPerson(personID) {
    return new Promise(async(resolve) => {
        await db.get(`SELECT name FROM person WHERE id = ${personID}`, async function name(err, row) {
            resolve(row.name);
        });
    })

}