package server.petprofileservice;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import server.petprofileservice.PetProfileData;
import server.response.BasicResponse;

import java.io.IOException;

@RestController
public class PetProfileController {
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
        ref.setValue(data);
    return new BasicResponse("success",id,null);
    }
}
