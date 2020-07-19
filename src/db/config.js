//./node_modules/.bin/electron-rebuild -w sqlite3 -p
//above command to solve binding error of sqlite3 with electron
const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./electron-billing.db", async(err) => {
    if (err) {
        console.error(err.message);
    }
    //creating User table
    await db.run("CREATE TABLE IF NOT EXISTS appuser (id INTEGER PRIMARY KEY,username TEXT NOT NULL,password TEXT NOT NULL)");
    //creating product master table
    await db.run("CREATE TABLE IF NOT EXISTS product (id INTEGER PRIMARY KEY,name TEXT,type TEXT NOT NULL,grade TEXT NOT NULL,size TEXT NOT NULL,shade TEXT)");
    //creating person master
    await db.run("CREATE TABLE IF NOT EXISTS person (id INTEGER PRIMARY KEY,type TEXT NOT NULL,name TEXT NOT NULL,address TEXT NOT NULL,state TEXT NOT NULL,gst TEXT,pan TEXT)");
    //creating transaction table
    await db.run("CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY,type TEXT NOT NULL,payment TEXT NOT NULL,onDate DATE NOT NULL,personID INTEGER NOT NULL,netAmt NUMBER NOT NULL,taxAmt NUMBER,insuranceAmt NUMBER,grossAmt NUMBER NOT NULL)");
    //creating transaction details Table
    await db.run("CREATE TABLE IF NOT EXISTS transactionDetail (id INTEGER PRIMARY KEY,transactionId INTEGER NOT NULL,productId INTEGER NOT NULL,quantity INTEGER NOT NULL,amount NUMBER NOT NULL)");
    //creating Paymetn Recipt table
    await db.run("CREATE TABLE IF NOT EXISTS paymentRecipt (id INTEGER PRIMARY KEY,onDate DATE NOT NULL,personId INTEGER NOT NULL,amount NUMBER NOT NULL,remark TEXT)");
    //creating inventory table
    await db.run("CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY,productId INTEGER NOT NULL,batchNo NUMBER NOT NULL,availStock NUMBER NOT NULL,rate NUMBER,mrp NUMBER)");
});

module.exports = db;