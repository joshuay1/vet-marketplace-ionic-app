
import { Component, ViewEncapsulation } from '@angular/core';
import { ProfilePage } from "../../profile/profile";
import { StorePage} from "../../store/store";
import { BookingsPage } from "../../bookings/bookings";

@Component({
  templateUrl: 'ownerHome.html'
})
  export class OwnerHomePage {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    tab1Root = BookingsPage;
    tab2Root = ProfilePage;
    tab3Root = StorePage;

    constructor() {

    }
 }
