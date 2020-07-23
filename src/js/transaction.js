const $ = require('jquery');
const db = require('./../db/config');
const { Callbacks } = require('jquery');


$(function() {
    console.log("ready!");
    //let productTableRow = '<tr> <td> <input name="pid" id="productId" class="form-control"> </td> <td> <div class="form-group"> <input list="sizeList" name="size" id="selectedSize" class="form-control"> <datalist id="sizeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="typeList" name="type" id="selectedType" class="form-control"> <datalist id="typeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="gradeList" name="grade" id="selectedGrade" class="form-control"> <datalist id="gradeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="nameList" name="name" id="selectedName" class="form-control"> <datalist id="nameList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="shadeList" name="shade" id="selectedShade" class="form-control"> <datalist id="shadeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="batchList" name="batch" id="selectedBatch" class="form-control"> <datalist id="batchList"> <option value=""> </datalist> </div> </td> <td><input type="text" name="tableName" class="form-control tabName" id="qty" /></td> <td><input type="text" name="tableName" class="form-control tabName" id="rate" /></td> <td><input type="text" name="tableName" class="form-control tabName" id="mrp" /></td> </tr>';
    //$("#billItems tbody").append(productTableRow);

    $("#addRow").on('click', async function() {
        console.log("here");
        let productTableRow = '<tr> <td> <input name="pid" id="productId" class="form-control"> </td> <td> <div class="form-group"> <input list="sizeList" name="size" id="selectedSize" class="form-control"> <datalist id="sizeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="typeList" name="type" id="selectedType" class="form-control"> <datalist id="typeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="gradeList" name="grade" id="selectedGrade" class="form-control"> <datalist id="gradeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="nameList" name="name" id="selectedName" class="form-control"> <datalist id="nameList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="shadeList" name="shade" id="selectedShade" class="form-control"> <datalist id="shadeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="batchList" name="batch" id="selectedBatch" class="form-control"> <datalist id="batchList"> <option value=""> </datalist> </div> </td> <td><input type="text" name="tableName" class="form-control tabName" id="qty" /></td> <td><input type="text" name="tableName" class="form-control tabName" id="rate" /></td> <td><input type="text" name="tableName" class="form-control tabName" id="mrp" /></td> </tr>';
        $("#billItems tbody").append(productTableRow);
    });
    $(document.body).on('blur', '#billItems tbody tr input#qty', async function() {
        await calculateTotalQty();
        await calculateRowMrp();
        await calculateNetAmount();
    });

    // on rate change
    $(document.body).on('blur', '#billItems tbody tr input#rate', async function() {
        await calculateRowMrp();
        await calculateNetAmount();
    });

    //on mrp change
    $(document.body).on('blur', '#billItems tbody tr input#mrp', async function() {
        await calculateNetAmount();
    });
    /*
    $("#billItems tbody tr input#qty").on(async function() {
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
    */
    //size , type & grade datalists are populated from dropdown.js 
    //on grade change
    $(document.body).on('input', '#billItems tbody tr input#selectedGrade', async function() {
            let size = $(this).closest('tr').find('[name="size"]').val();
            let type = $(this).closest('tr').find('[name="type"]').val();
            let grade = $(this).closest('tr').find('[name="grade"]').val();
            let namelist = $(this).closest('tr').find("#nameList");
            namelist.empty();
            $(this).closest('tr').find('#selectedName').val('');
            await db.each(`SELECT DISTINCT name FROM product WHERE (size = '${size}' AND type = '${type}' AND grade = '${grade}')`, function(err, row) {
                namelist.append('<option value="' + row.name + '">');
            });
        })
        //on name change
    $(document.body).on('input', '#billItems tbody tr input#selectedName', async function() {
            let size = $(this).closest('tr').find('[name="size"]').val();
            let type = $(this).closest('tr').find('[name="type"]').val();
            let grade = $(this).closest('tr').find('[name="grade"]').val();
            let name = $(this).closest('tr').find('[name="name"]').val();
            let shadelist = $(this).closest('tr').find("#shadeList")
            shadelist.empty();
            $(this).closest('tr').find('#selectedShade').val('');
            await db.each(`SELECT DISTINCT shade FROM product WHERE (size = '${size}' AND type = '${type}' AND grade = '${grade}' AND name = '${name}')`, function(err, row) {
                shadelist.append('<option value="' + row.shade + '">');
            });
        })
        //on shade change
    $(document.body).on('input', '#billItems tbody tr input#selectedShade', async function() {
            let size = $(this).closest('tr').find('[name="size"]').val();
            let type = $(this).closest('tr').find('[name="type"]').val();
            let grade = $(this).closest('tr').find('[name="grade"]').val();
            let name = $(this).closest('tr').find('[name="name"]').val();
            let shade = $(this).closest('tr').find('[name="shade"]').val();
            let pId = $(this).closest('tr').find('[name="pid"]');
            let batchlist = $(this).closest('tr').find("#batchList")
            batchlist.empty();
            $(this).closest('tr').find('#selectedBatch').val('');
            await db.all(`SELECT id FROM product WHERE (size = '${size}' AND type = '${type}' AND grade = '${grade}' AND name = '${name}' AND shade='${shade}')`, async function(err, row) {
                // make entry in inventory on purchase
                await pId.val(row[0].id);
                let productId = row[0].id;
                await db.each(`SELECT DISTINCT batchNo FROM inventory WHERE (productId = '${productId}')`, function(err, row) {
                    if (row) {
                        batchlist.append('<option value="' + row.batchNo + '">');
                    }
                });
            });
        })
        //on batch change
    $(document.body).on('input', '#billItems tbody tr input#selectedBatch', async function() {
        let productId = $(this).closest('tr').find('input#productId').val();
        let batch = $(this).closest('tr').find('[name="batch"]').val();
        let qty = $(this).closest('tr').find('input#qty');
        await db.all(`SELECT availStock FROM inventory WHERE (batchNo = '${batch}' AND productId = '${productId}')`, async function(err, row) {
            qty.val(await row[0].availStock);
        });
    });

    $(document.body).on('click', '#submit', () => {
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
});

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