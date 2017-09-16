package server.availabilityservice;

import com.google.firebase.database.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import server.Application;
import server.HelperFunction;
import server.response.BasicResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

@RestController
public class AvailabilityController {
    private final Logger logger = LoggerFactory.getLogger(Application.class);

    @RequestMapping(value = "/postAvailability", method = RequestMethod.POST)
    public BasicResponse postPetProfile(
            @RequestParam (value = "date") String date,
            @RequestParam (value = "hhs") String hhStart,
            @RequestParam (value = "hhe") String hhEnd,
            @RequestParam (value = "vetId") String vetId){

        String vetUserUrl = "users/"+vetId;
        JSONObject vetInfo = null;
        try {
            vetInfo = HelperFunction.getData(vetUserUrl, logger);
        }
        catch (NullPointerException e){
            return new BasicResponse("failure", vetId, "ID doesn't exist");
        }
        StringTokenizer tokenizer = new StringTokenizer(date, "-");
        String year = tokenizer.nextToken();
        String month = tokenizer.nextToken();
        String day = tokenizer.nextToken();

        String url = "availabilities/"+year+"/"+month+"/"+day+"/";
        for (int i = Integer.parseInt(hhStart); i <= Integer.parseInt(hhEnd); i++ ){
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference(url+i);
            JSONArray array = HelperFunction.getDataInArray(url+i, logger);
            JSONObject item = new JSONObject();
            item.put(vetId, "N");
            if(array != null){
                if(!array.contains(item)) {
                    array.add(item);
                }
            }else{
                array = new JSONArray();
                array.add(item);
            }
            ref.setValue(array);
        }

        if (vetInfo.containsKey("availabilities")){

            logger.info("availabilities exists");
            DatabaseReference vetAvailRef = FirebaseDatabase.getInstance().getReference(vetUserUrl+"/availabilities");
            JSONArray array = HelperFunction.getDataInArray(vetUserUrl+"/availabilities", logger);
            JSONObject item = new JSONObject();
            item.put(date, hhStart+"-"+hhEnd);
            if(array != null){
                if(!array.contains(item)) {
                    array.add(item);
                }
            }else{
                array = new JSONArray();
                array.add(item);
            }
            vetAvailRef.setValue(array);
        }
        else {
            logger.info("availabilities doesn't exist");
            JSONArray availArr = new JSONArray();
            JSONObject item = new JSONObject();
            item.put(date, hhStart+"-"+hhEnd);
            availArr.add(item);
            DatabaseReference vetRef = FirebaseDatabase.getInstance().getReference("users/"+vetId);
            vetRef.child("availabilities").setValue(availArr);
        }
        return new BasicResponse("success", null,null);
    }
}
