package server.response;

public class BasicResponse {
    private String response;
    private String id;

    public BasicResponse(String response, String id){
        this.id = id;
        this.response = response;
    }

    public String getId(){
        return this.id;
    }

    public String getResponse(){
        return this.response;
    }

}