package server.profileservice;


public class ProfileData {
    private String firstname;
    private String lastname;
    private String userType;
    private String dob;
    private String streetnumber;
    private String streetname;
    private String postcode;
    private String state;
    private String suburb;

    public ProfileData(String firstname, String lastname, String userType, String date){
        this.firstname = firstname;
        this.lastname = lastname;
        this.userType = userType;
        this.dob = date;
    }

    public ProfileData(String firstname,String lastname,String userType,String date,
            String streetnumber,String streetname,String suburb,String state,String postcode){
                this.firstname = firstname;
                this.lastname = lastname;
                this.dob = date;
                this.streetnumber = streetnumber;
                this.userType = userType;
                this.streetname = streetname;
                this.suburb = suburb;
                this.state = state;
                this.postcode = postcode;
            }
    
    //GETTERS 
    public String getFirstname(){
        return this.firstname;
    }

    public String getLastname(){
        return this.lastname;
    }

    public String getUserType(){
        return this.userType;
    }

    public String getDob(){
        return dob;
    }

    public String getStreetnumber(){
        return this.streetnumber;
    }

    public String getStreetname(){
        return this.streetname;
    }

    public String getSuburb(){
        return this.suburb;
    }

    public String getState(){
        return this.state;
    }

    public String getPostcode(){
        return this.postcode;
    }




}