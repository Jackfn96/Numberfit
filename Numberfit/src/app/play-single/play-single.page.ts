import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit }      from '@angular/core';
import { NativeStorage }          from '@ionic-native/native-storage/ngx';

@Component({
  selector    : 'app-play-single',
  templateUrl : './play-single.page.html',
  styleUrls   : ['./play-single.page.scss'],
})
export class PlaySinglePage implements OnInit {

  server           : string = require('../config.json').server;
  bucket           : string = require('../config.json').bucket;
  cookie           : string;
  user             : any;
  images           : Array<string>;
  imgState         : number;
  pictureRef       : string;
  questionArray    : Array<string>;
  questionCard     : string;
  questionState    : number;
  correctAnswer    : number; // button number
  answerOptions    : Array<number>;
  color            : string;
  correctCounter   : number = 0;
  incorrectCounter : number = 0;
  questionCardEle  : HTMLElement;
  videoEle         : HTMLElement;
  // ans1: number;


  constructor(
    private router          : Router,
    private activatedRoute  : ActivatedRoute,
    private nativeStorage   : NativeStorage,
  ) {
    // Get server from config file
    // this.server = require('../config.json').server;
    // Get cookie from storage
    this.nativeStorage.getItem('cookie')
    .then((data) => {this.cookie = data.cookie});

    this.user = this.nativeStorage.getItem('user');

    this.prepareProgressBar();

    this.prepareQuestions();

    this.getQuestionCards();

  }

  ngOnInit() {
    this.questionCardEle = <HTMLElement>document.querySelector('.question-card');
    this.videoEle = document.querySelector('.video-container');
  }

  getQuestionCards(){
    let subject = this.activatedRoute.snapshot.paramMap.get("subject");
    let qSetNumber =  18; // Number of question sets
    console.log("year returns as", typeof this.user.year)
    if(this.user.year == 1 && subject != "Time"){
      qSetNumber = 6; // For some reason year one have fewer resources on all but time
    }
    var questionSet = [];
    var checkList = [];
    while(questionSet.length!=12){
      let page = 4*Math.floor(Math.random() * qSetNumber);
      let card = page+Math.floor(Math.random() * 6); // 6 questions on each page
      let questRef = this.bucket+"/"+subject+"/"+this.user.year+"/beg/"+"PDF-"+page+"-"+card+".png"
      let answRef = this.bucket+"/"+subject+"/"+this.user.year+"/beg/"+"PDF-"+(page+2)+"-"+card+".png"
      if(!checkList.includes(questRef)){
        console.log(questRef)
        checkList.push(questRef);
        questionSet.push({
          question : questRef,
          answer   : answRef,
        })
      }
    }
  }

  // main operating function for the whole process
  updateProgress(userAnswer:number){
    // check if the answer is correct
    if (userAnswer==this.correctAnswer){
      // play video when needed
      this.playAudio(true);
      this.updateProgressBar();
      if(this.checkWin()){
        return;
      }
      this.updateQuestionCard();
      this.correctCounter += 1;
      if (this.correctCounter%3==0){
        this.switchVideoQuestions(true);
      }
    }
    else {
      this.playAudio(false);
      this.updateQuestionCard();
      this.incorrectCounter += 1;
    }
  }

  prepareProgressBar(){
    this.imgState = 0;

    this.images = ['Picture1', 'Picture2', 'Picture3', 'Picture4', 'Picture5', 'Picture6', 'Picture7', 'Picture8', 'Picture9'];

    this.pictureRef = this.images[this.imgState];
  }

  prepareQuestions(){

    this.questionState = 0;

    this.questionArray = ['Question1', 'Question2', 'Question3','Question4', 'Question5']; //read from database

    this.questionCard  = this.questionArray[this.questionState];

    this.answerOptions = [123,456,789,112]; // read from database

    this.correctAnswer = 1;//Math.ceil(Math.random() * 4); // read from database
  }

  shuffleAnswerOptions(array:Array<number>) {
    array.sort(() => Math.random() - 0.5);
    return array;
  }

  sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // sound effect at button click
  playAudio(correctness:boolean){
    let audio = new Audio();
    if (correctness){
      audio.src = "/assets/Sounds/answer_correct.wav";
    } else {
      audio.src = "/assets/Sounds/answer_incorrect.wav";
    }
    audio.load();
    audio.play();
  }

  enableButtons(enable: boolean) {
    let choiceButtons = document.querySelectorAll(".choice-button");
    for(var i=0; i<choiceButtons.length; i++){
      let button = <HTMLInputElement>choiceButtons[i];
      button.disabled = !enable;
    }
  }

  enableVideoOrQuestions(toVideo: boolean) {
    if (toVideo){
      this.questionCardEle.style.visibility = "hidden";
      this.videoEle.style.visibility = "visible";
    } else {
      this.questionCardEle.style.visibility = "visible";
      this.videoEle.style.visibility = "hidden";
    }
  }

  switchVideoQuestions(toVideo: boolean){
    this.enableVideoOrQuestions(toVideo);
    this.enableButtons(!toVideo);
    let backToGameButton = <HTMLElement>document.querySelector("#video-done-button");
    backToGameButton.style.visibility = toVideo? "visible":"hidden";
  }


  // the progress bar move one step forward with correct answer
  updateProgressBar(){
    this.imgState = ++this.imgState; //% this.images.length;
    this.pictureRef = this.images[this.imgState];
  }

  checkWin(): boolean {
    if (this.imgState>=12){

      var DOM = this;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          console.log(this.responseText)
        } else if(this.status != 200) {
          console.log(this.responseText);
        }
      };
      xhttp.open("POST", this.server+"/save-game", true);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send(JSON.stringify({
        cookie    : this.cookie,
        correct   : this.correctCounter,
        incorrect : this.incorrectCounter,
      }));

      this.enableButtons(false);
      let ele1 = <HTMLElement>document.querySelector('#balloon-effect');
      let ele2 = <HTMLElement>document.querySelector('.board');
      let ele3 = <HTMLElement>document.querySelector('.winning-container');
      let ele4 = <HTMLElement>document.querySelector('.congrats-label');
      let ele5 = <HTMLElement>document.querySelector('#star-animation');

      // star rain appears first
      ele5.style.visibility = "visible";
      this.questionCardEle.style.visibility = "hidden";
      this.videoEle.style.visibility = "hidden";

      this.sleep(2000).then(() => {
        ele1.style.animationPlayState = "running";
        ele2.style.visibility = "hidden";
        ele3.style.visibility = "visible";
        ele4.style.width = "100%";
      })
      // redirect to play page after congrats
      this.sleep(8000).then(() => {
        ele5.style.visibility = "hidden";
        this.router.navigateByUrl('/play');
        return true;
      })
    }
    return false;
  }

  // the question card changes regardless of correctness
  updateQuestionCard(){
    this.questionState = ++this.questionState % this.questionArray.length;
    this.questionCard = this.questionArray[this.questionState];
    // assume answerOptions has been read from database
    var correctAnswerNumber = this.answerOptions[0];
    this.answerOptions = this.shuffleAnswerOptions(this.answerOptions);
    this.correctAnswer = this.answerOptions.indexOf(correctAnswerNumber)+1;
    console.log("correct answer is: "+this.correctAnswer);
  }

}
