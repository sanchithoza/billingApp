const $ = require('jquery');
const db = require('./../db/config');
const { Callbacks } = require('jquery');
document.addEventListener('DOMContentLoaded', pageLoaded);
let transactionId;
let invoiceDetail = {};

function pageLoaded() {
    let urlParams = getUrlParams(location.search);
    transactionId = urlParams.tid;
}

function getUrlParams(urlOrQueryString) {
    if ((i = urlOrQueryString.indexOf('?')) >= 0) {
        const queryString = urlOrQueryString.substring(i + 1);
        if (queryString) {
            return _mapUrlParams(queryString);
        }
    }

    return {};
}

/**
 * Helper function for `getUrlParams()`
 * Builds the querystring parameter to value object map.
 *
 * @param queryString {string} - The full querystring, without the leading '?'.
 */
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


$(async function() {
    console.log("ready", transactionId);
    await db.get(`SELECT * FROM transactions WHERE id = ${transactionId}`, async function(err, row) {
        if (err) {
            return console.log(err);
        }
        invoiceDetail.transactionDetial = row;
        $('#invoiceNo').append(row.id);
        $('#invoiceDate').append(row.onDate);
        $('#paymentMode').append(row.payment);
        let amountRow = `<tr>
                            <td>18%</td>
                            <td>${row.netAmt}</td>
                            <td>${row.taxAmt / 2}</td>
                            <td>${row.taxAmt / 2}</td>
                            <td>${row.taxAmt}</td>
                            <td>${row.grossAmt}</td>
                        </tr>`;
        $('#amountCalculated').append(amountRow)
        $('#totalAmt').append(row.netAmt);
        await db.get(`SELECT * FROM person WHERE id = ${row.personID}`, async function(err, row) {
            if (err) {
                return console.log(err);
            }
            invoiceDetail.partyDetail = row;
            $('#partyName').append(row.name);
            $('#partyAddress').append(row.address);
            $('#partyState').append(row.state);

        })
        invoiceDetail.productDetail = [];
        let count = 1;
        await db.each(`SELECT * FROM transactionDetail WHERE transactionId = ${transactionId}`, async function(err, row) {
            if (err) {
                return console.log(err);
            }
            await db.get(`SELECT * FROM product WHERE id = ${row.productId}`, async function(err, product) {
                if (err) {
                    return console.log(err);
                }
                let record = `<tr><td>${count++}</td><td>${product.size}</td><td>${product.name}</td><td>${product.type}</td><td>${row.batchNo}</td><td>${product.shade}</td><td>${product.grade}</td><td>${row.quantity}</td><td>${row.amount}</td></tr>`;
                await $('#products').append(record)
            });
        });
        //$('#partyName').append(invoiceDetail)
        console.log("transaction", invoiceDetail);
    });
});