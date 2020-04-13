import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { NgxSpinnerModule } from "ngx-spinner";
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { File } from '@ionic-native/file';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { JsonSchemaFormModule,MaterialDesignFrameworkModule,MaterialDesignFramework,Framework,JsonSchemaFormService,FrameworkLibraryService,WidgetLibraryService } from 'angular2-json-schema-form';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule
} from "@angular/material";

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,MaterialDesignFrameworkModule,    
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,    
    NgxSpinnerModule,
    IonicModule.forRoot(MyApp),
    {
      ngModule: JsonSchemaFormModule,
      providers: [
          JsonSchemaFormService,
          FrameworkLibraryService,
          WidgetLibraryService,
          {provide: Framework, useClass: MaterialDesignFramework, multi: true}
      ]
  }
    // JsonSchemaFormModule.forRoot(MaterialDesignFrameworkModule)
  ],
  bootstrap: [IonicApp],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,    
    BackgroundMode,
    Geolocation,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
