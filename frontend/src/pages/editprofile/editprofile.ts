import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { UserInfo } from "../../model/user";
import { FormGroup ,FormBuilder,Validators} from "@angular/forms";
import { RequestOptions, Http, Headers } from "@angular/http";

/**
 * Generated class for the EditprofilePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
})
export class EditProfilePage {
  userInfo ={} as UserInfo;
  profileData : FirebaseObjectObservable<UserInfo>;
  loading;  registerForm: FormGroup;
  uid: String;
  private apiUrl = 'http://115.146.86.193:8080/';
  
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private afAuth: AngularFireAuth,
              private db : AngularFireDatabase,
              private alertCtrl: AlertController,
              private builder: FormBuilder,
              private http: Http) {
               
                 /*this.db.list(`users/${data.uid}`).subscribe(snapshots =>{
                    console.log ("snapshots=" +snapshots);
                    console.log("value = "+ snapshots.values);
                    /*snapshots.forEach(snapshot=>{
                      console.log(" key = "+Object.values());
                      //this.profileData.push(Object.keys(snapshot));
                    });*/
                    //console.log("ProfileData = "+ this.profileData);
                    /*snapshots.forEach(snapshot=>{
                      //console.log("snapshot = "+snapshot.key()) ;
                      snapshot.array.forEach(element => {
                        console.log(element);
                      });
                      //console.log(snapshot.val());
                      //this.profileData = snapshot.val();
                    })*/
                    this.afAuth.authState.subscribe(data=>{
                      this.uid = data.uid;
                      console.log("uid = "+this.uid);
                      this.profileData = this.db.object(`users/`+this.uid/*,{preserveSnapshot: true}*/);
                      this.profileData.forEach(snapshot =>{

                        this.registerForm = builder.group({
                          'auth':[],
                          'first-name': [snapshot.firstname],
                          'last-name': [snapshot.lastname],
                          'dob': [snapshot.dob],
                          'streetname':[snapshot.streetname],
                          'streetnumber':[snapshot.streetnumber],
                          'suburb':[snapshot.suburb],
                          'state':[snapshot.state],
                          'postcode':[snapshot.postcode],
                          'country': [snapshot.country]
                        /*console.log ("snapshots=" +snapshots);
                        console.log("value = "+ snapshots.values);
                        snapshots.forEach(snapshot=>{
                          console.log("snapshot = "+snapshot.key+", values =" + snapshot.val()) ;
                        });*/
                      });
                    })
                  
                
                console.log(this.profileData);
                  
                 
              });
            }
            
      


  ionViewDidLoad() {
    
    
  }

  test(){
    console.log
  }
}