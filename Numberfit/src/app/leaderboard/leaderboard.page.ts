import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { NativeStorage }     from '@ionic-native/native-storage/ngx';
import { Router }            from '@angular/router';
import { HTTP }              from '@ionic-native/http/ngx';

@Component({
  selector    : 'app-leaderboard',
  templateUrl : 'leaderboard.page.html',
  styleUrls   : ['leaderboard.page.scss'],
})

export class HomePage {
  server : string = require('../config.json').server;
  cookie : string;
  user   : any;
  users  : Array<Object>;
  points : number = 0;

  constructor(
    private screenOrientation : ScreenOrientation,
    private nativeStorage     : NativeStorage,
    private http              : HTTP,
    private router            : Router,
  ) {
    // lock screen portrait
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    // Get cookie from storage
    this.nativeStorage.getItem('cookie')
    .then((data) => {this.cookie = data.cookie});
    // Get user
    this.nativeStorage.getItem('user')
    .then((data) => {
      this.user = data
      this.points = data.points

      if(this.user.teacher){
        document.getElementById("myScore").style.visibility = "hidden"
      }

      // Get top scores from given school
      this.http.get(this.server+"/leaderboard?school="+this.user.school+"&cookie="+this.cookie,{},{})
      .then(data => {
        // Need to do a request which returns {user : [{user1...}]}
        this.users = JSON.parse(data.data).scores;

      })
      .catch(error => {
        console.log("status", error.status);
        console.log("error", error.error);
        this.router.navigate(['/play']);
        this.presentAlert("Connection","Error retrieving leaderboard.")

      });
    });

  }

  presentAlert(header, msg) {
    const alert = document.createElement('ion-alert');
    alert.header = header;
    alert.message = msg;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
  }

}
