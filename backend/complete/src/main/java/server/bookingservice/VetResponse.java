package server.bookingservice;



public class VetResponse{

    private String[] VetIds;
    private String response;
    private String message;


    public VetResponse(String[] vetids, String response, String message){
        this.VetIds = vetids;
        this.response = response;
        this.message = message;
    }

    public String[] getVetID(){
        return this.VetIds;
    }

    public String getResponse(){
        return this.response;
    }

    public String getMessage(){
        return this.message;
    }
}