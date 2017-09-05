package server.petprofileservice;

import com.firebase.geofire.GeoFire;
import com.firebase.geofire.GeoLocation;
import com.google.firebase.database.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.GeocodingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import server.response.BasicResponse;

import java.io.IOException;
import java.util.HashMap;

@RestController
public class PetProfileController {
    private BasicResponse response = null;
    private int flag = -1;

    @RequestMapping(value = "/postPetProfile", method = RequestMethod.POST)
    public BasicResponse postPetProfile(
            @RequestParam(value = "petId") String id,
            @RequestParam(value = "userId") String uid,
            @RequestParam(value = "petname") String petname,
            @RequestParam(value = "dob") String dob,
            @RequestParam(value = "animalType") String animalType,
            @RequestParam(value = "breed") String animalBreed) {

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/" + id);
        //TODO: check token.id = id


        //TODO: String checking for input
        //String checking for each input
        PetProfileData data = new PetProfileData(petname, animalType, dob, animalBreed, uid);
        DatabaseReference userRef = FirebaseDatabase.getInstance().getReference("users/");
        userRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.hasChild(uid)) {
                    ref.setValue(data);
                    flag = 0;
                } else {
                    flag = 1;
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {

            }
        });

        if (flag == 0) {
            return new BasicResponse("success", id, null);
        } else if(flag == 1)
            return new BasicResponse("failure", id, "No such user exists");

        return null;
    }

    @RequestMapping(value = "/petProfileUpdate", method = RequestMethod.POST)
    public BasicResponse petProfileUpdate(
            @RequestParam(value = "petId") String id,
            @RequestParam(value = "petname") String petname,
            @RequestParam(value = "dob") String dob,
            @RequestParam(value = "animalType") String animalType,
            @RequestParam(value = "breed") String animalBreed) {
        //check token id = user id

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/"+id);
        HashMap<String, Object> update = new HashMap<String,Object> ();
        if(petname!= null && !petname.isEmpty()){
            //logger.info("name of "+id+" changed to " + petname);
            update.put("petName", petname);
        }

        if(dob != null && !dob.isEmpty()){
            //logger.info("dob of "+id+" changed to " + dob);
            update.put("dob",dob);
        }

        if(animalBreed!= null && !animalBreed.isEmpty()){
            //logger.info("animalBreed of "+id+" changed to " + animalBreed);
            update.put("animalBreed",animalBreed);
        }

        if(animalType != null && !animalType.isEmpty()){
            //logger.info("Animal Type of "+id+" changed to " + animalType);
            update.put("animalType",animalType);
        }

        ref.updateChildren(update);
        return new BasicResponse("success", id, null);
    }


    @RequestMapping(value = "/deletePetProfile", method = RequestMethod.POST)
    public BasicResponse petProfileDelete(
            @RequestParam(value = "petId") String id)
        {
        //check token id = user id

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/");
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.hasChild(id)) {
                    DatabaseReference child = FirebaseDatabase.getInstance().getReference("pets/"+id);
                    child.getRef().setValue(null);
                }
            }
            @Override
            public void onCancelled(DatabaseError error) { }
        });
        return new BasicResponse("success", id, null);
    }
}
