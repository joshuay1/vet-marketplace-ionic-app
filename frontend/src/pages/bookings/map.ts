import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions,
    CameraPosition,
    MarkerOptions,
    Marker
   } from '@ionic-native/google-maps';
import { Component } from "@angular/core/";
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { UserInfo } from '../../model/user';
import { AngularFireDatabase } from 'angularfire2/database';
   
@Component({
    selector: 'page-map',
     templateUrl: 'map.html'
})
export class MapPage {
    map: GoogleMap;
    mapElement: HTMLElement;
    private zoom = 14;
    private tilt = 30;
    private lat;
    private lng;
    private vetid;
    private loading;
    private vetDatas;
    private nearestVet: boolean;
    constructor(private googleMaps: GoogleMaps,
                public navCtrl: NavController,
                public navParams: NavParams,
                private db : AngularFireDatabase,
                public loadingCtrl: LoadingController) {

                this.vetDatas = navParams.get("vetdatas");
    }
   
    ionViewDidLoad() {
        this.loading = this.loadingCtrl.create({
            content: 'Loading Map ....'
          });
    
          this.loading.present();
        console.log("load map page");
        this.vetid = this.navParams.get("vetid");
        var near = this.navParams.get("status");
        if(near == "nearestVet"){
            this.nearestVet = true;
        }
        var refurl ="/geofire/Vet/"+this.vetid+"/l";
        console.log(refurl);
    
        this.db.database.ref(refurl).once('value',(snapshot)=>{
          var location : Array<String> = snapshot.val();
          this.lat = location[0];
          this.lng = location[1];
          this.loading.dismiss();
          this.loadMap();
        });  
    }
   
    loadMap() {
       this.loading.present();
       this.mapElement = document.getElementById('map');
   
       let mapOptions: GoogleMapOptions = {
         camera: {
           target: {
             lat: this.lat,
             lng: this.lng
           },
           zoom: this.zoom,
           tilt: this.tilt
         }
    };
   
       this.map = this.googleMaps.create(this.mapElement, mapOptions);
   
       // Wait the MAP_READY before using any methods.
       this.map.one(GoogleMapsEvent.MAP_READY)
         .then(() => {
           console.log('Map is ready!');
           this.loading.dismiss();
   
           var vetIds:Array<String> = this.navParams.get("vetids");
           for(var i = 0 ; i < vetIds.length; i++){
               var title;
               var icon;
               
               if(vetIds[i]== this.vetid ){
                   if(this.nearestVet){
                       title = "Current Vet",
                       icon = 'red';
                       this.addMarkers(title,icon, vetIds[i]);
                   }else{
                        title = "Selected Appointment";
                        icon = 'red';
                        this.addMarkers(title,icon, vetIds[i]);
                   }
                   
               }else{
                   if(this.nearestVet){
                    title = "Other Vet",
                    icon = 'blue';
                    this.addMarkers(title,icon, vetIds[i]);
                   }else{
                    title = "Other Appointments"
                    icon = 'blue';
                    this.addMarkers(title,icon, vetIds[i]);
                   }
                   
               }

                
           }
           
   
         });
     }

     addMarkers(title, icon, vetid){
         var lat;
         var lng;
         var refurl ="/geofire/Vet/"+vetid+"/l";
         console.log(refurl);
     
         this.db.database.ref(refurl).once('value',(snapshot)=>{
           var location : Array<String> = snapshot.val();
           lat = location[0];
           lng = location[1];
           var vet :UserInfo = this.vetDatas[vetid];
           var address = vet.streetnumber + " " + vet.streetname +" , "+ vet.suburb+" , "+vet.state+" "+vet.postcode;
           this.map.addMarker({
                title: "Dr. "+ vet.firstname+ " "+ vet.lastname,
                snippet: address,
                icon: icon,
                animation: 'DROP',
                position: {
                    lat: lat,
                    lng: lng
                }
             })
            .then(marker => {
                marker.on(GoogleMapsEvent.MARKER_CLICK)
                .subscribe(() => {
                });
            });
           
        }); 
        
     }

     createInformation(vetid:string){


     }
   }