package server.availabilityservice;

import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import server.Application;
import server.HelperFunction;
import server.response.BasicResponse;

public class AvailabilityController {
    private final Logger logger = LoggerFactory.getLogger(Application.class);

    @RequestMapping(value = "/postAvailability", method = RequestMethod.POST)
    public BasicResponse postPetProfile(
            @RequestParam(value = "year") String yr,
            @RequestParam(value = "month") String month,
            @RequestParam(value = "day") String day,
            @RequestParam(value = "hhStart") String hhs,
            @RequestParam(value = "hhEnd") String hhe,
            @RequestParam(value = "vetId") String vetId) {
        String vetUserUrl = "users/"+vetId;
        try {
            JSONObject petInfo = HelperFunction.getData(vetUserUrl, logger);
        }
        catch (NullPointerException e){
            return new BasicResponse("failure", vetId, "ID doesn't exist");
        }

            return new BasicResponse("success", vetId,null);
    }
}
