package server.availabilityservice;

public class AvailabilityData {

    private String year;
    private String month;
    private String day;
    private String hhStart;
    private String hhEnd;

    public AvailabilityData(String yy,String mm,String dd,
                              String hhs, String hhe){
        this.year = yy;
        this.month = mm;
        this.day= dd;
        this.hhStart= hhs;
        this.hhEnd= hhe;
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

    public String getHhStart(){
            return this.hhStart;
        }

    public String getHhEnd() { return hhEnd;}
}
