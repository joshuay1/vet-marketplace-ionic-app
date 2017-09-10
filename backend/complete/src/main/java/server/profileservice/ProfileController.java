package server.profileservice;

import java.io.IOException;
import java.util.HashMap;
import java.util.concurrent.Semaphore;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import server.Application;
import server.HelperFunction;
import server.response.BasicResponse;
import server.response.ProfileResponse;
import com.firebase.geofire.GeoFire;
import com.firebase.geofire.GeoLocation;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.tasks.OnSuccessListener;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.GeocodingResult;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class ProfileController {
   
    //private Semaphore semaphore = new Semaphore(0);
    private final Logger logger = LoggerFactory.getLogger(Application.class);
    private final String DEFAULTPICTURE= "gs://vetquoll-c22f9.appspot.com/Basic/empty.png";
    //GOOGLE API
    private GeoApiContext geocode = new GeoApiContext.Builder()
    .apiKey("AIzaSyAASyK4NcL0JFu9p3Vm3_alRZNEEv1btyE")
    .build();
    private String tokenid = null;
    private Semaphore semaphore = new Semaphore(0);


    //FOR TESTING PURPOSES ONLY
    @RequestMapping(value = "/profile",method = RequestMethod.GET)
    public ProfileResponse profile(@RequestParam(value="userid") String id) {


        JSONObject result = HelperFunction.getData("users/"+id, logger);
        return new ProfileResponse("success", id, result.toJSONString());
        
    }

    @CrossOrigin
    @RequestMapping(value = "/postProfile",method = RequestMethod.POST)
    public BasicResponse postProfile(
        @RequestParam(value="token") String idToken,
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

            //INITIALIZE DATA
            String id = null;
            String firstname = null;
            String lastname = null;
            String userType = null;
            String dob = null;
            String streetname = null;
            String streetnumber = null;
            String suburb = null;
            String state = null;
            String postcode = null;
            String country = null;


            //READ DATAS Any idea how to not repeat these function?
            if(jsonProfile.containsKey("userid")){
                id = (String) jsonProfile.get("userid");
            }else{
                return new BasicResponse("error", null, "no user id found");
            }

            if(jsonProfile.containsKey("firstname")){
                firstname = (String) jsonProfile.get("firstname");
            }else{
                return new BasicResponse("error", id, "no first name found");
            }

            if(jsonProfile.containsKey("lastname")){
                lastname = (String) jsonProfile.get("lastname");
            }else{
                return new BasicResponse("error", id, "no last name found");
            }

            if(jsonProfile.containsKey("dob")){
               dob = (String) jsonProfile.get("dob");
            }else{
                return new BasicResponse("error", id, "no dob found");
            }

            if(jsonProfile.containsKey("userType")){
                userType = (String) jsonProfile.get("userType");
            }else{
                return new BasicResponse("error", id, "no user type found");
            }

            if(jsonProfile.containsKey("streetnumber")){
                streetnumber = (String) jsonProfile.get("streetnumber");
            }else{
                return new BasicResponse("error", id, "no streetnumber found");
            }

            if(jsonProfile.containsKey("streetname")){
                streetname = (String) jsonProfile.get("streetname");
            }else{
                return new BasicResponse("error", id, "no streetname found");
            }

            if(jsonProfile.containsKey("suburb")){
                suburb = (String) jsonProfile.get("suburb");
            }else{
                return new BasicResponse("error", id, "no suburb found");
            }

            if(jsonProfile.containsKey("state")){
                state = (String) jsonProfile.get("state");
            }else{
                return new BasicResponse("error", id, "no state found");
            }

            if(jsonProfile.containsKey("postcode")){
                postcode = (String) jsonProfile.get("postcode");
            }else{
                return new BasicResponse("error", id, "no postcode found");
            }

            if(jsonProfile.containsKey("country")){
                country = (String) jsonProfile.get("country");
            }else{
                return new BasicResponse("error", id, "no country found");
            }

            //check token id = id
            FirebaseAuth.getInstance().verifyIdToken(idToken)
                .addOnSuccessListener(new OnSuccessListener<FirebaseToken>(){

					@Override
					public void onSuccess(FirebaseToken result) {
                        tokenid = result.getUid();
                        semaphore.release();
					}

            });

            //catch semaphore aka wait for decoding to finish
            try{
                semaphore.acquire();
            }catch(InterruptedException e){
                e.printStackTrace();
                logger.info("Interrupted while waiting for id verification token");
                return new BasicResponse("error", id, "Interrupted exception when waiting for token decoding");
            }


            //token checking
            if(this.tokenid == id){
                logger.info("id provided matches decoded token id. Continue");
            }else{
                logger.info("id provided does not match decoded token");
                return new BasicResponse("error", id, "id provided does not match decoded token");
            }



            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users/"+id);
            



            //String checking for each input
            if(!userType.equals("User") && !userType.equals("Vet")){
                return new BasicResponse("error",id,"userType must User or Vet");
            }

            if(!HelperFunction.testDob(dob)){
                return new BasicResponse("error",id,"wrong dob format");
            }

            
            String address =  streetnumber + " " +streetname + " , "+ suburb + " , "+state + " "+ postcode+ ","+ country;

            ProfileData data = new ProfileData(firstname, lastname, userType, dob, streetnumber, streetname, suburb, state, postcode,country,DEFAULTPICTURE);
            ref.setValue(data);

            

                
            try {
                GeocodingResult[] results =  GeocodingApi.geocode(geocode,
                        address).await();
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                String latitude = gson.toJson(results[0].geometry.location.lat);
                String longitude = gson.toJson(results[0].geometry.location.lng);
                logger.debug("google api result: Lat :"+ latitude + ", Long :" + longitude);

                
                    //If theres a lat and long create a geofire file
                DatabaseReference georef;
                GeoFire geofire = null;
                if(userType.equals("User")){
                    georef =  FirebaseDatabase.getInstance().getReference("geofire/User");
                    geofire = new GeoFire(georef);
                }else if(userType.equals("Vet")){
                    georef =  FirebaseDatabase.getInstance().getReference("geofire/Vet");
                    geofire = new GeoFire(georef);
                }
                double lat = Double.parseDouble(latitude);
                double lng = Double.parseDouble(longitude);
                geofire.setLocation(id, new GeoLocation(lat, lng));



            } catch (ApiException e) {
                logger.error("Google API exception");
                e.printStackTrace();
                return new BasicResponse("error",id,"Google API error");
            } catch (InterruptedException e) {
                logger.error("Interrupted while waiting result for Google API");
                e.printStackTrace();
                return new BasicResponse("error",id,"Interrupted");
            } catch(IOException e){
                logger.error("IOexception at Google API");
                e.printStackTrace();
                return new BasicResponse("error",id,"IO problem from Google API");
            }

        return new BasicResponse("success",id,null);
    }

    @CrossOrigin
    @RequestMapping(value = "/profileUpdate",method = RequestMethod.POST)
    public BasicResponse profileUpdate(
        @RequestParam(value="userid") String id,
        @RequestParam(value="firstname",required = false) String firstname,
        @RequestParam(value="lastname",required = false)String lastname,
        @RequestParam(value="dob",required = false)String dob,
        @RequestParam(value="streetnumber",required = false)String streetnumber,
        @RequestParam(value="streetname",required = false)String streetname,
        @RequestParam(value="postcode",required = false)String postcode,
        @RequestParam(value="suburb",required = false) String suburb,
        @RequestParam(value="state",required = false)String state,
        @RequestParam(value="country",required = false)String country)
        {
            //check token id = user id


            String userType = HelperFunction.getUserType(id, logger);
            boolean changeaddress = false;

            //String testing

            if(!HelperFunction.testDob(dob)){
                logger.info("wrong format in dob");
                return new BasicResponse("error",id,"wrong dob format");
            }
            
            //check if one of address related stuff is changed
            if(streetnumber != null || streetname != null || suburb!=null || state!=null || postcode != null ||country!=null ){
                logger.info("There is an address change");
                if(streetnumber == null || streetname == null || suburb == null || state== null |postcode == null || country == null){
                    logger.info("There is an address change,but some of them is null");
                    return new BasicResponse("error",id,"Some of the address field is null");
                }
                changeaddress = true;
            }

            //here if all address is changed or no address is changed
            //set database ref

            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users/"+id);
            HashMap<String, Object> update = new HashMap<String,Object> ();
            if(firstname!= null){
                logger.info("firstname of "+id+" changed to " + firstname);
                update.put("firstname", firstname);
            }

            if(lastname!= null){
                logger.info("lastname of "+id+" changed to " + lastname);
                update.put("lastname",lastname);
            }

            if(dob != null){
                logger.info("dob of "+id+" changed to " + dob);
                update.put("dob",dob);
            }

            if(streetnumber != null){
                logger.info("streetnumber of "+id+" changed to " + streetnumber);
                update.put("streetnumber",streetnumber);
            }

            if(streetname!= null){
                logger.info("streetname of "+id+" changed to " + streetname);
                update.put("streetname",streetname);
            }

            if(suburb != null){
                logger.info("suburb of "+id+" changed to " + suburb);
                update.put("suburb",suburb);
            }

            if(state != null){
                logger.info("state of "+id+" changed to " + state);
                update.put("state",state);
            }

            if(postcode != null){
                logger.info("postcode of "+id+" changed to " + postcode);
                update.put("postcode",postcode);
            }

            if(country != null){
                logger.info("country of "+id+" changed to " + country);
                update.put("country",country);
            }

            if(changeaddress){
                try {
                    String address =  streetnumber + " " +streetname + " , "+ suburb + " , "+state + " "+ postcode+ ","+ country;
                    GeocodingResult[] results =  GeocodingApi.geocode(geocode,
                            address).await();
                    Gson gson = new GsonBuilder().setPrettyPrinting().create();
                    String latitude = gson.toJson(results[0].geometry.location.lat);
                    String longitude = gson.toJson(results[0].geometry.location.lng);
                    logger.debug("google api result: Lat :"+ latitude + ", Long :" + longitude);
    
                    
                        //If theres a lat and long create a geofire file
                    DatabaseReference georef;
                    GeoFire geofire = null;
                    if(userType.equals("User")){
                        georef =  FirebaseDatabase.getInstance().getReference("geofire/User");
                        geofire = new GeoFire(georef);
                    }else if(userType.equals("Vet")){
                        georef =  FirebaseDatabase.getInstance().getReference("geofire/Vet");
                        geofire = new GeoFire(georef);
                    }
                    double lat = Double.parseDouble(latitude);
                    double lng = Double.parseDouble(longitude);
                    geofire.setLocation(id, new GeoLocation(lat, lng));
    
    
    
                } catch (ApiException e) {
                    logger.error("Google API exception");
                    e.printStackTrace();
                    return new BasicResponse("error",id,"Google API error");
                } catch (InterruptedException e) {
                    logger.error("Interrupted while waiting result for Google API");
                    e.printStackTrace();
                    return new BasicResponse("error",id,"Interrupted");
                } catch(IOException e){
                    logger.error("IOexception at Google API");
                    e.printStackTrace();
                    return new BasicResponse("error",id,"IO problem from Google API");
                }
            }




            ref.updateChildren(update);

            return new BasicResponse("success",id,null);
        }

}