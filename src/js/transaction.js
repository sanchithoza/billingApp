const $ = require('jquery');
const db = require('./../db/config');
//const { childWin } = require('./../../main')
document.addEventListener('DOMContentLoaded', pageLoaded);

function pageLoaded() {
    let urlParams = getUrlParams(location.search);
    let transType = urlParams.type;
    $('#transactionHeader').append(`${transType} Entry`)
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
$("#billItems tbody tr input#mrp").blur(function() {
    let totalmrp = 0;
    $("#billItems tbody tr").each(function(index) {
        if ($(this).find('input#mrp').val()) {
            totalmrp = totalmrp + parseFloat($(this).find('input#mrp').val())
        }
    })
    $('#namount').text(totalmrp);
});
$('#submit').on('click', () => {
    console.log('submiting form', $('#selectedParty').val());
    var item_array = [];

    $("#billItems tbody tr").each(function(index) {
        if ($(this).find('input#selectedName').val()) {
            item_array.push({

                "name": $(this).find('input#selectedName').val(),
                "type": $(this).find('input#selectedType').val(),
                "size": $(this).find('input#selectedSize').val(),
                "grade": $(this).find('input#selectedGrade').val(),
                "qty": $(this).find('input#qty').val(),
                "rate": $(this).find('input#rate').val(),
                "mrp": $(this).find('input#mrp').val()
            });
        }
    });

    console.log("array", item_array);

});