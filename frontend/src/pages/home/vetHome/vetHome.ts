import { Component, ViewEncapsulation } from '@angular/core';
import { ProfilePage } from "../../profile/profile";
import { CalendarPage } from "../../calendar/calendar";
import { VetBookingsPage } from '../../bookings/vetBookings';
import {VetStorePage} from "../../store/vetStore/VetStore";

@Component({
  templateUrl: 'vetHome.html'
})
  export class VetHomePage {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    tab1Root = VetBookingsPage;
    tab2Root = ProfilePage;
    tab3Root = VetStorePage;
    tab4Root = CalendarPage;

    constructor() {

    }
 }
