package server.profileservice;

import java.io.IOException;
import java.util.HashMap;
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
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
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


    //FOR TESTING PURPOSES ONLY
    @RequestMapping(value = "/profile",method = RequestMethod.GET)
    public ProfileResponse profile(@RequestParam(value="userid") String id) {


        JSONObject result = HelperFunction.getData("users/"+id, logger);
        return new ProfileResponse("success", id, result.toJSONString());
        
    }

    @CrossOrigin
    @RequestMapping(value = "/postProfile",method = RequestMethod.POST)
    public BasicResponse postProfile(
        @RequestParam(value="token") String tokenString,
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
            Boolean isVerifiedAuthKey = false;


            //READ DATAS Any idea how to not repeat these function?
            if(jsonProfile.containsKey("userid")){
                id = (String) jsonProfile.get("userid");
                //check token id = id
                boolean match = HelperFunction.matchToken(id, tokenString, logger);
            
                if(match){
                    logger.info("id provided matches decoded token id. Continue");
                }else{
                    logger.info("id provided does not match decoded token");
                    return new BasicResponse("error", id, "id provided does not match decoded token");
                }
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
               if(!HelperFunction.testDob(dob)){
                return new BasicResponse("error",id,"wrong dob format");
                }
            }else{
                return new BasicResponse("error", id, "no dob found");
            }

            if(jsonProfile.containsKey("userType")){
                userType = (String) jsonProfile.get("userType");
                if(!userType.equals("User") && !userType.equals("Vet")){
                    return new BasicResponse("error",id,"userType must User or Vet");
                }
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


            


            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users/"+id);

            
            String address =  streetnumber + " " +streetname + " , "+ suburb + " , "+state + " "+ postcode+ ","+ country;
            
            ProfileData data = new ProfileData(firstname, lastname, userType, dob, streetnumber, streetname, suburb, state, postcode,country,DEFAULTPICTURE,isVerifiedAuthKey);
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
        @RequestParam(value="token") String tokenString,
        @RequestBody String jsonString
        )
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


            //READ DATAS 

            HashMap<String, Object> update = new HashMap<String,Object> ();


            if(jsonProfile.containsKey("userid")){
                id = (String) jsonProfile.get("userid");
                boolean match = HelperFunction.matchToken(id, tokenString, logger);
                if(!match){
                    return new BasicResponse("error", id, "token id does not match provided id");
                }
            }else{
                return new BasicResponse("error", null, "no user id found");
            }

            if(jsonProfile.containsKey("firstname")){
                firstname = (String) jsonProfile.get("firstname");
                if(firstname!= null){
                    logger.info("firstname of "+id+" changed to " + firstname);
                    update.put("firstname", firstname);
                }
            }

            if(jsonProfile.containsKey("lastname")){
                lastname = (String) jsonProfile.get("lastname");
                if(lastname!= null){
                    logger.info("lastname of "+id+" changed to " + lastname);
                    update.put("lastname",lastname);
                }
            }

            if(jsonProfile.containsKey("dob")){
               dob = (String) jsonProfile.get("dob");
               if(!HelperFunction.testDob(dob)){
                    logger.info("wrong format in dob");
                    return new BasicResponse("error",id,"wrong dob format");
               }
               if(dob != null){
                logger.info("dob of "+id+" changed to " + dob);
                update.put("dob",dob);
                }
            }

            if(jsonProfile.containsKey("userType")){
                userType = (String) jsonProfile.get("userType");
                String userTypeTest = HelperFunction.getUserType(id, logger);
                if(userTypeTest == userType){
    
                }else{
                    logger.info("different userType specified");
                    return new BasicResponse("error", null,"different userType than specified");
                }
            }

            if(jsonProfile.containsKey("streetnumber")){
                streetnumber = (String) jsonProfile.get("streetnumber");
                if(streetnumber != null){
                    logger.info("streetnumber of "+id+" changed to " + streetnumber);
                    update.put("streetnumber",streetnumber);
                }
            }
            
            if(jsonProfile.containsKey("streetname")){
                streetname = (String) jsonProfile.get("streetname");
                if(streetname!= null){
                    logger.info("streetname of "+id+" changed to " + streetname);
                    update.put("streetname",streetname);
                }
            }

            if(jsonProfile.containsKey("suburb")){
                suburb = (String) jsonProfile.get("suburb");
                if(suburb != null){
                    logger.info("suburb of "+id+" changed to " + suburb);
                    update.put("suburb",suburb);
                }
            }

            if(jsonProfile.containsKey("state")){
                state = (String) jsonProfile.get("state");
                if(state != null){
                    logger.info("state of "+id+" changed to " + state);
                    update.put("state",state);
                }
            }

            if(jsonProfile.containsKey("postcode")){
                postcode = (String) jsonProfile.get("postcode");
                if(postcode != null){
                    logger.info("postcode of "+id+" changed to " + postcode);
                    update.put("postcode",postcode);
                }
            }

            if(jsonProfile.containsKey("country")){
                country = (String) jsonProfile.get("country");
                if(country != null){
                    logger.info("country of "+id+" changed to " + country);
                    update.put("country",country);
                }
            }

            
            boolean changeaddress = false;

            
            
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