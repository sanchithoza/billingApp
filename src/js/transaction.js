const $ = require('jquery');
const { dialog } = require('electron').remote;


const db = require('./../db/config');
const { Callbacks } = require('jquery');
document.addEventListener('DOMContentLoaded', pageLoaded);
let transType;


function pageLoaded() {
    let urlParams = getUrlParams(location.search);
    transType = urlParams.type;
    $('#transactionHeader').append(`${transType} Entry`)

    for (let index = 0; index < 6; index++) {
        $('#itemBody').append(`<tr> <td> <input name="pid" id="productId${index}" class="productId form-control"> </td> <td> <div class="form-group"> <input list="sizeList${index}" name="size" id="selectedSize${index}" class="selectedSize form-control"> <datalist class="sizeList" id="sizeList${index}"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="nameList${index}" name="name" id="selectedName${index}" class="selectedName form-control"> <datalist id="nameList${index}" class="nameList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="batchList${index}" name="batch" id="selectedBatch${index}" class="selectedBatch form-control"> <datalist id="batchList${index}" class="batchList"> <option value=""> </datalist> </div> </td> <td><input type="text" class="qty form-control" id="qty${index}" /></td> <td><input type="text" class="pcs form-control" id="pcs${index}" /></td> <td><input type="text" class="rate form-control" id="rate${index}" /></td> <td><input type="text" class="mrp form-control" id="mrp${index}" /></td></tr>`);
    }
}
$(function() {
    $("#addRow").on('click', async function() {
        //let productTableRow = '<tr> <td> <input name="pid" id="productId" class="form-control"> </td> <td> <div class="form-group"> <input list="sizeList" name="size" id="selectedSize" class="form-control"> <datalist id="sizeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="typeList" name="type" id="selectedType" class="form-control"> <datalist id="typeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="gradeList" name="grade" id="selectedGrade" class="form-control"> <datalist id="gradeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="nameList" name="name" id="selectedName" class="form-control"> <datalist id="nameList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="shadeList" name="shade" id="selectedShade" class="form-control"> <datalist id="shadeList"> <option value=""> </datalist> </div> </td> <td> <div class="form-group"> <input list="batchList" name="batch" id="selectedBatch" class="form-control"> <datalist id="batchList"> <option value=""> </datalist> </div> </td> <td><input type="text" name="tableName" class="form-control tabName" id="qty" /></td> <td><input type="text" name="tableName" class="form-control tabName" id="rate" /></td> <td><input type="text" name="tableName" class="form-control tabName" id="mrp" /></td> </tr>';
        //$("#billItems tbody").append(productTableRow);
    });
    $(document.body).on('blur', '#billItems tbody tr input.qty', async function() {
        let index = $(this).closest('tr').index();
        let selectedName = $(`#selectedName${index}`).val();
        let pcsPerBox = $(`#nameList${index} option[value='` + selectedName + `']`).attr('id');
        $(`#pcs${index}`).val($(this).val() * pcsPerBox);
        await calculateTotalQty();
        await calculateRowMrp();
        await calculateNetAmount();
    });

    // on rate change
    $(document.body).on('blur', '#billItems tbody tr input.rate', async function() {
        await calculateRowMrp();
        await calculateNetAmount();
    });

    //on mrp change
    $(document.body).on('blur', '#billItems tbody tr input.mrp', async function() {
        await calculateNetAmount();
    });
    //on Size change
    $(document.body).on('input', '#billItems tbody tr input.selectedSize', async function() {
        let index = $(this).closest('tr').index();
        let size = $(this).val();
        let namelist = $(`#nameList${index}`);
        namelist.empty();
        $(`#selectedName${index}`).val('');
        await db.each(`SELECT name,pcsPerBox FROM product WHERE (size = '${size}')`, function(err, row) {
            namelist.append('<option value="' + row.name + '" id = "' + row.pcsPerBox + '"></option>');
            // console.log(namelist.html());
        });
    })

    //on name change
    $(document.body).on('input', '#billItems tbody tr input.selectedName', async function() {
        let index = $(this).closest('tr').index();
        let size = $(`#selectedSize${index}`).val();
        let pId = $(`#productId${index}`);
        let name = $(this).val();
        let batchlist = $(`#batchList${index}`)
        batchlist.empty();
        $(`#selectedBatch${index}`).val('');
        await db.all(`SELECT id,pcsPerBox FROM product WHERE (size = '${size}' AND name = '${name}')`, async function(err, row) {
            await pId.val(row[0].id);
            let productId = row[0].id;
            if (transType != "Purchase") {
                await db.each(`SELECT batchNo,availStock FROM inventory WHERE (productId = '${productId}' AND availStock > 0)`, async function(err, row) {
                    console.log("err", err);
                    if (row) {
                        await batchlist.append('<option value="' + row.batchNo + '" id="' + row.availStock + '">' + row.availStock + '</option>');
                    }
                });
            }

        });
    });

    $(document.body).on('input', '#billItems tbody tr input.selectedBatch', async function() {
        let index = $(this).closest('tr').index();
        let productId = $(`#productId${index}`).val();
        let batch = $(`#selectedBatch${index}`).val();
        let qty = $(`#qty${index}`);
        let pcs = $(`#pcs${index}`);
        let selectedName = $(`#selectedName${index}`).val();
        let pcsPerBox = $(`#nameList${index} option[value='` + selectedName + `']`).attr('id');
        if (transType != "Purchase") {
            await db.all(`SELECT availStock FROM inventory WHERE (batchNo = '${batch}' AND productId = '${productId}')`, async function(err, row) {
                qty.val(await row[0].availStock);
                pcs.val(await (row[0].availStock * pcsPerBox));
            });
        }
    });

    $(document.body).on('click', '#submit', async() => {
        let transactionData = {};
        var tId;
        // var item_array = [];
        let transactionInfo = {
            "partyId": $("#partyList option[value='" + $('#selectedParty').val() + "']").attr('id'),
            "transactionType": transType,
            "paymentMode": $('#paymentMode').val(),
            "transdate": $('#transdate').val(),
            "qty": $('#totalQty').text(),
            "tax": parseFloat($('#sgst').text()) + parseFloat($('#cgst').text()),
            "netAmount": $('#namount').text(),
            "grossAmount": $('#gamount').text()
        };
        transactionData.transactionInfo = transactionInfo;
        transactionData.item_array = [];
        transactionData = await prepairItemArray(transactionData);
        console.log(transactionData);
        transactionData.item_array.forEach(element => {
            console.log("ele", element);
        });

        if (transactionData.transactionInfo.partyId && transactionData.item_array[0]) {
            let transactionId = await addTransaction(transactionData.transactionInfo);

            console.log(transactionId);
        } else {
            console.log("show alert");
        }

        /*  if (transType == "Purchase") {
              item_array.forEach(async(element) => {
                  await db.get(`SELECT * FROM inventory WHERE batchNo = "${element.batchNo}"`, async function(err, row) {
                      if (err) {
                          console.log("checking for batchno", err);
                      }
                      if (!row) {
                          console.log(element.pId, tId);
                          await db.run("INSERT INTO transactionDetail(transactionId,productId,batchNo,quantity,amount) VALUES(?,?,?,?,?)", [tId, element.pId, element.batchNo, element.qty, element.mrp], async function(err) {
                              if (err) {
                                  return console.log("error adding purchase in transaction detail", err);
                              }
                              await db.run("INSERT INTO inventory(productId,batchNo,availStock,rate) VALUES(?,?,?,?)", [element.pId, element.batchNo, element.qty, element.rate], async function(err) {
                                  if (err) {
                                      return console.log("error adding purchase in inventory", err);
                                  }
                                  console.log("Entered in Inventory");
                              })
                          })
                          let response = dialog.showMessageBoxSync({
                              buttons: ["OK"],
                              message: "Data Saved !"
                          })
                          console.log(response)
                              // window.location = `transaction.html?type=Purchase`;

                      } else {
                          await db.run("DELETE FROM transactions WHERE id = ?", [tId], async function(err) {
                              if (err) {
                                  return console.log("deleting transaction due to batch already exists issue");
                              }
                          })
                          dialog.showErrorBox('Alert', `Batch Number "${row.batchNo}" Already Exists .`);
                      }
                  })
              });


          } else if (transType == "Sale") {
              console.log(tId);
              item_array.forEach(async(element, index) => {
                  console.log(element.pId);
                  console.log(element.batchNo);
                  await db.run(`UPDATE inventory SET availStock = availStock - ${element.qty} WHERE (productId = ? AND batchNo = ?)`, [element.pId, element.batchNo], async function(err) {
                      if (err) {
                          console.log("inventory update issue", err);
                      }

                      await db.run("INSERT INTO transactionDetail(transactionId,productId,batchNo,quantity,amount) VALUES(?,?,?,?,?)", [tId, element.pId, element.batchNo, element.qty, element.mrp], async function(err) {
                          if (err) {
                              return console.log("transaction detail insert issue", err);
                          }

                          console.log("Inserted in Transaction Detail");
                      })
                  })
              })
              let response = dialog.showMessageBoxSync({
                  buttons: ["OK"],
                  message: "Data Saved !"
              })

              window.location = `invoice.html?tid=${tId}`;

          } */
    });
});

async function addTransaction(data) {
    return new Promise(async(resolve) => {
        await db.run("INSERT INTO transactions(type,payment,onDate,personId,netAmt,taxAmt,insuranceAmt,grossAmt) VALUES(?,?,?,?,?,?,?,?)", [data.transactionType, data.paymentMode, data.transdate, data.partyId, data.netAmount, data.tax, '0', data.grossAmount], async function(err) {
            if (err) {
                console.log(err);
                return false;
            }
            resolve(this.lastID);
        });
    })
}

function prepairItemArray(transactionData) {
    let transactionInfo = transactionData.transactionInfo;
    return new Promise(resolve => {
        $("#billItems tbody tr").each(async function(index) {
            if (transactionInfo.partyId && $(this).find('.productId').val()) {
                var batchStatus;
                if (transactionInfo.transactionType == "Purchase") {
                    batchStatus = await checkBatchNumber($(this).find(".selectedBatch").val());
                }
                if (!batchStatus) {
                    transactionData.item_array.push({
                        "pId": $(this).find('input.productId').val(),
                        "batchNo": $(this).find('input.selectedBatch').val(),
                        "qty": $(this).find('input.qty').val(),
                        "mrp": $(this).find('input.mrp').val(),
                        "rate": $(this).find('input.rate').val()
                    });
                } else {
                    transactionData.item_array = [];
                    return false;
                }
            }
        });
        setTimeout(() => {
            resolve(transactionData);
        }, 1000);

    })
}

function checkBatchNumber(batchNo) {
    return new Promise(async resolve => {
        await db.get(`SELECT * FROM inventory WHERE batchNo = "${batchNo}"`, function(err, row) {
            if (row) {
                let response = dialog.showMessageBoxSync({
                    buttons: ["OK"],
                    message: `${batchNo} already exists`
                })
                console.log(response);
                // throw new FatalError("Batch Already Exists!");
            } else {
                resolve(row);
            }
        });
    })
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
        //let pcsPerBox = $(".nameList option[value='" + $('#selectedName').val() + "']").attr('id');
        let qty = parseFloat($(this).find('input.qty').val()) || 0;
        let rate = parseFloat($(this).find('input.rate').val()) || 0;
        $(this).find('input.mrp').val(qty * rate)
            //$(this).find('input.pcs').val(qty * pcsPerBox)
    });
}

function calculateTotalQty() {
    let totalqty = 0;
    $("#billItems tbody tr").each(function(index) {
        let qty = parseFloat($(this).find('input.qty').val()) || 0;
        if ($(this).find('input.qty').val()) {
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
        if ($(this).find('input.mrp').val()) {
            totalmrp = totalmrp + parseFloat($(this).find('input.mrp').val())
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