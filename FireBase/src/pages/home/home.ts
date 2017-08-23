
import { Component, ViewEncapsulation } from '@angular/core';
import { ProfilePage } from "../profile/profile";
import { SettingsPage } from "../settings/settings";
import { BookingsPage } from "../bookings/bookings";

@Component({
  templateUrl: 'home.html'
})
  export class HomePage {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    tab1Root = ProfilePage;
    tab2Root = BookingsPage;
    tab3Root = SettingsPage;
  
    constructor() {
  
    }
 }