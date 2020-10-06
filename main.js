const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
require("./src/db/config");
//const { template } = require("./src/view/menu");
function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        //width: 800,
        //height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
    });
    win.maximize();

    win.webContents.openDevTools();
    // and load the index.html of the app.
    win.loadFile("src/view/index.html");
    win.show();
    const template = [{
            label: "Home",
            click() {
                win.loadFile("src/view/index.html");
            }
        },
        {
            label: "User",
            submenu: [{
                    label: "User Profile",
                    click() {
                        win.loadFile("src/view/profileUser.html");
                    },
                },
                {
                    label: "Company Profile",
                    click() {
                        win.loadFile("src/view/profileCompany.html");
                    },
                },
            ],
        },
        {
            label: "Master",
            submenu: [{
                    label: "Product",
                    click() {
                        win.loadFile("src/view/masterProduct.html");
                    },
                },
                {
                    label: "Party / Person",
                    click() {
                        win.loadFile("src/view/masterPerson.html");
                    },
                },
            ],
        },

        {
            label: "Transaction",
            submenu: [{
                    label: "Purchase",
                    click() {
                        win.loadURL(`file://${__dirname}/src/view/transaction.html?type=Purchase`);
                    },
                },
                {
                    label: "Sales",
                    click() {
                        win.loadURL(`file://${__dirname}/src/view/transaction.html?type=Sale`);
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Payment Recipt",
                    click() {
                        win.loadFile("src/view/transPaymentRecipt.html");
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Purchase Return",
                    click() {
                        win.loadFile("src/view/transPurchaseReturn.html");
                    },
                },
                {
                    label: "Sales Return",
                    click() {
                        win.loadFile("src/view/transSalesReturn.html");
                    },
                },
            ],
        },

        {
            label: "Report",
            submenu: [{
                    label: "Sales Record",
                    click() {
                        win.loadURL(`file://${__dirname}/src/view/report.html?type=Sale`);
                    },
                },
                {
                    label: "Purchase Record",
                    click() {
                        win.loadURL(`file://${__dirname}/src/view/report.html?type=Purchase`);
                    },
                },
                {
                    label: "Stock Details",
                    click() {
                        win.loadURL(`file://${__dirname}/src/view/report.html?type=Stock`);
                    },

                },
                {
                    type: "separator",
                },
                {
                    label: "Party Details",
                    click() {
                        win.loadFile("src/view/detailParty.html");
                    },
                },
                {
                    label: "Product Details",
                    click() {
                        win.loadFile("src/view/detailProduct.html");
                    },
                },
            ],
        },
        {
            role: 'reload'
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
app.whenReady().then(createWindow);
app.allowRendererProcessReuse = false;