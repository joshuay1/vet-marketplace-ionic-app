import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from "../pages/login/login";
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule }from 'angularfire2/auth'; 
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { RegisterPage }from "../pages/register/register";

var config = {
  apiKey: "AIzaSyD16Z_p-S5LgSceHoL3ob7gRNSqqFaPbWQ",
  authDomain: "vetquoll-c22f9.firebaseapp.com",
  databaseURL: "https://vetquoll-c22f9.firebaseio.com",
  projectId: "vetquoll-c22f9",
  storageBucket: "vetquoll-c22f9.appspot.com",
  messagingSenderId: "1063752403506"
};

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage
  ],
  providers: [
    AngularFireDatabase,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
