package server.response;

import org.json.JSONException;
import org.json.JSONObject;
import server.profileservice.ProfileData;

public class ProfileResponse {
    private String response;
    private String id;
    private ProfileData profileData;

    public ProfileResponse(String response, String id, ProfileData profileData){
        this.id = id;
        this.response = response;
        this.profileData = profileData;
    }

    public String getId(){
        return this.id;
    }

    public String getResponse(){
        return this.response;
    }

    public String getProfile(){
        JSONObject obj = new JSONObject();
        try{
            obj.put("firstname",this.profileData.getFirstname());
            obj.put("lastname",this.profileData.getLastname());
            obj.put("userType",this.profileData.getUserType());
            obj.put("dob",this.profileData.getDob());
            obj.put("streetnumber",this.profileData.getStreetnumber());
            obj.put("streetname",this.profileData.getStreetname());
            obj.put("suburb",this.profileData.getSuburb());
            obj.put("state",this.profileData.getState());
            obj.put("postcode",this.profileData.getPostcode());
            obj.put("pictureURL",this.profileData.getPictureURL());
        }catch(JSONException e){
            e.printStackTrace();
        }
        return obj.toString();
    }

}