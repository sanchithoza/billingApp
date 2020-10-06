//const $ = require('jquery');
var dt = require('datatables.net')();
var buttons = require('datatables.net-dt')();
//const { dialog } = require('electron').remote;
const db = require('./../db/config');
const { dialog } = require('electron').remote;
//const { Callbacks } = require('jquery');

let transType;
let data1;
$(async function() {
    let urlParams = getUrlParams(location.search);
    transType = urlParams.type;
    console.log(transType);
    $('#transactionHeader').append(`${transType} Records`)
    if (transType == "Stock") {
        console.log("in");
        data1 = await getStock();
        setTimeout(() => {
            console.log(data1);
            $('#example').DataTable({
                data: data1,
                columns: [
                    { title: "View" },
                    { title: "Id" },
                    { title: "Product Name" },
                    { title: "Batch" },
                    { title: "Available Stock" },

                    { title: "Edit/Delete" },
                ]
            });
        }, 1000);
    } else {
        data1 = await fillRecord(transType);
        setTimeout(() => {
            console.log(data1);
            $('#example').DataTable({
                data: data1,
                columns: [
                    { title: "View" },
                    { title: "Id" },
                    { title: "Date" },
                    { title: "Party" },
                    { title: "Mode" },
                    { title: "Gross Amount" },
                    { title: "Edit/Delete" },
                ]
            });
        }, 1000);
    }


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
        rowArray.push(`<a id="view_${row.id}" class="editor_edit" href="javascript:viewRecord(${row.id});">View</a>`)
        rowArray.push(row.id);
        rowArray.push(row.onDate);
        rowArray.push(name);
        rowArray.push(row.payment);
        rowArray.push(row.grossAmt);
        rowArray.push(`<a id="edit_${row.id}" class="editor_edit" href="javascript:editRecord(${row.id});">Edit</a> / <a class="editor_remove"  href="javascript:deleteRecord(${row.id});">Delete</a>`)
        data.push(rowArray);
    });
    console.log(data);
    return data;
}
async function getStock() {
    let data = [];
    await db.each(`SELECT DISTINCT productId,id,batchNo,availStock FROM inventory GROUP BY productId`, async function(err, row) {
        //console.log(row.id);
        let name = await getProduct(row.productId);
        console.log(name);
        let rowArray = [];
        rowArray.push(`<a id="view_${row.id}" class="editor_edit" href="javascript:viewRecord(${row.id});">View</a>`)
        rowArray.push(row.id);
        rowArray.push(name);
        rowArray.push(row.batchNo);
        rowArray.push(row.availStock);
        //rowArray.push(row.grossAmt);
        rowArray.push(`<a id="edit_${row.id}" class="editor_edit" href="javascript:editRecord(${row.id});">Edit</a> / <a class="editor_remove"  href="javascript:deleteRecord(${row.id});">Delete</a>`)
        data.push(rowArray)

    });
    console.log(data);
    return data;
}

function editRecord(id) {
    console.log(id);
    window.location = `transaction.html?tid=${id}&type=${transType}`;
}

async function deleteRecord(id) {
    console.log(id);
    let response = dialog.showMessageBoxSync({
        buttons: ["YES", "NO"],
        message: `${id} Delete ????`
    })

    console.log(response);
    if (response == 0) {
        await db.run(`DELETE FROM transactionDetail WHERE transactionId=?`, id, async function(err) {

            if (err) {
                return console.error(err.message);
            }
            await db.run(`DELETE FROM transactions WHERE id=?`, id, async function(err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Row(s) deleted ${this.changes}`);
                location.reload()
            })

        });
    } else {

    }
}

function viewRecord(id) {
    console.log(`view ${id}`);
    window.location = `invoice.html?tid=${id}`;
}

function getPerson(personID) {
    return new Promise(async(resolve) => {
        await db.get(`SELECT name FROM person WHERE id = ${personID}`, async function name(err, row) {
            resolve(row.name);
        });
    })

}

function getProduct(productId) {
    return new Promise(async(resolve) => {
        await db.get(`SELECT name FROM product WHERE id = ${productId}`, async function name(err, row) {
            resolve(row.name);
        });
    })

}