import java.util.concurrent.Semaphore;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.DatabaseReference.CompletionListener;
import com.google.firebase.database.FirebaseDatabase;
import server.Application;
import server.HelperFunction;
import server.response.BasicResponse;

@RestController
public class VerificationController {
    private BasicResponse response = null;
    private final Logger logger = LoggerFactory.getLogger(Application.class);
    private int flag = 0 ;


    @RequestMapping(value = "/verify", method = RequestMethod.POST)
    public BasicResponse verifyVet(
        //@RequestParam (value = "token") String tokenString,
        @RequestBody String jsonString){

            JSONParser parser = new JSONParser();
            JSONObject input = (JSONObject)parser.parse(jsonString);

            String userid = null;
            if(input.containsKey("userid")){
                userid = (String) input.get("userid");
               /* if(HelperFunction.matchToken(userid, tokenString, logger)){
                    logger.info("id match id from decoded token, Continue");
                }else{
                    logger.info("id did not match with id from decoded token");
                    return new BasicResponse ("error",userid, "userid did not match with decoded token");
                }*/
            }else{
                return new BasicResponse("error", null , "no userid found");
            }
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("keys");
            String authkey = null;
            Semaphore semaphore = new Semaphore(0);
            if(input.containsKey("authkey")){
                authkey = (String) input.get("authkey");
                JSONArray keys = HelperFunction.getDataInArray("keys", logger);
                if(keys.contains(authkey)){
                    ref = ref.child(authkey);
                    ref.removeValue(new CompletionListener(){

						@Override
						public void onComplete(DatabaseError error, DatabaseReference ref) {
                            flag = 1;
                            semaphore.release();
						}

                    });
                }
            }else{
                return new BasicResponse("error", userid, "authkey is not provided");
            }

            semaphore.acquire();

            if( flag == 1 ){
                ref = FirebaseDatabase.getInstance().getReference("users/"+userid+"/isVerifiedVet");
                ref.setValue(true);
                return new BasicResponse("success", userid, "null");
            }else{
                return new BasicResponse("error", userid, "error with updating verification id");
            }

            

    }
}