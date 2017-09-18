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
import java.util.Collection;
import java.util.Set;
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

    @RequestMapping(value = "/deleteAvailability", method = RequestMethod.POST)
    public BasicResponse deleteAvailability(
            @RequestParam(value = "date") String date,
            @RequestParam(value = "vetId") String vetId )
    {
        //check token id = user id
        String vetUrl = "users/"+vetId;
        StringTokenizer tokenizer = new StringTokenizer(date, "-");
        String year = tokenizer.nextToken();
        String month = tokenizer.nextToken();
        String day = tokenizer.nextToken();

        String url = "availabilities/"+year+"/"+month+"/"+day+"/";

        try {
            JSONObject vetInfo = HelperFunction.getData(vetUrl, logger);
            JSONArray avails = (JSONArray) vetInfo.get("availabilities");
            for( int i = 0; i <avails.size();i++){
                JSONObject obj = (JSONObject)avails.get(i);
                Object[] keyArr = obj.keySet().toArray();
                for( int j = 0; j < keyArr.length; j++){
                    //logger.info((String)keyArr[j]);
                    if (((String)keyArr[j]).equals(date)){
                        //logger.info("hello");
                        avails.remove(i);
                    }
                }
            }

            DatabaseReference userRef = FirebaseDatabase.getInstance().getReference(vetUrl);
            userRef.child("/availabilities").setValue((ArrayList<String>)avails);

            JSONObject availInfo = HelperFunction.getData(url,logger);
            //Collection availList = availInfo.values();
            JSONObject item = new JSONObject();
            item.put(vetId, "N");
            Object[] keys =availInfo.keySet().toArray();
            for(int i = 0; i < keys.length; i++){
                //logger.info((String) keys[i]);
                JSONArray availArr = (JSONArray) availInfo.get(keys[i]);
                if (availArr.contains(item)){
                    availArr.remove(item);
                    DatabaseReference reference = FirebaseDatabase.getInstance().getReference(url+keys[i]);
                    reference.setValue((ArrayList<String>)availArr);
                    logger.info(url+keys[i]+"/"+availArr.indexOf(item));

                }
            }

            return new BasicResponse("success", vetId, null);
        }
        catch (NullPointerException e){
            return new BasicResponse("failure", vetId, "ID doesn't exist");
        }
    }
}
