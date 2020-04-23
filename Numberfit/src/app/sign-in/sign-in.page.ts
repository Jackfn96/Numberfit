import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component }       from '@angular/core';
import { Router }          from '@angular/router';
import { Md5 }             from 'ts-md5/dist/md5';
import { NativeStorage }   from '@ionic-native/native-storage/ngx';
import { AlertController } from '@ionic/angular';



@Component({
  selector    : 'app-sign-in',
  templateUrl : './sign-in.page.html',
  styleUrls   : ['./sign-in.page.scss'],
})

export class SignInPage {

  signInFormGroup : FormGroup;
  server          : string = require('../config.json').server;
  cookie          : string;

  constructor(
    private nativeStorage   : NativeStorage,
    private alertController : AlertController,
    private router          : Router,
    formBuilder             : FormBuilder,
  ) {
    // Get server from config file
    // this.server = require('../config.json').server;
    // Get cookie from storage
    this.nativeStorage.getItem('cookie')
    .then((data) => {this.cookie = data.cookie});

    // Initialise sign in form group
    this.signInFormGroup = formBuilder.group({
      email    : ["", [Validators.required]],
      password : ["", [Validators.required]],
    });

  }

  signIn(){
    const credentials = {
      'username' : this.signInFormGroup.value.email.toLowerCase(),
      'password' : Md5.hashStr(this.signInFormGroup.value.password)
    }

    var DOM = this;
    var xhttp = new XMLHttpRequest();

    // Login request response handler
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var user = JSON.parse(this.responseText);
        DOM.nativeStorage.setItem('cookie', {cookie: user.cookie})
        .then(() => {
          DOM.nativeStorage.setItem('user', {
            username : user.username,
            name     : user.name,
            school   : user.school,
            year     : user.year,
            teacher  : user.teacher,
          })
          .then(() => {
            DOM.router.navigate(['/play'])
          }, error => console.error('Error storing user', error));
        }, error => console.error('Error storing cookie', error));
      } else if(this.status != 200) {
        console.log(this.responseText);
        DOM.presentAlert();
      }
    };
    xhttp.open("POST", this.server + "/login", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(credentials));

  }

  presentAlert() {
    const alert = document.createElement('ion-alert');
    alert.header = 'Error';
    alert.message = 'Please check your internet connection.';
    alert.buttons = ['OK'];

    document.body.appendChild(alert);
    return alert.present();
  }
}
