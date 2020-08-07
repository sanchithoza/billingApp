// Shorthand for $( document ).ready()
$(async function() {
    $("#partyList").empty();
    await db.each("SELECT * FROM person", function(err, row) {
        $("#partyList").append('<option value="' + row.name + '" id="' + row.id + '">' + row.id + '</option>');
        // $("#partyList").append('<option value="' + row.id + '">' + row.name + '</option>');
    });
    await db.each("SELECT * FROM product", function(err, row) {
        $("#productList").append('<option value="' + row.name + '">');
    });
    await db.each("SELECT DISTINCT size FROM product", function(err, row) {
        $(".sizeList").append('<option value="' + row.size + '">');
    });
    await db.each("SELECT DISTINCT type FROM product", function(err, row) {
        $("#typeList").append('<option value="' + row.type + '">');
    });
    await db.each("SELECT DISTINCT grade FROM product", function(err, row) {
        $("#gradeList").append('<option value="' + row.grade + '">');
    });
});