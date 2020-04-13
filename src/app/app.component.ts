import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

import { HomePage } from '../pages/home/home';
import { Geolocation } from '@ionic-native/geolocation/ngx';
declare var cordova :any;
declare var BackgroundGeolocation,BackgroundFetch: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.html'
})
export class MyApp {  
    
  baseUrl = "https://www.dinostest.net";

  rootPage :any = HomePage;

  params : any;

  contacts :any;

  child:any;
  

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private backgroundMode: BackgroundMode,
    private geolocation : Geolocation    
    //private backgroundGeolocation: BackgroundGeolocation
  ) {
    this.initializeApp();
    platform.ready().then(() => {
      
      if ((<any>window).cordova){
        var VolumeControl = cordova.plugins.VolumeControl;
        VolumeControl.setVolume(0.5);
        VolumeControl.getVolume(console.log.bind(console));      
        // console.log(this);
        cordova.plugins.backgroundMode.enable();
        cordova.plugins.backgroundMode.on('activate', function() {
          // console.log("Background Mode ... ");
          cordova.plugins.backgroundMode.disableBatteryOptimizations(); 
        }.bind(this));
        //cordova.plugins.cueaudio.setMode(2);
        //cordova.plugins.cueaudio.onTriggerHeard(this.listenEvent, this.error);
        let fetchCallback = function(taskId) {
          // console.log('[js] BackgroundFetch event received: ', taskId);
          // Required: Signal completion of your task to native code
          // If you fail to do this, the OS can terminate your app
          // or assign battery-blame for consuming too much background-time
          cordova.plugins.backgroundMode.moveToForeground();            
          BackgroundFetch.finish(taskId);
      }.bind(this);
      
      let failureCallback = function(error) {      
          // console.log('- BackgroundFetch failed', error);
      };
  
      BackgroundFetch.configure(fetchCallback, failureCallback, {
          minimumFetchInterval: 15 // <-- default is 15
      });
    
     // Start the background-fetch API. Your callbackFn provided to #configure will be executed each time a background-fetch event occurs. NOTE the #configure method automatically calls #start. You do not have to call this method after you #configure the plugin
      BackgroundFetch.start();
  
      var config = {
        heartbeatInterval: 60,
        debug: false, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    };
      
      BackgroundGeolocation.ready((config),()=>{
      // console.log(BackgroundGeolocation);    
     },(err)=>{console.log("error",err)});
     BackgroundGeolocation.onHttp(response => {
      // console.log("[http] response: ", response.success, response.status, response.responseText);
    });
     BackgroundGeolocation.start(this.success,this.error);
    }


   

  //  BackgroundGeolocation.configure(config).then(()=>{

  //  BackgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe(function(event){console.log(event);console.log("Location Event")});

  //   BackgroundGeolocation.on(BackgroundGeolocationEvents.heartbeat).subscribe(function(event){console.log(event);console.log(Date())});
  
  //   BackgroundGeolocation.checkStatus().then((status) => {
  //     console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
  //     console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
  //     console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
  //     if (!status.isRunning) {
  //       BackgroundGeolocation.start(); //triggers start on start event
  //     }
  //   }
  
  //   );
  

  // });

  


  
  // this.backgroundGeolocation.headlessTask(function(event){
  //     console.log(event.name);
  //     cordova.plugins.cueaudio.input("test", this.listEvent,this.error);
  //   }.bind(this)).then(function(){
  //     console.log("Finish Input ...");
  //   });
  
    });


  }

  heartbeatCode(message){
    for (var i = 0; i<12; i++){
      var timeout = i * 5;      
     BackgroundGeolocation.onHeartbeat((event)=>{
       cordova.plugins.cueaudio.input(timeout,message,this.listenEvent,this.error);
     });
 
   }        

  }

  listenEvent(json){
    // console.log(json);
    // try{
    //   var data = JSON.parse(json);


    // }catch(e){
    //   console.log(e);
    // }
    
    // console.log("Heard message :" + json);    
  }

  success(funcStr){
    console.log("success " + funcStr);
    console.log(Date());
  }

  error(message){
    console.log("Error " + message);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.params = {"app":this};
  }
}
