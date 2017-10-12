import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { OwnerHomePage } from '../pages/home/ownerHome/ownerHome';
import { VetHomePage } from '../pages/home/vetHome/vetHome';
import { LoginPage } from "../pages/login/login";
import { RedirectPage } from "../pages/redirect/redirect";
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule }from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { RegisterOwnerPage } from "../pages/register/registerOwner/register";
import { BookingsPage } from "../pages/bookings/bookings";
import { UserStorePage} from "../pages/store/userStore/UserStore";
import { CalendarPage } from "../pages/calendar/calendar";
import { PetPage } from "../pages/pet/pet";
import { EditProfilePage} from "../pages/editprofile/editprofile";
import { HttpModule } from "@angular/http";
import { ProfilePageModule } from "../pages/profile/profile.module";
import { HttpServiceProvider } from '../providers/http-service/http-service';
import { AvailModal } from '../pages/calendar/availModal';
import { MakeBookingModal } from "../pages/bookings/MakeBookingModal";
import { FindNearestVet} from "../pages/bookings/FindNearestVet";
import { VetBookingsPage } from '../pages/bookings/vetBookings';
import { VetStorePage} from "../pages/store/vetStore/VetStore";
import { Camera } from '@ionic-native/camera';
import { PictureEditPage } from '../pages/profile/pictureEdit';
import { HeapModal } from '../pages/bookings/HeapModal';


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
    OwnerHomePage,
    VetHomePage,
    UserStorePage,
    CalendarPage,
    BookingsPage,
    RedirectPage,
    AvailModal,
    MakeBookingModal,
    FindNearestVet,
    EditProfilePage,
    VetBookingsPage,
    VetStorePage,
    PictureEditPage,
    HeapModal
],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpModule,
    ProfilePageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    OwnerHomePage,
    VetHomePage,
    UserStorePage,
    CalendarPage,
    BookingsPage,
    RedirectPage,
    AvailModal,
    MakeBookingModal,
    FindNearestVet,
    EditProfilePage,
    VetBookingsPage,
    VetStorePage,
    PictureEditPage,
    HeapModal
  ],
  providers: [
    AngularFireDatabase,
    StatusBar,
    SplashScreen,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HttpServiceProvider
  ]
})
export class AppModule {}
