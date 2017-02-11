const {
    ipcRenderer
} = require('electron');

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
console.log(windowWidth);
console.log(windowHeight);

const CARD_COLUMN = 6;
const CARD_ROW = 9;

const IMAGE_PATH = "../images/";
const MARK_HEARTS = "h";
const MARK_CLUBS = "c";
const MARK_SPADES = "s";
const MARK_DIAMONDS = "d";
const MARK_JOKERS = "x";
var cardList = [];
var cardStack = null;
var openLock = true;
var matchCount = 0;

var startTime = null;
var endTime = null;

class Card{
  constructor(object,ind){
    this.url = object.url;
    this.number = object.number;
    this.weight = object.weight;
    this.flg = object.flg;
    this.index = ind;
    this.setCardItem(true);
  }

  setFrontSide(side){
    this.front = document.createElement("img");
    this.front.style.position = "absolute";
    this.front.id = this.url;
    this.front.style.width = String(this.width) + "px";
    this.front.style.height = String(this.height) + "px";
    // margin + column * cardHeight
    this.front.style.top = String((this.column + 1) * ((this.windowHeight-this.height*this.totalColumn) / (this.totalColumn+1)) + (this.column * this.height))+"px";
    // margin + row * cardWidth
    this.front.style.left = String((this.row + 1) * ((this.windowWidth-this.width*this.totalRow) / (this.totalRow+1)) + (this.row * this.width))+"px";
    this.front.onload = ()=>{
          if(!side){
            document.body.appendChild(this.front);
          }
    }
    this.front.src = this.url;
  }
  setBackSide(side){
    this.back = document.createElement("img");
    this.back.style.position = "absolute";
    this.back.id = this.url;
    this.back.style.width = String(this.width) + "px";
    this.back.style.height = String(this.height) + "px";
    // margin + column * cardHeight
    this.back.style.top = String((this.column + 1) * ((this.windowHeight-this.height*this.totalColumn) / (this.totalColumn+1)) + (this.column * this.height))+"px";
    // margin + row * cardWidth
    this.back.style.left = String((this.row + 1) * ((this.windowWidth-this.width*this.totalRow) / (this.totalRow+1)) + (this.row * this.width))+"px";
    console.log(this.back.style.left);
    this.back.onload = ()=>{
      this.back.addEventListener("click",(event)=>{
        // 外依存
        if(!openLock){
          this.changeSide();
          checkNumber(this);
        }
      })
      if(side){
        document.body.appendChild(this.back);
      }
    }
    this.back.src = "../images/z02.png";
  }

  setCardItem(side){
      //number : 0 -> length-1
      this.side = side; //true -> front
      this.totalColumn = CARD_COLUMN;
      this.totalRow = CARD_ROW;
      this.windowWidth = windowWidth;
      this.windowHeight = windowHeight;
      this.column = Math.floor(this.index/CARD_ROW)
      this.row = this.index % CARD_ROW
    if(windowHeight < windowWidth){
        this.height = windowHeight / (CARD_COLUMN+1);
        this.width = this.height * 2 / 3;
    }else{
      this.width = windowWidth / (CARD_ROW+1);
      this.height = this.width * 3 / 2;
    }
    this.setFrontSide(side);
    this.setBackSide(side);
  }

  changeSide(){
    if(this.side){
      document.body.removeChild(this.back);
      document.body.appendChild(this.front);
      this.side = !this.side;
    }else{
      document.body.removeChild(this.front);
      document.body.appendChild(this.back);
      this.side = !this.side;
    }
  }

}


document.body.style.width = String(windowWidth)+"px";
document.body.style.height = String(windowHeight)+"px";

var start_button = document.createElement("button");
start_button.addEventListener('click',(event)=>{
  ipcRenderer.send('startGame',{});
  startGame();
});

start_button.innerHTML = "<font size='50'>start</font>";
start_button.style.position = "absolute";
start_button.style.zIndex = 1;
start_button.style.width = "40%";
start_button.style.height = "40%";
start_button.style.left = "30%";
start_button.style.top = "30%";

document.body.appendChild(start_button);

/*
  methods
*/
function init(){
  ipcRenderer.send('syncCardList',{});
}


function checkNumber(card){
  if(cardStack == null){
    cardStack = card;
  }else{
    if(card.number == cardStack.number){
      card.flg = true;
      cardStack.flg = true;
      matchCount++;
      if(matchCount == 27){
        //終了
        endTime = new Date();
        const box_div = document.createElement("div");
        const result_h1 = document.createElement("h1");
        box_div.style.background = "black";
        box_div.style.width = "100%";
        box_div.style.height = "100%";
        box_div.style.opacity = "0.5"
        box_div.style.zIndex = 10;
        result_h1.style.backgroundColor = "white";
        result_h1.style.position = "absolute";
        result_h1.style.textAlign = "center";
        result_h1.style.top ="45%";
        result_h1.style.width = "100%";
        result_h1.style.zIndex = 10;
        result_h1.innerHTML = String((endTime - startTime) / 1000) + "  seconds";
        result_h1.addEventListener("click",(event)=>{
          ipcRenderer.send("restartGame",{});
        })
        box_div.appendChild(result_h1);
        document.body.appendChild(box_div);
      }
      cardStack = null;
    }else{
      openLock = true;
      setTimeout(()=>{
        card.changeSide();
        cardStack.changeSide();
        cardStack = null;
        openLock = false;
      },1000)
    }
  }
}

function startGame(){
  ipcRenderer.send("startGame",{});
}

/*
  ipc events
*/
ipcRenderer.on('syncCardList',(event,arg)=>{
  //ipcRenderer.send('syncCardList',{cardlist:cardList});

  arg.cardList.forEach((elm,ind,arr)=>{
      cardList.push(new Card(elm,ind))
    });

});

ipcRenderer.on('startGame',(event,arg)=>{
  start_button.parentNode.removeChild(start_button);
  openLock=false;
  startTime = new Date();
})




init();
