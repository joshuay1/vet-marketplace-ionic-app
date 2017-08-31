package server.response;

public class BasicResponse{
    private String response;
    private String id;
    private String errorMessage;

    public BasicResponse(String response, String id,String errorMessage){
        this.id = id;
        this.response = response;
        this.errorMessage = errorMessage;
    }

    public String getId(){
        return this.id;
    }

    public String getResponse(){
        return this.response;
    }

    public String getErrorMessage(){
        return this.errorMessage;
    }

}