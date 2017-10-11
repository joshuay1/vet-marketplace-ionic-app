import {Component} from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {HttpServiceProvider} from "../../../providers/http-service/http-service";

/**
 * Generated class for the StorePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-VetStore',
  templateUrl: 'VetStore.html',
})
export class VetStorePage {
  items : any;
  apiUrl = "http://115.146.86.193:8080/";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private alertCtrl: AlertController,
              private httpProviders: HttpServiceProvider,
              public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StorePage');
    this.getItems();
  }

  getItems() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    this.httpProviders.httpGet(this.apiUrl + "getVetStoreItems/", "", JSON.stringify({}))
      .then(result => {
        console.log("result=" + JSON.stringify(result));
        var res = result.response;
        if (res == "success") {
          this.items = result.storeItems;
          console.log(this.items);
          loading.dismiss();
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
          title: 'Error Request Rejected',
          message: JSON.stringify(err),
          buttons: ['OK']
        });
        alert.present();
      })
  }
}
