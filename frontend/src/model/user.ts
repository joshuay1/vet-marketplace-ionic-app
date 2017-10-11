export interface User {
    email: string;
    password: string;
    
}

export interface UserInfo{
    userType: string;
    firstname: string;
    lastname: string;
    address: string;
    dob: Date;
    authkey: string;
    streetnumber: string;
    streetname: string;
    suburb : string;
    state: string;
    postcode: string;
    pictureURL: string;
    country : string;
    userid: string;
    isVerifiedVet: boolean;
    //TO-DO CAllum update this lista against the firebase db
}

export interface BookingInfo{
    userId : string;
    petId : string;
    vetId : string;
    year: any;
    month : any;
    day : any;
    time: string;
    status : string;

}
