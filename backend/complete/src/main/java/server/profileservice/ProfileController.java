package server.profileservice;

import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.Semaphore;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import server.Application;
import server.response.BasicResponse;
import server.response.ProfileResponse;
import com.firebase.geofire.GeoFire;
import com.firebase.geofire.GeoLocation;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.GeocodingResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class ProfileController {
   
    private Semaphore semaphore = new Semaphore(0);
    private final Logger logger = LoggerFactory.getLogger(Application.class);
    private final String DEFAULTPICTURE= "https://firebasestorage.googleapis.com/v0/b/vetquoll-c22f9.appspot.com/o/Basic%2Fempty.png?alt=media&token=9463fdee-6966-4d87-9928-d4e62e834a9d";


    @RequestMapping(value = "/profile",method = RequestMethod.GET)
    public ProfileResponse profile(@RequestParam(value="userid") String id) {
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users/"+id);
        logger.info("GET Profile Request from " + id);
        if(ref == null){
            logger.error("ref is null");
        }

        ArrayList<ProfileData> datas = new ArrayList<ProfileData>();
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                String firstname =(String) dataSnapshot.child("firstname").getValue();
                String lastname =(String) dataSnapshot.child("lastname").getValue();
                String userType =(String) dataSnapshot.child("userType").getValue();
                String date = (String) dataSnapshot.child("dob").getValue();
                String streetNumber = (String) dataSnapshot.child("streetnumber").getValue();
                String streetName = (String)dataSnapshot.child("streetname").getValue();
                String suburb = (String)dataSnapshot.child("suburb").getValue();
                String state = (String)dataSnapshot.child("state").getValue();
                String postcode = (String) dataSnapshot.child("postcode").getValue();
                String pictureURL = (String)dataSnapshot.child("pictureURL").getValue();


                ProfileData data = new ProfileData(firstname, lastname, userType,date,
                            streetNumber,streetName,suburb,state,postcode,pictureURL);
                logger.info("obtain value from database:"+firstname+","+lastname+","+userType+","+date
                                + streetNumber+","+streetName+","+suburb+","+state+","+postcode+","+ pictureURL);
                datas.add(data);
                semaphore.release();
            }
    
            @Override
            public void onCancelled(DatabaseError databaseError) {
    
            }
        });
        try{
            semaphore.acquire();
        }catch(InterruptedException e){
            logger.error("Semaphore is interrupted during the retreival of data");
        }


        if(datas.size()>0){
            if(datas.get(0).getPictureURL()==null){
                 ref.child("pictureURL").setValue(DEFAULTPICTURE);
                logger.debug("Empty picture URL, changing to default picture");
                datas.get(0).setPictureURL(DEFAULTPICTURE);
            }
            return new ProfileResponse("success", id,datas.get(0));  
        }else{
            logger.debug("data not found");
            return new ProfileResponse("error",id,datas.get(0));
        }
    }


    @RequestMapping(value = "/postProfile",method = RequestMethod.POST)
    public BasicResponse postProfile(
        @RequestParam(value="userid") String id,
        @RequestParam(value="firstName",required = false) String firstname,
        @RequestParam(value="lastName",required = false)String lastname,
        @RequestParam(value="dob",required = false)String dob,
        @RequestParam(value="userType",required = false) String userType,
        @RequestParam(value="streetNumber",required = false)String streetnumber,
        @RequestParam(value="streetName",required = false)String streetname,
        @RequestParam(value="postcode",required = false)String postcode,
        @RequestParam(value="suburb",required = false) String suburb,
        @RequestParam(value="state",required = false)String state,
        @RequestParam(value="pictureURL",required = false)String pictureURL)
        {
        
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users/"+id);

            //TODO: String checking for input
            //String checking for each input
            
            String address =  streetnumber + " " +streetname + " , "+ suburb + " , "+state + " "+ postcode+ ", Australia";
            //check if theres any change in address
            boolean addressChange = false;
            if(streetnumber!= null && streetname!= null && suburb!= null && state!= null && postcode!= null){
                addressChange = true;
                
                logger.debug("Address Change to "+ address);
            }

            ProfileData data = new ProfileData(firstname, lastname, userType, dob, streetnumber, streetname, suburb, state, postcode);
            ref.setValue(data);

            //GOOGLE API
            if(addressChange == true){
                GeoApiContext geocode = new GeoApiContext.Builder()
                .apiKey("AIzaSyAASyK4NcL0JFu9p3Vm3_alRZNEEv1btyE")
                .build();

                
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
            }

        return new BasicResponse("success",id,null);
    }

}