package server;


import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Arrays;
import javax.net.ssl.HttpsURLConnection;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;

/**
 * HelperFunction class that provide useful function
 * to be used on other classes
 * test pull
 *
 */
public class HelperFunction {
	

	private static GoogleCredential scope = null;
	
	

	public static JSONObject getData(String path, Logger logger){
		String token = null;
		if(scope == null){
			try{
				File file = new File(Application.class.getResource("/service-account.json").toURI());
				FileInputStream serviceAccount = new FileInputStream(file);
				GoogleCredential googleCred = GoogleCredential.fromStream( serviceAccount);
				scope = googleCred.createScoped(
					Arrays.asList(
				  	"https://www.googleapis.com/auth/firebase.database.readonly",  // or use firebase.database.readonly for read-only access
				 	 "https://www.googleapis.com/auth/userinfo.email"
					)
				);
			
					
			
			}catch(IOException e){
				logger.info("file not found service account");
				return null;
			}catch(URISyntaxException e){
				logger.info("problem in reading the file");
				return null;
			}
		}


		try{
			scope.refreshToken();
		}catch(IOException e){
			logger.info("problem in refreshing token");
			return null;
		}
		token = scope.getAccessToken();	

		String url = "https://vetquoll-c22f9.firebaseio.com/";
		String restPath = url +path + ".json?access_token="+token;
		
		try{
			URL obj = new URL(restPath);
			HttpsURLConnection con = (HttpsURLConnection) obj.openConnection();
			con.setRequestMethod("GET");
			logger.info("sending get rest request with path= "+ restPath);
			int responseCode = con.getResponseCode();
			logger.info("Response Code : " + responseCode);


			BufferedReader in = new BufferedReader(
		        new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();

			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();
			JSONParser parser = new JSONParser();
			return (JSONObject) parser.parse(response.toString());
		}catch(IOException e){
			logger.info("IO problems in connecting to firebase database");
			return null;
		}catch(ParseException e){
			logger.info("parse problem from the database read");
			return null;
		}

		


	}

	public static String getUserType(String id, Logger logger){
		JSONObject data = getData("users/"+id, logger);
		return (String) data.get("userType");
	}

	public static boolean testDob(String dob){
		return dob.matches("[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}");
	}

}