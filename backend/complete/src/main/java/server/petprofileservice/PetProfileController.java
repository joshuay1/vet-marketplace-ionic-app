package server.petprofileservice;

import com.google.firebase.database.*;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
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

    @CrossOrigin
    @RequestMapping(value = "/postPetProfile", method = RequestMethod.POST)
    public BasicResponse postPetProfile(
            @RequestParam(value = "token") String tokenString,
            @RequestBody String jsonString){
        JSONParser parser = new JSONParser();
        JSONObject jsonProfile = null;
        try{
            jsonProfile = (JSONObject) parser.parse(jsonString);
        }catch(ParseException e) {
            e.printStackTrace();
            return new BasicResponse("error", null, "body not JSON Object");
        }
        /*
            @RequestParam(value = "petId") String id,
            @RequestParam(value = "userId") String uid,
            @RequestParam(value = "petname") String petname,
            @RequestParam(value = "dob") String dob,
            @RequestParam(value = "animalType") String animalType,
            @RequestParam(value = "breed") String animalBreed) {
        */
        //Initialize Data
        //String mid = null;
        String muid = null;
        String mpetname = null;
        String mdob = null;
        String manimalType = null;
        String manimalBreed = null;

        if(jsonProfile.containsKey("userId")){
            muid = (String) jsonProfile.get("userId");
            //check token id = id
            boolean match = HelperFunction.matchToken(muid, tokenString, logger);

            if(match){
                logger.info("id provided matches decoded token id. Continue");
            }else{
                logger.info("id provided does not match decoded token");
                return new BasicResponse("error", muid, "id provided does not match decoded token");
            }
        }else{
            return new BasicResponse("error", muid, "no user id found");
        }
        /*if(jsonProfile.containsKey("petId")){
            mid = (String) jsonProfile.get("petId");
        }
        else{
            return new BasicResponse("error",muid,"no petId found");
        }*/
        if(jsonProfile.containsKey("petname")){
            mpetname = (String) jsonProfile.get("petname");
        }
        else {
            return new BasicResponse("error",muid,"petname not provided");
        }
        if (jsonProfile.containsKey("dob")){
            mdob = (String) jsonProfile.get("dob");
        }
        else{
            return new BasicResponse("error",muid,"no dob provided");
        }
        if(jsonProfile.containsKey("animalType")){
            manimalType = (String) jsonProfile.get("animalType");
        }
        else {
            return new BasicResponse("error", muid,"no animalType provided");
        }
        if (jsonProfile.containsKey("breed")){
            manimalBreed = (String) jsonProfile.get("breed");
        }
        else {
            return new BasicResponse("error", muid, "no breed provided");
        }
        final String uid = muid;
        //final String id = mid;
        final String petname = mpetname;
        final String dob = mdob;
        final String animalType = manimalType;
        final String animalBreed = manimalBreed;
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

        //if (flag == 0) {
            return new BasicResponse("success",uid, null);
        //} else if(flag == 1)
          //  return new BasicResponse("failure",uid, "No such user exists");

        //return null;
    }

    @CrossOrigin
    @RequestMapping(value = "/petProfileUpdate", method = RequestMethod.POST)
    public BasicResponse petProfileUpdate(
            @RequestParam(value = "token") String tokenString,
            @RequestBody String jsonString){
        JSONParser parser = new JSONParser();
        JSONObject jsonProfile = null;
        try{
            jsonProfile = (JSONObject) parser.parse(jsonString);
        }catch(ParseException e) {
            e.printStackTrace();
            return new BasicResponse("error", null, "body not JSON Object");
        }
        /*

            @RequestParam(value = "petId") String id,
            @RequestParam(value = "petname") String petname,
            @RequestParam(value = "dob") String dob,
            @RequestParam(value = "animalType") String animalType,
            @RequestParam(value = "breed") String animalBreed) {
        */
        //check token id = user id
        String id = null;
        String petname = null;
        String dob = null;
        String animalType = null;
        String animalBreed = null;

        if(jsonProfile.containsKey("petId")){
            id = (String) jsonProfile.get("petId");
        }else{
            return new BasicResponse("error", id, "no pet id found");
        }
        if(jsonProfile.containsKey("petName")){
            petname = (String) jsonProfile.get("petName");
        }
        else {
            return new BasicResponse("error",id,"petname not provided");
        }
        if (jsonProfile.containsKey("dob")){
            dob = (String) jsonProfile.get("dob");
        }
        else{
            return new BasicResponse("error",id,"no dob provided");
        }
        if(jsonProfile.containsKey("animalType")){
            animalType = (String) jsonProfile.get("animalType");
        }
        else {
            return new BasicResponse("error", id,"no animalType provided");
        }
        if (jsonProfile.containsKey("breed")){
            animalBreed = (String) jsonProfile.get("breed");
        }
        else {
            return new BasicResponse("error", id, "no breed provided");
        }

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/"+id);
        HashMap<String, Object> update = new HashMap<String,Object> ();
        if(petname!= null && !petname.isEmpty()){
            logger.info("name of "+id+" changed to " + petname);
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
