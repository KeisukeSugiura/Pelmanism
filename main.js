const electron = require('electron')
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

var displayWidth
var displayHeight
var DISPLAY_MAGNIFICATION = 0.8

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let pelmanismWindow
let answerWindow

const IMAGE_PATH = "../images/";
const MARK_HEARTS = "h";
const MARK_CLUBS = "c";
const MARK_SPADES = "s";
const MARK_DIAMONDS = "d";
const MARK_JOKERS = "x";
var cardList = []
class Card {
    constructor(name, number) {
        this.url = name;
        this.number = number;
        this.weight = Math.random();
        this.flg = false;
    }
}


function createPelmanismWindow () {
  // Create the browser window.
  console.log("create pelmanism window")
  pelmanismWindow = new BrowserWindow({width: displayWidth*DISPLAY_MAGNIFICATION, height: displayHeight*DISPLAY_MAGNIFICATION, x:0,y:0})

  // and load the index.html of the app.
  pelmanismWindow.loadURL(url.format({
    pathname: path.join(__dirname, './public/html/pelmanism.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //pelmanismWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  pelmanismWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    pelmanismWindow = null
    if(answerWindow != null){
      answerWindow.close()
    }

  })

}

function createAnswerWindow(){
  console.log("create answer window")
  answerWindow = new BrowserWindow({width:displayWidth*DISPLAY_MAGNIFICATION, height:displayHeight*DISPLAY_MAGNIFICATION,x:displayWidth*0.2,y:displayHeight*0.2})

  //answerWindow.webContents.openDevTools()

  answerWindow.loadURL(url.format({
    pathname: path.join(__dirname, './public/html/answer.html'),
    protocol:'file:',
    slashes: true
  }))
  answerWindow.on('closed',() => {
    answerWindow = null
  })
}


function initCardList(){
      return new Promise((resolve,reject)=>{
        ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"].forEach((elm, ind, arr) => {
            console.log("init card list")
            cardList.push(new Card(IMAGE_PATH + MARK_HEARTS + elm + ".png", ind + 1));
            cardList.push(new Card(IMAGE_PATH + MARK_CLUBS + elm + ".png", ind + 1));
            cardList.push(new Card(IMAGE_PATH + MARK_SPADES + elm + ".png", ind + 1));
            cardList.push(new Card(IMAGE_PATH + MARK_DIAMONDS + elm + ".png", ind + 1));
            if (ind < 2) {
                cardList.push(new Card(IMAGE_PATH + MARK_JOKERS + elm + ".png", 14));
            }
        });
        //console.log(cardList);
        cardList.sort((a, b) => {
            return a.weight < b.weight ? 1 : -1;
        });
        console.log(cardList[0]);
        //console.log(cardList);
        resolve(cardList);
      })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready',()=>{

  displayWidth = electron.screen.getPrimaryDisplay().size.width
  displayHeight = electron.screen.getPrimaryDisplay().size.height
  console.log(displayWidth)
  console.log(displayHeight)

  initCardList().then(createAnswerWindow).then(createPelmanismWindow)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  //On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
 if (process.platform !== 'darwin') {
   app.quit()
 }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (pelmanismWindow === null) {
    createPelmanismWindow()
  }
})


// ipc event
//var syncFlg = false≈
ipcMain.on("syncCardList",(event, arg)=>{
  // if(!syncFlg){
  //   event.sender.send('syncCardList',)
  // }
//  answerWindow
  event.sender.send('syncCardList',{cardList:cardList});
})



ipcMain.on("startGame",(event, arg)=>{
    answerWindow.webContents.send('startGame',{});
    event.sender.send("startGame",{});
})

ipcMain.on("restartGame",(event,arg)=>{
  pelmanismWindow.close();
  cardList = [];
  initCardList().then(createAnswerWindow).then(createPelmanismWindow)
  //pelmanismWindow.webContents.openDevTools()
})
