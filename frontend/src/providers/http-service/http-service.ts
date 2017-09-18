import { Injectable } from '@angular/core';
import { Http, RequestOptions , Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import { AngularFireAuth } from "angularfire2/auth";

/*
  Generated class for the HttpServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class HttpServiceProvider {

  constructor(public http: Http,
              public afAuth:AngularFireAuth) {
    
  }

  httpGet(){

  }

  async httpPost(url:string, jsonString: String):Promise<any>{
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      var body = jsonString;
  
      //
      return new Promise ((resolve,reject)=>{
        this.afAuth.auth.currentUser.getIdToken(true)
          .then(token => {
            var param = "token=" + token;
            let options = new RequestOptions({ headers: headers, params: param });
  
            console.log("//////////API Post///////////////////");
            console.log("postParams+ = " + param);
            console.log("body = " + body);
            console.log("url = " + url);
            this.http.post(url, body, options)
            .subscribe(result => {
              var response =result.json();
              console.log("success=" + JSON.stringify(response));
              var val = response.response;
  
              
              if (val === "success") {
                console.log("storing data success");
                console.log("///////////////API POST end///////////");
                resolve(response);
                
              } else {
                console.log("storing data failed, error = " + response.errorMessage);
                console.log("///////////////API POST end///////////");
                reject(response.errorMessage);
                
              }
            }
            , error => {
              console.log("error=" + error);
              reject(error);
            });
          });
        });
      }

      async httpPostParam(url:string, paramString: String, jsonString: String):Promise<any>{
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
    
        //
        return new Promise ((resolve,reject)=>{
          this.afAuth.auth.currentUser.getIdToken(true)
            .then(token => {
              var param = paramString;
              var body = jsonString;
              let options = new RequestOptions({ headers: headers, params: param });
    
              console.log("//////////API Post///////////////////");
              console.log("postParams =" + param);
              console.log("url = " + url);
              this.http.post(url, body, options)
              .subscribe(result => {
                var response =result.json();
                console.log("success=" + JSON.stringify(response));
                var val = response.response;
    
                
                if (val === "success") {
                  console.log("storing data success");
                  console.log("///////////////API POST end///////////");
                  resolve(response);
                  
                } else {
                  console.log("storing data failed, error = " + response.errorMessage);
                  console.log("///////////////API POST end///////////");
                  reject(response.errorMessage);
                  
                }
              }
              , error => {
                console.log("error=" + error);
                reject(error);
              });
            });
          });
        }
}
