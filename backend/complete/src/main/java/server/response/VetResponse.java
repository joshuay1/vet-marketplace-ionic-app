package server.bookingservice;

import org.json.simple.JSONObject;

public class VetResponse{

    private JSONObject VetIds;
    private String response;
    private String message;


    public VetResponse(JSONObject vetids, String response, String message){
        this.VetIds = vetids;
        this.response = response;
        this.message = message;
    }

    public String getVetID(){
        return this.VetIds.toJSONString();
    }

    public String getResponse(){
        return this.response;
    }

    public String getMessage(){
        return this.message;
    }
}