package server.bookingservice;

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
import java.util.Iterator;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.concurrent.Semaphore;
import server.Application;
import server.HelperFunction;
import server.response.BasicResponse;
import server.response.VetResponse;

@RestController


public class MakeBookingController{

    private Logger logger = LoggerFactory.getLogger(Application.class);


    //TODO ADD AVAILABILITY PARAM
    @CrossOrigin
    @RequestMapping(value = "/nearestVet",method = RequestMethod.GET)
    public VetResponse nearestVet(@RequestParam(value = "token" ) String tokenString,
                                  @RequestParam(value = "radius") double radius,
                                  @RequestParam(value = "date")String date,
                                  @RequestParam(value = "time")String time){
        

        logger.info("//////////////////NEAREST VET BEGINS/////////////");
        String id = HelperFunction.getIdfromToken(tokenString, logger);
        //get UserType
        if(id != null){
            logger.info("id provided = "+ id);
        }else{
            logger.info("token provided is not valid");
            logger.info("//////////////////NEAREST VET ENDS/////////////");
            return new VetResponse(null, "error", "token provided is not valid");
        }

        //get Available vet
        String year = null;
        String month = null;
        String day = null;

        if(HelperFunction.testDob(date)){
            StringTokenizer tokens = new StringTokenizer(date, "-");
            year = tokens.nextToken();
            month = tokens.nextToken();
            day = tokens.nextToken();
        }else{
            logger.info("date format is not valid");
            logger.info("//////////////////NEAREST VET ENDS/////////////");
            return new VetResponse(null, "error", "date format is not valid");

        }
        String hour = null;
        int hr = 0;
        if(HelperFunction.testTime(time)){
            StringTokenizer tokens = new StringTokenizer(time, ".");
            hour = tokens.nextToken();
            hr = Integer.parseInt(hour);
        }else{
            logger.info("time format is not valid");
            logger.info("//////////////////NEAREST VET ENDS/////////////");
            return new VetResponse(null, "error", "time format is not valid");
        }
        String availUrl = "availabilities/"+year+"/"+month+"/"+day+"/"+ hr;
        JSONArray vets = HelperFunction.getDataInArray(availUrl, logger);
        if(vets== null || vets.size() == 0){
            logger.info("cant find available vet");
            logger.info("//////////////////NEAREST VET ENDS/////////////");
            return new VetResponse(null, "success", "no available vets");
        }
        ArrayList<String> availVets = new ArrayList<String>();
        for(int i = 0; i<vets.size();i++){
            JSONObject obj = (JSONObject) vets.get(i);
            //check size == 1
            if(obj.size() ==1){
                //get keyset
                Set<String> keys = obj.keySet();
                Iterator<String>iter = keys.iterator();
                String key = iter.next();
                if(obj.get(key).equals("N")){
                    availVets.add(key);
                }
            }
            

        }
        
        
        
        String userType = HelperFunction.getUserType(id, logger);



        
        //Get info of the location of the user
        String url = "geofire/"+ userType+"/"+id;
        logger.info("sent request to url =" + url);
        JSONObject location = HelperFunction.getData(url, logger);
        JSONArray geoloc = (JSONArray) location.get("l");
        double lat = (double) geoloc.get(0);
        double lng = (double) geoloc.get(1);
        logger.info("lat = "+ lat+", lng = "+ lng);

        //String check date and Time
        
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
                semaphore.release();
            }

        };

        geoQuery.addGeoQueryEventListener(listener);




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

            logger.info("//////////////////NEAREST VET ENDS/////////////");
            return new VetResponse(null, "success", "no vet found in vicinity");
        }else{
            JSONObject item = new JSONObject();
            for(int i = 0 ; i < keys.size();i++){
                if(availVets.contains(keys.get(i))){
                    item.put(keys.get(i), distances.get(i));
                }
                
            }
            logger.info("//////////////////NEAREST VET ENDS/////////////");
            return new VetResponse(item, "success",null);
        }
    }


    @CrossOrigin
    @RequestMapping(value="/makeBooking", method= RequestMethod.POST)
    public BasicResponse makeBooking(
        @RequestParam(value= "token") String tokenString,
        @RequestBody String jsonString){
        

        logger.info("///////////MAKEBOOKING START///////////////");
        JSONParser parser = new JSONParser();
        JSONObject jsonBody = null;
        try{
            jsonBody = (JSONObject) parser.parse(jsonString);
        }catch(ParseException e){
            logger.info("parse json object failed");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null, "body not jsonObject");
            
        }


        String muid = null;
        String mvetid = null;
        String mdate = null;
        String myear = null;
        String mmonth = null;
        String mday = null;
        String mtime = null;
        String mpetid = null;
        
        //TODO ADD PAYMENT METHOD TO BODY PARAM

        if(jsonBody.containsKey("userid")){
            muid = (String) jsonBody.get("userid");
            if(HelperFunction.matchToken(muid, tokenString, logger)){
                logger.info("decoded token id match provided uid, continue");
            }else{
                logger.info("decoded token id does not match provided uid");
                logger.info("/////////////MAKEBOOKING ENDS////////////////");
                return new BasicResponse("error",null, "decoded token does not match user id");
            }

        }else{
            logger.info("userid not present");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"userid not present in body");
        }

        if(jsonBody.containsKey("vetid")){
            mvetid = (String) jsonBody.get("vetid");
        }else{
            logger.info("vetid not present");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"vetid not present in body");
        }

        if(jsonBody.containsKey("petid")){
            mpetid = (String) jsonBody.get("petid");
            //check whether the user have the pet id TODO
        }else{
            logger.info("petid not present");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"vetid not present in body");
        }

        if(jsonBody.containsKey("date")){
            mdate = (String) jsonBody.get("date");
            if(HelperFunction.testDob(mdate)){
                StringTokenizer tokens = new StringTokenizer(mdate,"-");
                myear = tokens.nextToken();
                mmonth = tokens.nextToken();
                mday = tokens.nextToken();
            }else{
                logger.info("date is given in wrong format, date = "+ mdate);
                logger.info("/////////////MAKEBOOKING ENDS////////////////");
                return new BasicResponse("error", null,"wrong date format");
            }
        }else{
            logger.info("date not present");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"date not present in body");
        }


        int hr = -1;
        if(jsonBody.containsKey("time")){
            mtime = (String) jsonBody.get("time");
            if(!HelperFunction.testTime(mtime)){
                logger.info("time is given in wrong format, time = "+ mtime);
                logger.info("/////////////MAKEBOOKING ENDS////////////////");
                return new BasicResponse("error", null,"wrong time format");
            }

            StringTokenizer tokenizer = new StringTokenizer(mtime,".");
            String hour = tokenizer.nextToken();
            hr = Integer.parseInt(hour);
        }else{
            logger.info("time not present");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"time not present in body");
        }


        //GET PAYMENT INFO FROM BODY


        //CheckAvailability & change them
        if(hr==-1){
            logger.info("error in parsing statement");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"parse error");
        }

        String availUrl = "availabilities/"+myear+"/"+mmonth+"/"+mday+"/"+ hr;
        JSONArray vets = HelperFunction.getDataInArray(availUrl, logger);
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference(availUrl);
        if(vets == null){
            logger.info("vet not available at specified time and date");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"vet not available at specified time and date");
        }
        if(vets.size() == 0 ){
            logger.info("vet not available at specified time and date");
            logger.info("/////////////MAKEBOOKING ENDS////////////////");
            return new BasicResponse("error", null,"vet not available at specified time and date");
        }else{
            for(int i = 0 ; i < vets.size(); i++){
                JSONObject obj = (JSONObject) vets.get(i);
                if(obj.containsKey(mvetid)){
                    String val = (String) obj.get(mvetid);
                    if(val.equals("N")){
                        
                        JSONObject newObj = new JSONObject();
                        newObj.put(mvetid, "Y");
                        vets.remove(i);
                        vets.add(newObj);
                        ref.setValue(vets);
                        logger.info("change availabilities data");
                        break;
                    }
                }
            }
        }

        




        //MakeBooking

        //create new booking field
        DatabaseReference bookingRef = FirebaseDatabase.getInstance().getReference("bookings");
        String key = bookingRef.push().getKey();
        BookingData data = new BookingData(muid,mvetid,mpetid,myear,mmonth,mday,mtime,"confirmed",key);
        bookingRef.child(key).setValue(data);

        //passBookingField into user (NOT NEEDED)

        /*DatabaseReference userRef = FirebaseDatabase.getInstance().getReference("users/"+muid);
        JSONObject userData = HelperFunction.getData("users/"+muid, logger);
        if(userData.containsKey("bookings")){
            JSONArray bookingArray = (JSONArray) userData.get("bookings");
            bookingArray.add(key);
            userRef.child("bookings").setValue(bookingArray);
        }else{
            JSONArray bookingArray = new JSONArray();
            bookingArray.add(key);
            userRef.child("bookings").setValue(bookingArray);
        }
        */

        //passBookingField into vet (NOT NEEDED)
        
        logger.info("Make Booking success");
        logger.info("/////////////MAKEBOOKING ENDS////////////////");
        return new BasicResponse("success", muid, "null");
        
        

    }

    @CrossOrigin
    @RequestMapping(value="/completeBooking", method= RequestMethod.POST)
    public BasicResponse completeBooking(
        @RequestParam(value= "token") String tokenString,
        @RequestBody String jsonString){
        

        logger.info("///////////completeBOOKING START///////////////");
        JSONParser parser = new JSONParser();
        JSONObject jsonBody = null;
        try{
            jsonBody = (JSONObject) parser.parse(jsonString);
        }catch(ParseException e){
            logger.info("parse json object failed");
            logger.info("/////////////completeBOOKING ENDS////////////////");
            return new BasicResponse("error", null, "body not jsonObject");
            
        }

        String mbookingid = null;
        String muid = null;

        if(jsonBody.containsKey("userid")){
            muid = (String) jsonBody.get("userid");
            if(HelperFunction.matchToken(muid, tokenString, logger)){
                logger.info("decoded token id match provided uid, continue");
            }else{
                logger.info("decoded token id does not match provided uid");
                logger.info("/////////////completeBOOKING ENDS////////////////");
                return new BasicResponse("error",null, "decoded token does not match user id");
            }
        }

        if(jsonBody.containsKey("bookingId")){
            mbookingid = (String) jsonBody.get("bookingId");
        }else{
            logger.info("no Booking id provided");
            logger.info("/////////////completeBOOKING ENDS////////////////");
            return new BasicResponse("error",null, "decoded token does not match user id");
        }

        DatabaseReference ref =  FirebaseDatabase.getInstance().getReference("bookings");
        ref.child(mbookingid).child("status").setValue("done");
        return new BasicResponse("success", muid, "null");

    }






    

}