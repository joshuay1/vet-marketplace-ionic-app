package server.petprofileservice;

import com.google.firebase.database.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import server.response.BasicResponse;

import java.io.IOException;

@RestController
public class PetProfileController {
    private int flag;
    @RequestMapping(value = "/postPetProfile",method = RequestMethod.POST)
    public BasicResponse postProfile(
            @RequestParam(value ="petId")String id,
            @RequestParam(value ="userId") String uid,
            @RequestParam(value="petname") String petname,
            @RequestParam(value="dob")String dob,
            @RequestParam(value="animalType") String animalType,
            @RequestParam(value="breed") String animalBreed)
    {

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("pets/"+id);
        //TODO: check token.id = id


        //TODO: String checking for input
        //String checking for each input
        PetProfileData data = new PetProfileData(petname,animalType, dob, animalBreed,uid);
        DatabaseReference userRef = FirebaseDatabase.getInstance().getReference("users/");
        userRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if(snapshot.hasChild(uid)){
                    ref.setValue(data);
                    flag = 0;
                }
                else {
                    flag = 1;
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {

            }
        });

        if (flag==1) {
            return new BasicResponse("success", id, null);
        }
        else
            return new BasicResponse("failure",id,"No such user exists");
    }
}
