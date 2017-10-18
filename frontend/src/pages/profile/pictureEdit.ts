import { IonicPage, NavController, NavParams, LoadingController, AlertController } from "ionic-angular";
import { Component } from "@angular/core";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';
import { HttpServiceProvider } from "../../providers/http-service/http-service";


IonicPage()
@Component({
  selector: 'page-pictureEdit',
  templateUrl: 'pictureEdit.html',
})
export class PictureEditPage {

  public base64Image: string;
  private apiUrl = 'http://115.146.86.193:8080/';
  private Uploaded;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db : AngularFireDatabase,
    private camera: Camera,
    private loadingCtrl: LoadingController,
    private httpProviders : HttpServiceProvider,
    private alertCtrl: AlertController
  ){
    this.base64Image = this.navParams.get("imgUrl");
  }

  takePicture(){
    this.camera.getPicture({
        sourceType: this.camera.PictureSourceType.CAMERA,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true,
        quality:75,
        targetWidth: 1000,
        targetHeight: 1000
    }).then((imageData) => {
      // imageData is a base64 encoded string
        this.base64Image = "data:image/jpeg;base64," + imageData;
        this.Uploaded = true;
    }, (err) => {
        console.log(err);
    });
  }

  back(){
    this.navCtrl.pop();
  }

  upload(){

    let loading = this.loadingCtrl.create({
      content: 'Uploading...'
    });
    loading.present();
    var storageRef = firebase.storage().ref();
    var userid = this.navParams.get("userId");
    const filename = Math.floor(Date.now()/1000);
    const imageRef = storageRef.child("User/"+userid+"/"+filename+".jpg");
    imageRef.putString(this.base64Image,firebase.storage.StringFormat.DATA_URL)
    .then(snapshot=>{
      console.log("upload successful");
      loading.dismiss();
      //GET PICT URL

      var pictureURL = snapshot.downloadURL;
      var jsonString = {"userid":userid, "pictureURL": pictureURL};

      //go to http Post Request
      this.httpProviders.httpPost(this.apiUrl+"changeProfilePicture",JSON.stringify(jsonString))
      .then(result=>{
        console.log("get result here");
        var res = result.response;
        if(res =="success"){
    
          this.navCtrl.pop();
        }
      }).catch(error=>{
        loading.dismiss();
        console.log("catchin error here");
        let alert = this.alertCtrl.create({
          title: 'Error',
          message : error,
          buttons : ['OK']
        });
        alert.present();
      })


    }).catch(function(error){
      loading.dismiss();
      console.log("catchin error here");
      let alert = this.alertCtrl.create({
        title: 'Error',
        message : error,
        buttons : ['OK']
      });
      alert.present();
    })

  }

  getFromGallery(){
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      quality: 75,
      targetWidth: 1000,
      targetHeight: 1000
  }).then((imageData) => {
    // imageData is a base64 encoded string
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.Uploaded = true;
  }, (err) => {
      console.log(err);
  });
  }



}