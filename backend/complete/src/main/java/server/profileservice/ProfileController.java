package server.profileservice;

import java.io.IOException;
import java.util.ArrayList;
import java.util.concurrent.Semaphore;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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

@RestController
public class ProfileController {
   
    
    private Semaphore semaphore = new Semaphore(0);


    @RequestMapping(value = "/profile",method = RequestMethod.GET)
    public ProfileResponse profile(@RequestParam(value="userid") String id) {
        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users/"+id);
        if(ref == null){
            System.out.println("ref = null");
        }

        ArrayList<ProfileData> datas = new ArrayList<ProfileData>();
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                String firstname =(String) dataSnapshot.child("firstname").getValue();
                String lastname =(String) dataSnapshot.child("lastname").getValue();
                String userType =(String) dataSnapshot.child("userType").getValue();
                String date = (String) dataSnapshot.child("dob").getValue();
                ProfileData data = new ProfileData(firstname, lastname, userType,date);
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
            e.printStackTrace();
        }

        if(datas.size()>0){
            return new ProfileResponse("success", id,datas.get(0));  
        }else{
            return new ProfileResponse("error",id,null);
        }
    }


    @RequestMapping(value = "/postProfile",method = RequestMethod.POST)
    public BasicResponse postProfile(
        @RequestParam(value="userid") String id,
        @RequestParam(value="firstName") String firstname,
        @RequestParam(value="lastName")String lastname,
        @RequestParam(value="dob")String dob,
        @RequestParam(value="userType") String userType,
        @RequestParam(value="streetNumber")String streetnumber,
        @RequestParam(value="streetName")String streetname,
        @RequestParam(value="postcode")String postcode,
        @RequestParam(value="suburb") String suburb,
        @RequestParam(value="state")String state){
        
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users/"+id);

            //TODO: String checking for input
            //String checking for each input




            ProfileData data = new ProfileData(firstname, lastname, userType, dob, streetnumber, streetname, suburb, state, postcode);
            ref.setValue(data);

            //GOOGLE API

            GeoApiContext geocode = new GeoApiContext.Builder()
            .apiKey("AIzaSyAASyK4NcL0JFu9p3Vm3_alRZNEEv1btyE")
            .build();

            String address = streetnumber + " " +streetname + " , "+ suburb + " , "+state + " "+ postcode+ ", Australia";
            try {
                GeocodingResult[] results =  GeocodingApi.geocode(geocode,
                            address).await();
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                String latitude = gson.toJson(results[0].geometry.location.lat);
                String longitude = gson.toJson(results[0].geometry.location.lng);

                
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
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch(IOException e){
                e.printStackTrace();
            }

        return new BasicResponse("success",id);
    }
}