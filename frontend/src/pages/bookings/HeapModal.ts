import { Component } from "@angular/core";
import { ViewController, NavParams, AlertController, LoadingController } from "ionic-angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpServiceProvider } from "../../providers/http-service/http-service";
import { BookingInfo } from "../../model/user";



@Component({
    templateUrl: "HeapModal.html"
})

export class HeapModal{

    book : BookingInfo;
    apiUrl = "http://115.146.86.193:8080/";
    HeapForm: FormGroup;
    input1 : any;
    input2 : any;
    input3 : any;
    input4 : any;
    HEAP: any;
    NoHeap: any;

    constructor(public viewCtrl:ViewController,
        public params: NavParams,
        private builder: FormBuilder,
        private alertCtrl: AlertController,
        private httpProviders : HttpServiceProvider,
        public loadingCtrl: LoadingController){

            this.book = params.get("BookingInfo");

            if(this.checkHeap()){
                this.HEAP = true;
            }else{
                this.NoHeap = true;
            }
            this.HeapForm = builder.group({

                '1' : ['', Validators.required],
                '2' : ['', Validators.required],
                '3' : ['', Validators.required],
                '4' : ['', Validators.required],
            })
        }

    checkHeap():boolean{

        if(this.book.H== null){
            if(this.book.E == null){
                if(this.book.A == null){
                    if(this.book.P == null){
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    pushForm(){
        let loading = this.loadingCtrl.create({
            content: 'Submitting Form....'
          });
    
        loading.present();
        console.log(this.input1);
        console.log(this.input2);
        console.log(this.input3);
        console.log(this.input4);
        var jsonString = {"bookingid": this.book.bookingId, "H": this.input1, "E":this.input2, "A": this.input3,
        "P": this.input4}
        this.httpProviders.httpPost(this.apiUrl+"postHeap",JSON.stringify(jsonString))
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