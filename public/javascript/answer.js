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

var OPEN_LIMIT = 2;
var openCount = 0;

class Card{
  constructor(object,ind){
    this.url = object.url;
    this.number = object.number;
    this.weight = object.weight;
    this.flg = object.flg;
    this.index = ind;
    this.setCardItem(false);
  }

  setFrontSide(side){
    this.front = document.createElement("img");
    this.front.style.position = "absolute";
    this.front.style.width = String(this.width) + "px";
    this.front.style.height = String(this.height) + "px";
    // margin + column * cardHeight
    this.front.style.top = String((this.column + 1) * ((this.windowHeight-this.height*this.totalColumn) / (this.totalColumn+1)) + (this.column * this.height))+"px";
    // margin + row * cardWidth
    this.front.style.left =  String((this.row + 1) * ((this.windowWidth-this.width*this.totalRow) / (this.totalRow+1)) + (this.row * this.width))+"px";
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
    this.back.style.width = String(this.width) + "px";
    this.back.style.height = String(this.height) + "px";
    // margin + column * cardHeight
    this.back.style.top = String((this.column + 1) * ((this.windowHeight-this.height*this.totalColumn) / (this.totalColumn+1)) + (this.column * this.height))+"px";
    // margin + row * cardWidth
    this.back.style.left = String((this.row + 1) * ((this.windowWidth-this.width*this.totalRow) / (this.totalRow+1)) + (this.row * this.width))+"px";
    console.log(this.back.style.left);
    this.back.onload = ()=>{
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




}


document.body.style.width = String(windowWidth)+"px";
document.body.style.height = String(windowHeight)+"px";

var cover_div = document.createElement('div');
cover_div.style.width = String(windowWidth)+"px";
cover_div.style.height = String(windowHeight) + "px";
cover_div.style.backgroundColor = "black";
cover_div.style.position = "absolute";
cover_div.style.zIndex = 1;
document.body.appendChild(cover_div);

/*
  methods
*/
function init(){
  ipcRenderer.send('syncCardList',{});
}


function startGame(){
  cover_div.parentNode.removeChild(cover_div);
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

ipcRenderer.on("startGame",(event,arg)=>{
  startGame();
});



init();
