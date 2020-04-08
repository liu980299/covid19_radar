import { Component,ViewChild,ElementRef } from '@angular/core';
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
declare var BackgroundGeolocation, cordova: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  id : number;
  mobile: string;
  baseUrl = "http://192.168.2.145:8000";
  code : any;
  verify:any;
  app : any;
  test : string;
  tick$ = Observable.interval(1000);  
  subscription : any;
  timeout : 36;
  life : 0;
  update: 0;
  phone: string;
  started : boolean = false;
  contacts : any;
  form = {"layout":[{"key":"phone","type":"tel"}],"schema":{"type":"object","properties":{"phone":{"type":"string"}}},"data":{},"verify":true};
  options = {"loadExternalAssets":false,addSubmit:false};
  url:string;
  err:any;
  CSRF_HEADER = "X-CSRFToken";
  places:{};
  api_key = 'EH0GHbslb0pNWAxPf57qA6n23w4Zgu5U';
  dir:string = ".";
  contact_list = [];
  env_risk: number = 0;
  spin_show:boolean;
  mode : boolean = true;
  seconds : number = 0;
  last_contact =[];
  secs = 0;
  doc : any;
  http : any
  @ViewChild('iframe') iframe: ElementRef;
  messages = {};
  message_id = 0;

  constructor(public navCtrl: NavController,public navParams: NavParams, public alertController: AlertController, private platform: Platform, private file:File,
    private spinner : NgxSpinnerService) {
    this.app = navParams.data.app;        
    this.app.child = this;
    this.contacts = {};
    this.verify={status:false,title:"Send Code",secs:0}
    this.contacts[this.getDate()] = {};
    platform.ready().then(() => {
      if (!this.id){
        if (!this.form){
          this.fetch(this.postAction.bind(this),"/contacts/forms/add_profile/","GET",null);        
        }        
      }        
      this.tick$.subscribe(function(){
        this.secs++
        if (this.secs %5 == 0){
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
  
        }
      //   cordova.plugins.cueaudio.input("test", this.listenEvent,this.error);       
       }.bind(this));    
       if((<any>window).cordova.plugin.http){
          console.log("http plugin for access different domain");
          this.http = cordova.plugin.http;
          this.http.setDataSerializer('json');
          this.http.options(this.baseUrl,null,null,this.setCSRF.bind(this),this.error);
      }
  
      //  var fetcher = {src:"http://192.168.2.145:8000/get_sender/",height:0,width:0,x:0,y:0,}
      //  wizViewManager.create("fetcher",fetcher, this.success,this.error);
    });    
    window.onmessage = this.dispatch.bind(this);
  }

  setCSRF(){
    var cookie = this.http.getCookieString(this.baseUrl);
    var values = cookie.split(";")
    console.log(values);
    for (let value of values){
      var items = value.trim().split("=");
      if(items[0] == "csrftoken"){
        this.http.setHeader(this.CSRF_HEADER,items[1]);
      }
    }
  }


  error(error){
    console.log(error);
  }

  dispatch(cb,event){
    // var data = event.data;
    this.setCSRF();
    var data = event;
    if (data){
      const jsonData=JSON.parse(data.data,function(key,value){
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
      if (cb){
        cb(jsonData);
      }else{
        this.messages[data.message_id](jsonData);
      }
      
    }
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

  //reuse the framework to send the code to the user for verifying the phone
  sendCode(){    
    if (!this.verify){
      this.verify = {secs:0};
    }
    this.verify.status = true;
    this.subscription = this.tick$.subscribe(function(){ 
      this.verify.secs++;
      this.verify.title = "Send Code (" + (60 - this.verify.secs) + ")";      
      if (this.verify.secs >= 60){
        this.verify.status=false;
        this.verify.secs = 0;
        this.verify.title = "Send Code"
        this.subscription.unsubscribe();
      }
    }.bind(this));
    var context = {};
    context["data"]=this.form.data;					 
    context["target"] = {"app":"COVID-19 RADAR","key":"phone"};
    console.log(context);
    this.fetch(this.passCode.bind(this), '/code/','POST',context);
    }
  
  passCode(data){
    console.log(data)
  }

  start(){
    if (!this.started && this.id){
      if ((<any>window).cordova){
        this.dir = ".";
        cordova.plugins.cueaudio.createInstance(this.api_key, this.listenEvent.bind(this), this.err);
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
          cordova.plugins.cueaudio.input(this.id,this.success,this.err);  
          // cordova.plugins.cueaudio.enableListening(false);
          this.seconds = result.seconds;
          this.mode = false;
        }else{
          if (result.seconds >= this.seconds + 3 && (!this.mode)){
            // cordova.plugins.cueaudio.enableListening(true);
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
    content["data"]["code"] = this.verify.code;
    if ((<any>window).device && this.url=='add_profile'){
      content["data"]["device"] = (<any>window).device;
    }
    this.fetch(this.postAction.bind(this),"/contacts/add_profile/","POST",content);
  }

  cancel(){
    this.form = null;
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
    this.fetch(this.getData.bind(this),"/contacts/update_contacts/","POST",content);
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
      this.fetch(this.updateRisk.bind(this),'/contacts/check_risk/','POST',content);
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
    this.fetch(this.postAction.bind(this),"/contacts/forms/set_profile/","GET",null);
  }

  onload(){

    this.doc =  this.iframe.nativeElement.contentWindow;
    console.log(this);
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
    if(this.http){
        var method = method.toLowerCase()    
        this.http[method](this.baseUrl + url, content,{},this.dispatch.bind(this,cb),this.error);
    }

    // content = {url:url,method:method,content:content,message_id:message_id};
    // (<any>window).wizViewMessenger.postMessage(content,"fetcher");
    // this.doc.postMessage(content,"http://192.168.2.145:8000/");    
  }  

}
