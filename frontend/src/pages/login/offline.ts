import { IonicPage, AlertController, NavParams, NavController } from "ionic-angular";
import { Component } from "@angular/core";
import { Storage } from '@ionic/storage';
import { PetInfo } from "../../model/pet";

@IonicPage()
@Component({
  selector: 'page-offline',
  templateUrl: 'offline.html',
})
export class OfflinePage {

    private Vet = null;
    private User = null;
    private currentAppointments : Array<String>;
    private pastAppointments : Array<String>;
    private currentBookings : Array<String>;
    private pastBookings: Array<String>;
    private currentPets : Array<PetInfo>;

    constructor(
        public navCtrl: NavController,
         public navParams: NavParams,
        private alertCtrl: AlertController,
        private storage : Storage) {


            let userType = navParams.get("userType");
            if(userType == "Vet"){
                this.Vet = true;
            }else if(userType == "User"){
                this.User = true;
            }else{
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: "UserType is not valid",
                    buttons: ['OK']
                  });
                    alert.present();
                    this.navCtrl.pop();
            }

            this.getData(userType);
      }
    
    getData(userType : string){
        if(userType == "Vet"){
            this.storage.get("CurrentAppointments").then(result=>{
                this.currentAppointments = result;
            }).catch(error=>{
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: error,
                    buttons: ['OK']
                  });
                    alert.present();
            })

            this.storage.get("PastAppointments").then(result=>{
                this.pastAppointments = result;
            }).catch(error=>{
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: error,
                    buttons: ['OK']
                  });
                    alert.present();
            })

        }

        if(userType == "User"){
            this.storage.get("CurrentBookings").then(result=>{
                this.currentBookings = result;
            }).catch(error=>{
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: error,
                    buttons: ['OK']
                  });
                    alert.present();
            })

            this.storage.get("PastBookings").then(result=>{
                this.pastBookings = result;
            }).catch(error=>{
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: error,
                    buttons: ['OK']
                  });
                    alert.present();
            })

            this.storage.get("PetDatas").then(result=>{
                this.currentPets = result;
            }).catch(error=>{
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    message: error,
                    buttons: ['OK']
                  });
                    alert.present();    
            })
        }
    }



}