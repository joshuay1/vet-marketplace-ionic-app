package server.petprofileservice;

public class PetProfileData {
    private String petName;
    private String animalType;
    private String dob;
    private String animalBreed;
    private String userId;

    public PetProfileData(String name,String animalType,String date,
                       String animalBreed, String uid){
        this.petName = name;
        this.dob = date;
        this.animalType = animalType;
        this.animalBreed = animalBreed;
        this.userId = uid;
    }



    //GETTERS
    public String getPetName(){
        return this.petName;
    }

    public String getAnimalType(){
        return this.animalType;
    }

    public String getDob(){
        return dob;
    }

    public String getAnimalBreed(){
        return this.animalBreed;
    }

    public String getUserId() { return userId;}
}
