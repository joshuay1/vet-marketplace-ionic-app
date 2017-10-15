import {Component} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {ViewController, NavParams, AlertController, LoadingController} from "ionic-angular";
import {HttpServiceProvider} from "../../providers/http-service/http-service";
import {AngularFireDatabase} from "angularfire2/database";
import {UserInfo} from "../../model/user";
import * as firebase from 'firebase';


@Component({
  templateUrl: "MakeBookingModal.html",
  selector: 'page-MakeBookingModal',
})

export class MakeBookingModal {
  vetIds: any;
  userId: string;
  addAvail: FormGroup;
  time: any;
  date: any;
  selectedVet: any;
  petId: any;
  private vetData: { [k: string]: UserInfo } = {};

  apiUrl = "http://115.146.86.193:8080/";

  constructor(public viewCtrl: ViewController,
              public params: NavParams,
              private db: AngularFireDatabase,
              private alertCtrl: AlertController,
              private httpProviders: HttpServiceProvider,
              public loadingCtrl: LoadingController) {

    this.userId = params.get("userId");
    this.vetIds = new Array();

    this.petId = params.get("petId");
    var vets = params.get("vetIds");
    vets = vets.replace('{', '');
    vets = vets.replace('}', '');
    this.splitVetId(vets.split(','));
    this.date = params.get("date");
    this.time = params.get("time");
    console.log("vet ids in modal = " + this.vetIds);
    console.log("userId in modal = " + this.userId);
    console.log("date in modal = " + this.date);
    console.log("time in modal = " + this.time);
    console.log("petID in modal = " + this.petId);

  }

  ionViewDidLoad() {
    this.vetIds.forEach(value => {
      var data = value.VetID;
      data = data.replace('\"', '');
      data = data.replace('\"', '');
      console.log("The value is " + data);
      this.addVetData(data);
    })
  }

  addVetData(vetid: string) {
    this.db.database.ref('/users/' + vetid).on('value', (snapshot) => {
      var profileData: UserInfo = snapshot.val();
      //console.log(JSON.stringify(profileData));
      this.vetData[vetid] = profileData;
      //console.log(JSON.stringify(this.vetData));
      this.changeImageUrl(profileData, vetid);
    });
  }

  changeImageUrl(profileData: UserInfo, vetid: string) {
    var pictureURL = profileData.pictureURL;
    var gsReference = firebase.storage().refFromURL(pictureURL);
    gsReference.getDownloadURL().then(url => {
      //console.log("img url = "+ url);
      profileData.pictureURL = url;
      this.vetData[vetid] = profileData;
    }).catch(function (error) {
      //console.log("catchin error here");
      this.createAlert(error);
    })
  }

  splitVetId(v) {
    console.log(v);

    for (var i = 0; i < v.length; i++) {
      console.log("vet = " + v[i]);
      var s = v[i].split(':');
      console.log("Split = " + s)
      this.vetIds.push({"VetID": s[0], "Distance": s[1]});
    }
  }

  async add() {
    if(!this.selectedVet){
      this.createAlert("Please Select a vet before Booking");
      return;
    }
    console.log(this.selectedVet);
    this.selectedVet = this.selectedVet.replace('\"', '');
    this.selectedVet = this.selectedVet.replace('\"', '');
    var param = {
      userid: this.userId,
      vetid: this.selectedVet,
      date: this.date,
      time: this.time.substr(0, 2) + ".00",
      petid: this.petId
    }

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();


    this.httpProviders.httpPost(this.apiUrl + "makeBooking", JSON.stringify(param))
      .then(result => {
        console.log("result=" + JSON.stringify(result));
        var res = result.response;
        if (res == "success") {
          console.log("success");
          loading.dismiss();
          this.viewCtrl.dismiss();
        } else {
          loading.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Error',
            message: result.errorMessage,
            buttons: ['OK']
          });
          alert.present();
        }

      })
      .catch(err => {
        loading.dismiss();
        console.log("error = " + JSON.stringify(err));
        let alert = this.alertCtrl.create({
          title: 'Error',
          message: JSON.stringify(err),
          buttons: ['OK']
        });
        alert.present();
      })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  stringfy(json: any): string {

    return JSON.stringify(json);
  }

  selectVet(vetID) {
    this.selectedVet = vetID;
    console.log(this.selectedVet);
  }

  getVetImage(vetId: any): string {
    let data = vetId;
    data = data.replace('\"', '');
    data = data.replace('\"', '');

    var vet = this.vetData[data];
    if (vet != null) {
      var pictureUrl = vet.pictureURL;
      return pictureUrl;
    } else {
      return null;
    }
  }

  getVetName(vetId: any): string {
    let data = vetId;
    data = data.replace('\"', '');
    data = data.replace('\"', '');

    var vet = this.vetData[data];
    if (vet != null) {
      var name = vet.firstname + " " + vet.lastname;
      return name;
    } else {
      return null;
    }
  }
  createAlert(msg: string) {
    let alert = this.alertCtrl.create({
      message: msg,
      buttons: ['OK']
    });
    alert.present();
  }
}
