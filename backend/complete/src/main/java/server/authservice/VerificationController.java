package server.authservice;

import java.util.StringTokenizer;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import server.Application;
import server.HelperFunction;
import server.response.BasicResponse;


@RestController
public class VerificationController {
    private final Logger logger = LoggerFactory.getLogger(Application.class);

    @CrossOrigin
    @RequestMapping(value = "/verify", method = RequestMethod.POST)
    public BasicResponse verifyVet(
        @RequestParam (value = "token") String tokenString,
        @RequestBody String jsonString){
            JSONObject input = null;
            JSONParser parser = new JSONParser();
            try{
                input = (JSONObject)parser.parse(jsonString);
            }catch(ParseException e){
                e.printStackTrace();
                return new BasicResponse("error", null , "input format not recognized");
            }

            String userid = null;
            if(input.containsKey("userid")){
                userid = (String) input.get("userid");
                if(HelperFunction.matchToken(userid, tokenString, logger)){
                    logger.info("id match id from decoded token, Continue");
                }else{
                    logger.info("id did not match with id from decoded token");
                    return new BasicResponse ("error",userid, "userid did not match with decoded token");
                }
            }else{
                return new BasicResponse("error", null , "no userid found");
            }
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("keys");
            String authkey = null;
            if(input.containsKey("authkey")){
                authkey = (String) input.get("authkey");
                JSONArray keys = HelperFunction.getDataInArray("keys", logger);
                if(keys.contains(authkey)){
                    keys.remove(authkey);
                    ref.setValue(keys);
                }else{
                    return new BasicResponse("error",userid,"auth key is not found");
                }
            }else{
                return new BasicResponse("error", userid, "authkey is not provided");
            }
            ref = FirebaseDatabase.getInstance().getReference("users/"+userid+"/isVerifiedVet");
            ref.setValue(true);
            return new BasicResponse("success", userid, "null");
            

    }

    @RequestMapping(value ="/test", method =RequestMethod.GET)
    public BasicResponse test(@RequestParam (value = "date") String date,
                            @RequestParam (value = "id") String id){

        StringTokenizer tokenizer = new StringTokenizer(date, "/");
        String year = tokenizer.nextToken();
        String month = tokenizer.nextToken();
        String day = tokenizer.nextToken();
        
        String url = "avail/"+year+"/"+month+"/"+day;
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference(url);
        JSONArray array = HelperFunction.getDataInArray(url, logger);
        if(array != null){
            array.add(id);
        }else{
            array = new JSONArray();
            array.add(id);
        }
        ref.setValue(array);

        return new BasicResponse("success",id,null);

    }
}