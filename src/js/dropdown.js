// Shorthand for $( document ).ready()
$(async function() {
    await db.each("SELECT * FROM person", function(err, row) {
        $("#partyList").append('<option value="' + row.name + '">' + row.id + '</option>');
        // $("#partyList").append('<option value="' + row.id + '">' + row.name + '</option>');
    });
    await db.each("SELECT * FROM product", function(err, row) {
        $("#productList").append('<option value="' + row.name + '">');
    });
});