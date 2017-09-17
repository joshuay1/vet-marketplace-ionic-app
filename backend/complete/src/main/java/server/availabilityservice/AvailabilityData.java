package server.availabilityservice;

import org.json.simple.*;

public class AvailabilityData {

    private String year;
    private String month;
    private String day;
    //private String hhStart;
    //private String hhEnd;
    private JSONArray startTimes;
    public AvailabilityData(String yy,String mm,String dd,
                              String hhs, String hhe){
        this.year = yy;
        this.month = mm;
        this.day= dd;
        //this.hhStart= hhs;
        //this.hhEnd= hhe;
        this.startTimes = new JSONArray();
        for (int i = Integer.parseInt(hhs); i <= Integer.parseInt(hhe); i++ ){
            JSONObject time = new JSONObject();
            time.put(""+i,"N");
            this.startTimes.add(time);
        }
    }

    //GETTERS
    public String getYear(){
            return this.year;
        }

    public String getMonth(){
            return this.month;
        }

    public String getDay(){
            return this.day;
        }
    
    public JSONArray getStartTimes(){return this.startTimes;}
}
