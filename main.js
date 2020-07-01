const { app, BrowserWindow, Menu } = require("electron");
require("./src/db/config");
//const { template } = require("./src/view/menu");
app.allowRendererProcessReuse = false;
function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    //width: 800,
    //height: 600,
    webPreferences: {
      nodeIntegration: true,

    },
  });
  win.webContents.openDevTools();
  // and load the index.html of the app.
  win.loadFile("src/view/index.html");
  const template = [
    {
      label:"Home",
      click(){
        win.loadFile("src/view/index.html");
      }
    },
    {
      label: "User",
      submenu: [
        {
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
      submenu: [
        {
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
      submenu: [
        {
          label: "Purchase",
          click() {
            win.loadFile("src/view/transPurchase.html");
          },
        },
        {
          label: "Sales",
          click() {
            win.loadFile("src/view/transSales.html");
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
      submenu: [
        {
          label: "Sales Record",
          click() {
            win.loadFile("src/view/repSales.html");
          },
        },
        {
          label: "Purchase Record",
          click() {
            win.loadFile("src/view/repPurchase.html");
          },
        },
        {
          label: "Partywise Record",
          click() {
            win.loadFile("src/view/repPartywise.html");
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
      role:'reload'
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);
