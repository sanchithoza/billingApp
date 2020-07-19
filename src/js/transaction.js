const $ = require('jquery');
const db = require('./../db/config');
const { Callbacks } = require('jquery');



//const { childWin } = require('./../../main')
document.addEventListener('DOMContentLoaded', pageLoaded);
let transType;

function pageLoaded() {
    let urlParams = getUrlParams(location.search);
    transType = urlParams.type;
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
$("#billItems tbody tr input#qty").blur(async function() {
    await calculateTotalQty();
    await calculateRowMrp();
    await calculateNetAmount();
});

// on rate change
$("#billItems tbody tr input#rate").blur(async function() {
    await calculateRowMrp();
    await calculateNetAmount();
});

//on mrp change
$("#billItems tbody tr input#mrp").blur(async function() {
    await calculateNetAmount();
});

function calculateRowMrp() {
    $("#billItems tbody tr").each(function(index) {
        let qty = parseFloat($(this).find('input#qty').val()) || 0;
        let rate = parseFloat($(this).find('input#rate').val()) || 0;
        $(this).find('input#mrp').val(qty * rate)
    });
}

function calculateTotalQty() {
    let totalqty = 0;
    $("#billItems tbody tr").each(function(index) {
        let qty = parseFloat($(this).find('input#qty').val()) || 0;
        if ($(this).find('input#qty').val()) {
            totalqty = totalqty + qty;
        }
    })
    $('#totalQty').text(totalqty);
}

function calculateNetAmount() {
    let totalmrp = 0;
    let gst = 0;
    let gAmount = 0;
    $("#billItems tbody tr").each(function(index) {
        if ($(this).find('input#mrp').val()) {
            totalmrp = totalmrp + parseFloat($(this).find('input#mrp').val())
        }
    })
    gst = totalmrp * 0.18;
    gAmount = totalmrp + gst;
    // console.log(gAmount);
    $('#namount').text(totalmrp);
    $('#cgst').text(gst / 2);
    $('#sgst').text(gst / 2);
    $('#gamount').text(gAmount);
}
$("#billItems tbody tr input#selectedGrade").on('input', async function() {
    let size = $(this).closest('tr').find('[name="size"]').val();
    let type = $(this).closest('tr').find('[name="type"]').val();
    let grade = $(this).closest('tr').find('[name="grade"]').val();
    $("#nameList").empty();
    $('#selectedName').val('');
    await db.each(`SELECT DISTINCT name FROM product WHERE (size = '${size}' AND type = '${type}' AND grade = '${grade}')`, function(err, row) {
        $("#nameList").append('<option value="' + row.name + '">');
    });
})

$("#billItems tbody tr input#selectedName").on('input', async function() {
    let size = $(this).closest('tr').find('[name="size"]').val();
    let type = $(this).closest('tr').find('[name="type"]').val();
    let grade = $(this).closest('tr').find('[name="grade"]').val();
    let name = $(this).closest('tr').find('[name="name"]').val();
    $("#shadeList").empty();
    $('#selectedShade').val('');
    await db.each(`SELECT DISTINCT shade FROM product WHERE (size = '${size}' AND type = '${type}' AND grade = '${grade}' AND name = '${name}')`, function(err, row) {
        $("#shadeList").append('<option value="' + row.shade + '">');
    });
})

$("#billItems tbody tr input#selectedShade").on('input', async function() {
    let size = $(this).closest('tr').find('[name="size"]').val();
    let type = $(this).closest('tr').find('[name="type"]').val();
    let grade = $(this).closest('tr').find('[name="grade"]').val();
    let name = $(this).closest('tr').find('[name="name"]').val();
    let shade = $(this).closest('tr').find('[name="shade"]').val();
    let span = $(this).closest('tr').find('span#productId');
    let id = 0;
    //$("#shadeList").empty();
    //$('#selectedShade').val('');
    id = await db.all(`SELECT id FROM product WHERE (size = '${size}' AND type = '${type}' AND grade = '${grade}' AND name = '${name}' AND shade='${shade}')`, async function(err, row) {
        // make entry in inventory on purchase

        await span.text(row.id);
        console.log(span);
        //$("#shadeList").append('<option value="' + row.shade + '">');
    });
    console.log(span.text());
})


$('#submit').on('click', () => {
    let partyId = $("#partyList option[value='" + $('#selectedParty').val() + "']").attr('id');
    let transactionType = transType;
    let paymentMode = $('#paymentMode').val();
    let transdate = $('#transdate').val();
    let qty = $('#totalQty').text();
    let tax = parseFloat($('#sgst').text()) + parseFloat($('#cgst').text());
    let netAmount = $('#namount').text();
    let grossAmount = $('#gamount').text();
    db.run("INSERT INTO transactions(type,payment,onDate,personId,netAmt,taxAmt,insuranceAmt,grossAmt) VALUES(?,?,?,?,?,?,?,?)", [transactionType, paymentMode, transdate, partyId, netAmount, tax, '0', grossAmount], function(err) {
        if (err) {
            console.log(err);
            return $('#result').text(err);
        }

        $('#result').text(`data inserted ${this.lastID}`);
    });
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