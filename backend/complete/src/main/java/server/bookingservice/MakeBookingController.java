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
import com.firebase.geofire.util.GeoUtils;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import java.text.DecimalFormat;
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
                                  @RequestParam(value = "radius") double radius){

        //TODO check token = id

        //get UserType
        String userType = HelperFunction.getUserType(id, logger);
        
        //Get info of the location of the user
        String url = "geofire/"+ userType+"/"+id;
        logger.info("sent request to url =" + url);
        JSONObject location = HelperFunction.getData(url, logger);
        JSONArray geoloc = (JSONArray) location.get("l");
        double lat = (double) geoloc.get(0);
        double lng = (double) geoloc.get(1);
        logger.info("lat = "+ lat+", lng = "+ lng);
        
        //formatting for the distance
        DecimalFormat df = new DecimalFormat("#.00"); 

        //create queryv
        DatabaseReference georef =  FirebaseDatabase.getInstance().getReference("geofire/Vet");
        GeoFire geofire = new GeoFire(georef);
        GeoQuery geoQuery = geofire.queryAtLocation(new GeoLocation(lat, lng), radius);

        //initialize result arraylist
        ArrayList<String> keys = new ArrayList<String>();
        ArrayList<String> distances = new ArrayList<String>();
        
        //create semaphore to handle async operations
        Semaphore semaphore = new Semaphore(0);
        
        //create listener
        GeoQueryEventListener listener = new GeoQueryEventListener() {

            //on key entered, it will put the keys into the keys arraylist , the distances to the distances arraylist
            @Override
            public void onKeyEntered(String key, GeoLocation location) {
                keys.add(key);
                double distance = GeoUtils.distance((double)geoloc.get(0),(double)geoloc.get(1),location.latitude,location.longitude);
                double distance_in_km = distance/1000;
                distances.add(df.format(distance_in_km));

            }
            
            //if some of the key is removed, remove both from key and distance arraylist
            @Override
            public void onKeyExited(String key) {
                for(int i = 0 ; i < keys.size(); i++){
                    if(keys.get(i).equals(key)){
                        keys.remove(i);
                        distances.remove(i);
                    }
                }
                logger.info("remove key "+key);
            }

            //if some of the key is moved by within the radius, change the distance only
        
            @Override
            public void onKeyMoved(String key, GeoLocation location) {
                int i = 0;

                //get the i location of the changed key
                for(i= 0 ; i < keys.size(); i++){
                    if(keys.get(i).equals(key)){
                        break;
                    }
                }

                //calculate new distance
                double distance = GeoUtils.distance((double)geoloc.get(0),(double)geoloc.get(1),location.latitude,location.longitude);
                double distance_in_km = distance/1000;
                distances.remove(i);
                distances.add(i, df.format(distance_in_km));

            }
            

            //means the query is finished, release semaphore
            @Override
            public void onGeoQueryReady() {
               logger.info("finish query");
               semaphore.release();
            }
            


            @Override
            public void onGeoQueryError(DatabaseError error) {
                logger.error("There was an error with nearest vet query with accessing the database");
            }

        };

        geoQuery.addGeoQueryEventListener(listener);


        //TODO get list of vets from the availibility


        //TODO match the key list with the vet availibility list -> remember to remove distance from distances arraylist as well



        //get the semaphore aka wait until query finish
        try{
            semaphore.acquire();
        }catch(InterruptedException e){
            logger.error("interrupted thread on semaphore nearest vet query");
        }

        //remove listener
        geoQuery.removeAllListeners();


        //if size is different, sth wrong in the query
        if(distances.size() != keys.size()){
            logger.error("something wrong with the query, distances size != keys size");
            return new VetResponse(null,"error","error in the query");
        }
        
        if(keys.size()== 0){
            return new VetResponse(null, "error", "no vet found");
        }else{
            JSONObject item = new JSONObject();
            for(int i = 0 ; i < keys.size();i++){
                item.put(keys.get(i), distances.get(i));
            }
            return new VetResponse(item, "success",null);
        }
    }

}