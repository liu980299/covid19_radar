import { Component } from '@angular/core';
import { NavController ,NavParams, Platform} from 'ionic-angular';
import { Observable} from 'rxjs';
import { ObserveOnMessage } from 'rxjs/operators/observeOn';
import { AlertController } from 'ionic-angular';
import { NgxSpinnerService } from "ngx-spinner";
import { File } from '@ionic-native/file';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule
} from "@angular/material";

import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
declare var BackgroundGeolocation, cordova, sleeptimer: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  id : number;
  mobile: string;
  code : any;
  app : any;
  test : string;
  tick$ = Observable.interval(5000);
  timeout : 36;
  life : 0;
  update: 0;
  phone: string;
  started : boolean = false;
  contacts : any;
  form : {"name":"add_profile","description":"Add a new profile","url":"add_profile","form":{"layout":[{"key":"phone"}],"schema":{"type":"object","properties":{"phone":{"type":"string"}}}},"data":{}};
  options : {"loadExternalAssets":true};
  url:string;
  err:any;
  places:{};
  api_key = 'EH0GHbslb0pNWAxPf57qA6n23w4Zgu5U';
  dir:string = ".";
  contact_list = [];
  env_risk: number = 0;
  spin_show:boolean;
  mode : boolean = true;
  seconds : number = 0;
  last_contact =[];

  constructor(public navCtrl: NavController,public navParams: NavParams, public alertController: AlertController, private platform: Platform, private file:File,
    private spinner : NgxSpinnerService) {
    this.app = navParams.data.app;        
    this.app.child = this;
    this.contacts = {};
    this.contacts[this.getDate()] = {};
    platform.ready().then(() => {
      if (!this.id){
        if (!this.form){
          this.fetch(this.postAction.bind(this),"contacts/forms/add_profile/","GET",null);        
        }        
      }        
      this.tick$.subscribe(function(){
        if (this.id){
          if (this.spin_show){
            this.spin_show = false;
            this.spinner.hide();
          }else{
            this.spin_show = true;
            this.spinner.show();
          }  
          this.checkRisk();
        }else{
          this.spinner.hide();
        }        
      //   cordova.plugins.cueaudio.input("test", this.listenEvent,this.error);       
       }.bind(this));    
    });    
  }

  getDate(){
    let date = new Date();
    var days = date.getDate().toString();
    days = ("0" + days).substr(days.length-1);
    var months = date.getMonth().toString();
    months = ("0" + months).substr(months.length-1);
    return date.getFullYear() + "-" + months + "-" + days;
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      title: 'Error',
      subTitle: 'ConorV not working',
      message: 'Please restart the ConorV or reboot your phone',
      buttons: ['OK']
    });

    await alert.present();
  }


  start(){
    if (!this.started && this.id){
      if ((<any>window).cordova){
        this.dir = ".";
        cordova.plugins.cueaudio.createInstance(this.api_key, this.listenEvent.bind(this), this.error);
        if (this.file.checkFile(cordova.file.externalDataDirectory,"contacts.json")){
          this.file.readAsText(cordova.file.externalDataDirectory,"contacts.json").then((value)=>{
            console.log(value);
            let contacts = JSON.parse(value);
            this.contacts = contacts;
          });                  
        }
      }      
      cordova.plugins.cueaudio.timer((result)=>{
        var random = Math.ceil(Math.random() * 10);
        if ((result.seconds + random )%20 == 0){
          console.log(Date());
          cordova.plugins.cueaudio.input(this.id,this.success,this.error);  
          cordova.plugins.cueaudio.enableListening(false);
          this.seconds = result.seconds;
          this.mode = false;
        }else{
          if (result.seconds >= this.seconds + 3 && (!this.mode)){
            cordova.plugins.cueaudio.enableListening(true);
            this.mode = true;
          }
        }
      },(error)=>{console.log(error)});
      this.encodeId()
      this.heartbeatCode();
      this.tick$.subscribe((value)=>{
        this.life++;
        if (this.life > this.timeout){
          this.app.backgroundMode.moveToForeground();
          this.presentAlert();
          console.log(navigator);
          //navigator['app'].exitApp();        
        }
        // this.update++;
        // if (this.update == 11){
        //   this.update = 0;
        //   this.file.writeFile(".","contacts_json",JSON.stringify(this.contacts))
        //   var content = {}
        //   content["contacts"] = this.contacts;
        //   content["id"] = this.id;
        //   content["phone"] = this.phone;
        //   this.fetch(this.getData.bind(this),"contacts/update_contacts","POST",content)
        // }
      })
      this.started = true;
    }
  }

  submit(){
    this.err = null;
    var content = {}
    content["data"] = this.form.data;
    if (this.id){
      content["id"] = this.id;
    }
    if (this.phone){
      content["phone"] = this.phone;
    }
    if ((<any>window).device && this.url=='add_profile'){
      content["data"]["device"] = (<any>window).device;
    }
    this.fetch(this.postAction.bind(this),"contacts/" + this.url + "/","POST",content);
  }

  postAction(data){    
    if (!data.error){
      this.form = null;
      Object.assign(this,data);
      console.log(this);
      if (this.form){
        if (!this.form.data){
          this.form.data = {};
        }
      }
      if (this.id && (<any>window).cordova){
        this.start();
      }
    }else{
      this.err = data.error;
    }
  }

  getContacts(){
    var today = this.getDate();
    var size = 0;
    if (this.contacts && this.contacts[today]){
      var contacts = this.contacts[today];

      for (let id in contacts){
        if (contacts[id] >= 3){
          size++;
        }
      }    
    }
    return size;
    
  }
  getPlaces(){
    if (this.places && this.places[this.getDate()]){
      return Object.keys(this.places[this.getDate()]).length;
    }
    return 0;    
  }
  encodeId(){
    this.code = [];
    if (this.id){
      var first = this.id / (255 * 255 * 255);
      var second = (this.id % (255 * 255 * 255) )/ (255 * 255);
      var third = ((this.id % (255 * 255 * 255) ) % (255 * 255))/255;
      var four = ((this.id % (255 * 255 * 255) ) % (255 * 255)) % 255;
      var checkNum = (first + 1)%10 * 4 + (second+1)%10 *3 + (third+1)%10*2 + (four+1)%10;
      this.code = [first + 1, second + 1, third + 1, four +1, checkNum];
    }
  }
  decodeId(message){
    var data = JSON.parse(message);
    if (data["trigger-as-number"]){
      return data["trigger-as-number"];
    }

    // if (data["winner-indices"]){
    //   var items = data["winner-indices"].split(".");
    //   if (items.length==5){
    //     var codes = [];
    //     for (let item of items){
    //       codes.push(parseInt(item));
    //     }
    //     if (codes[4] == codes[0]%10 *4 + codes[1]%10*3 + codes[2]%10*2 + codes[3]%10){
    //       return (codes[0] - 1)*255*255*255 + (codes[1] - 1)*255*255 + (codes[2] - 1) *255 + codes[3] - 1;
    //     }  
    //   }
    // }
  }

  update_contacts(){
      this.file.writeExistingFile(cordova.file.externalDataDirectory,"contacts.json",JSON.stringify(this.contacts)).then(
        (event)=>{
          console.log(event)}).catch((error)=>{console.log(error);
          }
        );
    
    var content = {}
    content["contacts"] = this.contacts;
    content["id"] = this.id;
    content["phone"] = this.phone;
    this.fetch(this.getData.bind(this),"contacts/update_contacts/","POST",content);
  }

  heartbeatCode(){
    // var message = String.fromCharCode(...this.code);
    var message = "" + this.id;
    BackgroundGeolocation.onHeartbeat((event)=>{this.update_contacts()})    
    BackgroundGeolocation.onHeartbeat((event)=>{
         this.checkRisk.bind(this);
      })        
      // if ((<any>window).sleeptimer){
      //   sleeptimer.sleep((result)=>{
      //     console.log(result);
      //     if(result.type === "sleep"){
      //       console.log(Date());            
      //       cordova.plugins.cueaudio.input(5,this.id,this.success,this.error);  
      //     }
      //     if (result.type ==="countdown"){
      //       if (result.timeleft % 5 == 0){
      //         console.log(Date());            
      //         cordova.plugins.cueaudio.input(5,this.id,this.success,this.error);  
      //       }
      //     }

      //   },(error)=>{
      //     console.log(error);
      //   },{sleep:60,countdown:true})

      // }
  
    for (var i = 0; i<12; i++){
      var timeout = i * 5;
      console.log("timeout : " + timeout);     
   }        
  }


  checkRisk(){
    var content = {contact_list:this.contact_list, phone:this.phone, id:this.id};
    if (this.last_contact.length == 0){
      this.env_risk = 0;
    }
    this.last_contact = this.contact_list;
    if (this.contact_list.length > 0){
      this.fetch(this.updateRisk.bind(this),'contacts/check_risk/','POST',content);
    }    
  }

  updateRisk(data){
    if (data){
      this.env_risk = data;
      this.contact_list = [];
    }

  }
  success(message){
    console.log(message);
  }
  listenEvent(data){    
    console.log(Date());
    console.log(data);
    
    var id = this.decodeId(data);
    console.log("id : " + id);
    if (id == this.id){
      this.life = 0;
    }else{
      if (id){
        this.contact_list.push(id);
        if (!this.contacts[this.getDate()]){
          this.contacts[this.getDate()] = {};
        }
        if (this.contacts[this.getDate()][id]){
          this.contacts[this.getDate()][id]++;
        }else{
          this.contacts[this.getDate()][id] = 1;  
        }
        
      }
    }

  }

  setProfile(){
    this.fetch(this.postAction.bind(this),"contacts/forms/set_profile/","GET",null);
  }

  getData(data){
    if (data.phone == this.phone){
      if (data.contacts){
        let contacts = this.contacts;
        let today = this.getDate();
        if (contacts[today] && data.contacts[today]){
          for (let id in data.contacts[today]){
            if (!contacts[today][id] || (data.contacts[today][id] > contacts[today][id])){
                contacts[today][id] = data.contacts[today][id];
            }
          }
        }else{
          if (!contacts[today] && data.contacts[today]){
            contacts[today] = data.contacts[today];
          }
        }
      }
    }
  }

  fetch(cb,url,method,content) {
    console.log("Base url : " + this.app.baseUrl);
    url = this.app.baseUrl + url;
    const req = new XMLHttpRequest();
    req.open(method,url);
    req.onload = function(){
      let parent = this;
      const data=JSON.parse(req.response,function(key,value){
        if (value && (typeof value === 'string')){
          if (value.indexOf("function") === 0) {
            // we can only pass a function as string in JSON ==> doing a real function
            var jsFunc = new Function('return ' + value)();
            return jsFunc;
          }
          if (value.indexOf("$this") >=0){
            return parent;
          }
        }
        return value;
      }
      ); 
      cb(data);
    };
    req.onerror = function(error){
      console.log(error);
      this.err = "Connection issue, please retry!"
    }.bind(this);
    req.setRequestHeader("Content-Type", "application/json");
    if (method=='POST'){
     if (content instanceof FormData ){
      req.send(content);
     }else{
      req.send(JSON.stringify(content));
     }
      
//     this.http.post(url,content).subscribe(cb);
    }else{
//      this.http.get(url).subscribe(cb)
      req.send();
    }
    
  }



  error(err){
    console.log("error", err);
  }

}
