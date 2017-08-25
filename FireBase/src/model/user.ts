export interface User {
    email: string;
    password: string;
    
}

export interface UserInfo{
    userType: string;
    firstname: string;
    lastname: string;
    dob: number;
    month: number;
    year: number;
    authkey: string;
    streetnumber: string;
    streetname: string;
    suburb : string;
    state: string;
    postcode : number;
}
