import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ViewController, NavParams, AlertController, LoadingController } from "ionic-angular";
import { HttpServiceProvider } from "../../providers/http-service/http-service";

@Component({
    templateUrl: "FindNearestVet.html"
  })

 export class FindNearestVet{
    userId: string
    findVet: FormGroup;
    radius: any;
    time: any;
    date : any;
    apiUrl = "http://115.146.86.193:8080/";


    constructor(public viewCtrl:ViewController,
                public params: NavParams,
                private builder: FormBuilder,
                private alertCtrl: AlertController,
                private httpProviders : HttpServiceProvider,
                public loadingCtrl: LoadingController){
      this.userId = params.get("userId");
      console.log("user id in find nearest vet = "+ this.userId);
      this.findVet= builder.group({
        'date':['',Validators.required],
        'radius':['',Validators.required],
        'time': ['',Validators.required]
      })
    }

    async add(){
      var hrs = this.time.split(":")[0];
      var param = "&radius="+this.radius+"&date="+this.date+"&time="+hrs+".00";
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();

      console.log(param);
      this.httpProviders.httpGet(this.apiUrl+"nearestVet",param,JSON.stringify({}))
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
  }
