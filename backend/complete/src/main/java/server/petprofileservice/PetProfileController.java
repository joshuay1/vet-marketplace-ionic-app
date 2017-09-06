package server.petprofileservice;

import com.google.firebase.database.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import server.Application;
import server.response.BasicResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import server.HelperFunction;
import org.json.simple.*;

@RestController
public class PetProfileController {
    private BasicResponse response = null;
    private int flag = -1;
    private final Logger logger = LoggerFactory.getLogger(Application.class);


    @RequestMapping(value = "/postPetProfile", method = RequestMethod.POST)
    public BasicResponse postPetProfile(
            @RequestParam(value = "petId") String id,
            @RequestParam(value = "userId") String uid,
            @RequestParam(value = "petname") String petname,
            @RequestParam(value = "dob") String dob,
            @RequestParam(value = "animalType") String animalType,
            @RequestParam(value = "breed") String animalBreed) {

        //TODO: check token.id = id
        //DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/");

        //TODO: String checking for input
        //String checking for each input
        //PetProfileData data = new PetProfileData(petname, animalType, dob, animalBreed, uid);
        DatabaseReference userRef = FirebaseDatabase.getInstance().getReference("users/");
        userRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.hasChild(uid)) {
                    if(!snapshot.hasChild(uid+"/petIds")) {
                        logger.info("PET ID's DONT EXIST IN USER");
                        DatabaseReference id = userRef.child(uid).push();
                        PetProfileData data = new PetProfileData(petname, animalType, dob, animalBreed, uid);
                        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/"+id.getKey());
                        ref.setValue(data);
                        List petIds = new ArrayList<String>();
                        petIds.add(id.getKey());
                        DatabaseReference petRef = FirebaseDatabase.getInstance().getReference("users/"+uid);
                        petRef.child("petIds").setValue(petIds);
                    }
                    else {
                        logger.info("PET ID's EXIST IN USER");
                        DatabaseReference id = userRef.child(uid).push();
                        PetProfileData data = new PetProfileData(petname, animalType, dob, animalBreed, uid);
                        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/"+id.getKey());
                        ref.setValue(data);
                        DatabaseReference petRef = FirebaseDatabase.getInstance().getReference("users/"+uid+"/petIds");
                        petRef.addListenerForSingleValueEvent(new ValueEventListener() {
                            @Override
                            public void onDataChange(DataSnapshot snapshot) {
                                GenericTypeIndicator<ArrayList<String>> t = new GenericTypeIndicator<ArrayList<String>>() {};
                                ArrayList<String> petIds = snapshot.getValue(t);
                                logger.debug("PET ID's EXIST IN USER and PET ID is as follows" + petIds);
                                petIds.add(id.getKey());
                                petRef.setValue(petIds);
                            }
                            @Override
                            public void onCancelled(DatabaseError error) {}
                        });
                    }

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


    @RequestMapping(value = "/deletePetProfile/{id}", method = RequestMethod.DELETE)
    public BasicResponse petProfileDelete(
            @PathVariable("id") String id)
        {
        //check token id = user id
        String petUserUrl = "pets/"+id;
        try {
            JSONObject petInfo = HelperFunction.getData(petUserUrl, logger);
            String userId = petInfo.get("userId").toString();
            String userPetsUrl = "users/" + userId;
            JSONObject userPetInfo = HelperFunction.getData(userPetsUrl, logger);
            JSONArray petIds = (JSONArray) userPetInfo.get("petIds");
            JSONArray newPetIds = new JSONArray();
            petIds.remove(null);
            petIds.remove(id);
            DatabaseReference userRef = FirebaseDatabase.getInstance().getReference("users/" + userId);
            userRef.child("petIds").setValue((ArrayList<String>) petIds);
            DatabaseReference petRef = FirebaseDatabase.getInstance().getReference(petUserUrl);
            petRef.setValue(null);
            return new BasicResponse("success", id, null);
        }
        catch (NullPointerException e){
            return new BasicResponse("failure", id, "ID doesn't exist");
        }
    }
}
