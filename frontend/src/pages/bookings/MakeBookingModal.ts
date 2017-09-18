import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ViewController, NavParams, AlertController, LoadingController } from "ionic-angular";
import { HttpServiceProvider } from "../../providers/http-service/http-service";

@Component({
    templateUrl: "MakeBookingModal.html"
  })

 export class MakeBookingModal{
    userId: string
    addAvail: FormGroup;
    hhs: any;
    hhe: any;
    date : any;
    apiUrl = "http://115.146.86.193:8080/";


    constructor(public viewCtrl:ViewController,
                public params: NavParams,
                private builder: FormBuilder,
                private alertCtrl: AlertController,
                private httpProviders : HttpServiceProvider,
                public loadingCtrl: LoadingController){
      this.userId = params.get("vetId");
      console.log("vet id in modal = "+ this.userId);
      this.addAvail = builder.group({
        'date':['',Validators.required],
        'hhs':['',Validators.required],
        'hhe': ['',Validators.required]
      })
    }

    async add(){
      var hrs = this.hhs.split(":")[0];
      var hre = this.hhe.split(":")[0];
      var param = "vetId="+this.userId +"&date="+this.date+"&hhs="+hrs+"&hhe="+hre;
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();


      this.httpProviders.httpPostParam(this.apiUrl+"postAvailability",param,JSON.stringify({}))
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
  }
