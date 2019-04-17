// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path');
const _ = require('lodash');
// Enable live reload for all the files inside your project directory
require('electron-reload')(__dirname);
const { Products, Sales, Purchase } = require('./models');
const sequelize = require('sequelize');
const Op = sequelize.Op;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('main.html')
  mainWindow.once('ready-to-show', () => { mainWindow.show() });

  ipcMain.on("mainWindowLoaded", async function (event, arg) {
    var d = new Date();
    const result = await Sales.findAll({
      attributes: ['id', 'product', ['quantity', 'sold_quantity'], ['price', 'selling_price'], 'order_id', 'vendor'],
      where: { createdAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(d.setMonth(d.getMonth()-1))
        },
      },
      order: ['createdAt']
    });
    const sortedSalesItems = _.map(result, 'dataValues');
    //mainWindow.webContents.send("showSalesOrder", sortedItems);
    let sortedItems = { };
    _.forEach(sortedSalesItems, function(item) {
        const key = item.product
        if(sortedItems[key]){
          sortedItems[key] = { 
            ...item,
            ...sortedItems[key],
            ...{
              sold_quantity: sortedItems[key].sold_quantity || 0 + item.sold_quantity || 0,
              selling_price: sortedItems[key].selling_price || 0 + item.selling_price || 0,
            }
          };
        } else {
          sortedItems[key] = item;
        }
    });  
    const resultPurchase = await Purchase.findAll({
      attributes: ['id', 'product', ['quantity', 'purchased_quantity'], ['price', 'purchase_price'], 'order_id', 'vendor'],
      where: { createdAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(d.setMonth(d.getMonth()-1))
        },
      },
      order: ['createdAt']
    });
    
    const sortedPurchaseItems =_.map(resultPurchase, 'dataValues');
    console.log(sortedPurchaseItems);
    //let sortedItems = { };
    _.forEach(sortedPurchaseItems, function(item) {
        const key = item.product
        if(sortedItems[key]){
          sortedItems[key] = { 
            purchased_quantity: sortedItems[key].purchased_quantity || 0 + item.purchased_quantity || 0,
            purchase_price: sortedItems[key].purchase_price || 0 + item.purchase_price || 0,
            ...item,
            ...sortedItems[key],
          };
        } else {
          sortedItems[key] = item;
        }
    });    
    //let sortedItems = _.merge(sortedSalesItems,sortedPurchaseItems);
    
    sortedItems = _.map(sortedItems, function(item) {
      return {...item,  ...{"purchase_price": item.purchase_price || 0, "purchased_quantity": item.purchased_quantity || 0,"selling_price": item.selling_price || 0, "sold_quantity": item.sold_quantity || 0, "profit_n_loss": parseFloat((item.selling_price / item.sold_quantity - item.purchase_price / item.purchased_quantity) || 0).toFixed(2) }}
    });

    console.log(sortedItems);

		mainWindow.webContents.send("showPurchaseOrder", sortedItems);
  });
  ipcMain.on("loadProductData", async function (event, arg) {
    const result = await Products.findAll({
      attributes: ['id', 'name', 'alias']
    });
    const sortedItems = _.map(result, 'dataValues');
    console.log(sortedItems);
		mainWindow.webContents.send("printProducts", sortedItems);
  });

  ipcMain.on("loadSalesOrder", async function (event, arg) {
    const result = await Sales.findAll({
      attributes: ['id', 'product', 'quantity', 'price', 'order_id', 'vendor']
    });
    const sortedItems = _.map(result, 'dataValues');
    console.log(sortedItems);
		mainWindow.webContents.send("showSalesOrder", sortedItems);
  });

  ipcMain.on("loadPurchaseOrder", async function (event, arg) {
    const result = await Purchase.findAll({
      attributes: ['id', 'product', 'quantity', 'price', 'order_id', 'vendor']
    });
    const sortedItems = _.map(result, 'dataValues');
    console.log(sortedItems);
		mainWindow.webContents.send("showPurchaseOrder", sortedItems);
  });

  ipcMain.on("insertProducts", function (event, arg) {
    // Returns [2] in "mysql", "sqlite"; [2, 3] in "postgresql"
    console.log(arg);
    // arg.forEach(async function(product){
    //   const response = await Products.create(product);       
    // })
    Products.bulkCreate(arg);
    
    mainWindow.webContents.send("response", 1);
    //knex('products').insert(products)
  });

  ipcMain.on("insertSalesOrder", function (event, arg) {
    // Returns [2] in "mysql", "sqlite"; [2, 3] in "postgresql"
    console.log(arg);
    // arg.forEach(async function(order){
    //   const response = await Sales.create(order);       
    // })
    Sales.bulkCreate(arg);
    
    mainWindow.webContents.send("response", 1);
    //knex('products').insert(products)
  });

  ipcMain.on("insertPurchaseOrder", function (event, arg) {
    // Returns [2] in "mysql", "sqlite"; [2, 3] in "postgresql"
    console.log(arg);
    // arg.forEach(async function(order){
    //   const response = await Purchase.create(order);       
    // })
    Purchase.bulkCreate(arg);
    mainWindow.webContents.send("response", 1);
    //knex('products').insert(products)
  });
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
