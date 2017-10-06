package server.response;

import org.json.simple.JSONObject;

public class StoreResponse {
    private JSONObject storeItems;
    private String response;
    private String message;


    public StoreResponse(JSONObject items, String response, String message){
        this.storeItems = items;
        this.response = response;
        this.message = message;
        }

    public String getStoreItems(){
        if(this.storeItems!= null){
            return this.storeItems.toJSONString();
        }
        else return null;
    }
    public String getResponse(){
            return this.response;
        }

    public String getMessage(){
            return this.message;
        }
}

