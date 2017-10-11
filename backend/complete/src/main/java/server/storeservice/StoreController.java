package server.storeservice;

import org.json.simple.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import server.Application;
import server.HelperFunction;
import server.response.StoreResponse;

@RestController
public class StoreController {

    private Logger logger = LoggerFactory.getLogger(Application.class);

    @CrossOrigin
    @RequestMapping(value = "/getVetStoreItems/",method = RequestMethod.GET)
    public StoreResponse getVetStoreItems(
            @RequestParam(value="token") String tokenString)
    {
        String id = HelperFunction.getIdfromToken(tokenString, this.logger);
        if(id != null){
            logger.info("id provided = "+ id);
        }else{
            return new StoreResponse(null, "error", "token provided is not valid");
        }

        String storeUrl = "VetStore/";
        JSONArray storeItems = HelperFunction.getDataInArray(storeUrl, logger);
        logger.info(storeItems.toString());
        if(storeItems== null || storeItems.size() == 0){
            logger.info("cant find storeItems");
            return new StoreResponse(null, "success", "no available vets");
        }
        return new StoreResponse(storeItems,"success",null);
    }

    @CrossOrigin
    @RequestMapping(value = "/getUserStoreItems/",method = RequestMethod.GET)
    public StoreResponse getUserStoreItems(
      @RequestParam(value="token") String tokenString)
    {
        String id = HelperFunction.getIdfromToken(tokenString, this.logger);
        if(id != null){
            logger.info("id provided = "+ id);
        }else{
            return new StoreResponse(null, "error", "token provided is not valid");
        }

        String storeUrl = "UserStore/";
        JSONArray storeItems = HelperFunction.getDataInArray(storeUrl, logger);
        logger.info(storeItems.toString());
        if(storeItems== null || storeItems.size() == 0){
            logger.info("cant find storeItems");
            return new StoreResponse(null, "success", "no available vets");
        }
        return new StoreResponse(storeItems,"success",null);
    }

}
