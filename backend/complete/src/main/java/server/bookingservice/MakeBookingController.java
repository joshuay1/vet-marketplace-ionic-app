package server.bookingservice;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.firebase.geofire.GeoFire;
import com.firebase.geofire.GeoLocation;
import com.firebase.geofire.GeoQuery;
import com.firebase.geofire.GeoQueryEventListener;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;


import java.util.ArrayList;
import java.util.concurrent.Semaphore;

import server.Application;
import server.HelperFunction;

@RestController


public class MakeBookingController{

    private Logger logger = LoggerFactory.getLogger(Application.class);


    //TODO ADD AVAILABILITY PARAM
    @RequestMapping(value = "/nearestVet",method = RequestMethod.GET)
    public VetResponse nearestVet(@RequestParam(value = "userid" ) String id,
                                  @RequestParam(value = "userType")String userType,
                                  @RequestParam(value = "radius") double radius){

        //TODO check token = id

        String url = "geofire/"+ userType+"/"+id;
        logger.info("sent request to url =" + url);
        JSONObject location = HelperFunction.getData(url, logger);
        JSONArray geoloc = (JSONArray) location.get("l");
        double lat = (double) geoloc.get(0);
        double lng = (double) geoloc.get(1);
        logger.info("lat = "+ lat+", lng = "+ lng);

        DatabaseReference georef =  FirebaseDatabase.getInstance().getReference("geofire/Vet");
        Semaphore semaphore = new Semaphore(0);

        GeoFire geofire = new GeoFire(georef);
        GeoQuery geoQuery = geofire.queryAtLocation(new GeoLocation(lat, lng), radius);
        ArrayList<String> keys = new ArrayList<String>();

        GeoQueryEventListener listener = new GeoQueryEventListener() {
            @Override
            public void onKeyEntered(String key, GeoLocation location) {
                keys.add(key);
            }
        
            @Override
            public void onKeyExited(String key) {
                for(int i = 0 ; i < keys.size(); i++){
                    if(keys.get(i).equals(key)){
                        keys.remove(i);
                    }
                }
                logger.info("remove key "+key);
            }
        
            @Override
            public void onKeyMoved(String key, GeoLocation location) {

            }
        
            @Override
            public void onGeoQueryReady() {
               logger.info("finish query");
               semaphore.release();
            }
        
            @Override
            public void onGeoQueryError(DatabaseError error) {
                logger.info("There was an error with this query");
            }

        };

        geoQuery.addGeoQueryEventListener(listener);

        try{
            semaphore.acquire();
        }catch(InterruptedException e){
            logger.info("interrupted thread");
        }

        geoQuery.removeAllListeners();
        
        if(keys.size()== 0){
            return new VetResponse(null, "error", "no vet found");
        }else{
            String[] items = new String[keys.size()];
            items = keys.toArray(items);
            return new VetResponse(items, "success",null);
        }
    }

}