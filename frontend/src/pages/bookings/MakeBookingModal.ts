import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ViewController, NavParams, AlertController, LoadingController } from "ionic-angular";
import { HttpServiceProvider } from "../../providers/http-service/http-service";

@Component({
    templateUrl: "MakeBookingModal.html",
    selector: 'page-MakeBookingModal',
  })

 export class MakeBookingModal{
    vetIds: any;
    userId : string;
    addAvail: FormGroup;
    time: any;
    date : any;
    selectedVet : any;
    petId : any;
    apiUrl = "http://115.146.86.193:8080/";


    constructor(public viewCtrl:ViewController,
                public params: NavParams,
                private builder: FormBuilder,
                private alertCtrl: AlertController,
                private httpProviders : HttpServiceProvider,
                public loadingCtrl: LoadingController){
      this.userId = params.get("userId");
      this.vetIds = new Array();
      this.petId = params.get("petId");
      var vets = params.get("vetIds");
      vets = vets.replace('{','');
      vets = vets.replace('}','');
      this.splitVetId(vets.split(','));
      this.date = params.get("date");
      this.time = params.get("time");
      console.log("vet ids in modal = "+ this.vetIds);
      console.log("userId in modal = "+ this.userId);
      console.log("date in modal = "+ this.date);
      console.log("time in modal = "+ this.time);
      console.log("petID in modal = " +  this.petId);

    }
    splitVetId(v){
      console.log(v);

      for(var i =0; i < v.length;i++){
        console.log("vet = " + v[i]);
        var s = v[i].split(':');
        console.log("Split = " + s)
        this.vetIds.push({"VetID":s[0],"Distance":s[1]});
      }
    }
    async add(){
      console.log(this.selectedVet);
      this.selectedVet = this.selectedVet.replace('\"','');
      this.selectedVet = this.selectedVet.replace('\"','');
      var param = {userid:this.userId, vetid:this.selectedVet,date:this.date,time:this.time.substr(0,2)+".00",petid:this.petId}

      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();


      this.httpProviders.httpPost(this.apiUrl+"makeBooking",JSON.stringify(param))
      .then(result=>{
        console.log("result="+ JSON.stringify(result));
        var res = result.response;
        if(res == "success"){
          console.log("success");
          loading.dismiss();
          this.viewCtrl.dismiss();
        }else{
            loading.dismiss();
          let alert = this.alertCtrl.create({
            title: 'Error',
            message : result.errorMessage,
            buttons : ['OK']
          });
          alert.present();
        }

      })
      .catch(err=>{
        loading.dismiss();
        console.log("error = "+ JSON.stringify(err));
        let alert = this.alertCtrl.create({
          title: 'Error',
          message : JSON.stringify(err),
          buttons : ['OK']
        });
        alert.present();
      })
    }
    dismiss(){
      this.viewCtrl.dismiss();
    }
    stringfy(json: any):string{

    return JSON.stringify(json);
  }

}
