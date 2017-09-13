package server.availabilityservice;

import com.google.firebase.database.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import server.Application;
import server.HelperFunction;
import server.response.BasicResponse;

import java.util.ArrayList;
import java.util.List;

@RestController
public class AvailabilityController {
    private final Logger logger = LoggerFactory.getLogger(Application.class);

    @RequestMapping(value = "/postAvailability", method = RequestMethod.POST)
    public BasicResponse postPetProfile(
            /*@RequestParam(value="token") String tokenString,
            @RequestBody String jsonString)
    {
        JSONParser parser = new JSONParser();
        JSONObject jsonProfile = null;
        try{
            jsonProfile = (JSONObject) parser.parse(jsonString);
        }catch(ParseException e){
            e.printStackTrace();
            return new BasicResponse("error",null, "body not JSON Object");
        }

        String vetId = null;
        String yy = null;
        String mm = null;
        String dd = null;
        String hhStart = null;
        String hhEnd = null;
        Boolean isVerifiedAuthKey = false;


        //READ DATAS Any idea how to not repeat these function?
        if(jsonProfile.containsKey("vetId")){
            vetId = (String) jsonProfile.get("vetId");
            //check token id = id
            boolean match = HelperFunction.matchToken(vetId, tokenString, logger);

            if(match){
                logger.info("id provided matches decoded token id. Continue");
            }else{
                logger.info("id provided does not match decoded token");
                return new BasicResponse("error", vetId, "id provided does not match decoded token");
            }
        }else{
            return new BasicResponse("error", null, "no user id found");
        }
        if(jsonProfile.containsKey("year")){
            yy = (String) jsonProfile.get("firstname");
        }else{
            return new BasicResponse("error", vetId, "no first name found");
        }

        if(jsonProfile.containsKey("month")){
            mm = (String) jsonProfile.get("lastname");
        }else{
            return new BasicResponse("error", vetId, "no last name found");
        }

        if(jsonProfile.containsKey("day")){
            dd = (String) jsonProfile.get("day");
        }else{
            return new BasicResponse("error", vetId, "no dob found");
        }

        if(jsonProfile.containsKey("hhStart")){
            hhStart = (String) jsonProfile.get("hhStart");
        }else{
            return new BasicResponse("error", vetId, "no user type found");
        }

        if(jsonProfile.containsKey("hhEnd")){
            hhEnd = (String) jsonProfile.get("streetnumber");
        }else{
            return new BasicResponse("error", vetId, "no streetnumber found");
        }
        */
        @RequestParam(value = "year") String yr,
            @RequestParam(value = "month") String month,
            @RequestParam(value = "day") String day,
            @RequestParam(value = "hhStart") String hhs,
            @RequestParam(value = "hhEnd") String hhe,
            @RequestParam(value = "vetId") String vetId) {
        String vetUserUrl = "users/"+vetId;
        JSONObject vetInfo = null;
        try {
            vetInfo = HelperFunction.getData(vetUserUrl, logger);
        }
        catch (NullPointerException e){
            return new BasicResponse("failure", vetId, "ID doesn't exist");
        }
        DatabaseReference availRef= FirebaseDatabase.getInstance().getReference("availabilities/");
        DatabaseReference id = availRef.push();
        DatabaseReference availIdRef = FirebaseDatabase.getInstance().getReference("avilabilities/"+id.getKey());
        AvailabilityData data = new AvailabilityData(yr, month, day, hhs, hhe);
        availIdRef.setValue(data);

        if (vetInfo.containsKey("availabilities")){
            logger.info("availabilities exists");
            DatabaseReference vetAvailRef = FirebaseDatabase.getInstance().getReference("users/"+vetId+"/availabilities");
            vetAvailRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    GenericTypeIndicator<ArrayList<String>> t = new GenericTypeIndicator<ArrayList<String>>() {};
                    ArrayList<String> availIds = snapshot.getValue(t);
                    logger.debug("Avail ID's EXIST IN USER and Avail ID is as follows" + id.getKey());
                    availIds.add(id.getKey());
                    vetAvailRef.setValue(availIds);
                }
                @Override
                public void onCancelled(DatabaseError error) {}
            });
        }
        else {
            logger.info("availabilities doesn't exist");
            JSONArray availArr = new JSONArray();
            availArr.add(id.getKey());
            DatabaseReference vetRef = FirebaseDatabase.getInstance().getReference("users/"+vetId);
            vetRef.child("availabilities").setValue(availArr);
        }
        return new BasicResponse("success", vetId,null);
    }
}
