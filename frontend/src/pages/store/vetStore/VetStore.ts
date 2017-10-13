import {Component} from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController, NavParams} from 'ionic-angular';
import {HttpServiceProvider} from "../../../providers/http-service/http-service";
import {RedirectPage} from "../../redirect/redirect";
import {AngularFireDatabase} from "angularfire2/database";

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
  totalCost : any;
  selectedItems : Array<any>;
  selectedItemsQuan : Array<any>;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private db: AngularFireDatabase) {
    this.totalCost = +0;
    this.getItems();
    this.selectedItems = new Array();
    this.selectedItemsQuan = new Array();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StorePage');
  }

  getItems(){

    this.db.database.ref('/VetStore').once('value',(snapshot)=>{
      this.items = snapshot.val();
      console.log(this.items);
    });

  }

  addToTotal(price,quantity){
    console.log("I am in adding to total");
    let pr = +price;
    let index =  this.selectedItems.findIndex(x=> x ==price);
    if(index != -1){
      console.log("hello");
      let quan = this.selectedItemsQuan[index];
      this .totalCost = this.totalCost - (pr*quan);
      this.selectedItemsQuan[index] = quantity;
    }
    else{
      this.selectedItems.push(price);
      this.selectedItemsQuan.push(quantity);
    }

    this.totalCost = this.totalCost+(pr*quantity);
    console.log(this.totalCost);
    console.log(this.selectedItems.toString());
  }

}
