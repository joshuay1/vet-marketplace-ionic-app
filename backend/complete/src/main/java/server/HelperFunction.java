package server;


import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.Arrays;
import javax.net.ssl.HttpsURLConnection;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;

/**
 * HelperFunction class that provide useful function
 * to be used on other classes
 * test pull
 *
 */
public class HelperFunction {
	

	private static GoogleCredential scope = null;
	/**
	 * check if the string is integer
	 * @param s string
	 * @return true if integer, false if not integer
	 */
	public static boolean IsInteger(String s){
		if(s.matches("^[0-9]+$")){
			return true;
		}
		return false;
		
	}
	
	/**
	 * check if the string is an ip address
	 * @param s
	 * @return
	 */
	public static boolean IsIP(String s){
		
		try {
			InetAddress.getByName(s);
			return true;
		} catch (UnknownHostException e) {
			return false;
		}
		
		
	}
	
	/**
	 * check if it is valid uri
	 * @param string
	 * @return true or false
	 */
	public static boolean isURI(String s){
		try {
			URI uri = new URI(s);
			return uri.isAbsolute();
		} catch (URISyntaxException e) {
			return false;
		}
	}
	
	/**
	 * check if the string is a file scheme
	 * @param s
	 * @return true if it is a file scheme, false otherwise
	 */
	public static boolean isFileScheme(String s){
		try {
			URI u = new URI(s);
			//boolean isWeb = "http".equalsIgnoreCase(u.getScheme())
			   // || "https".equalsIgnoreCase(u.getScheme());
			File file = new File(u); 
			return file.exists();
			
			//return !isWeb;
		} catch (URISyntaxException e) {
			return false;
		} catch (IllegalArgumentException e){
			return false;
		}
	}
	/**
	 * check if the string is a file name,beginning with 'file'
	 * @param s
	 * @return true if it is a file name, false otherwise
	 */
	public static boolean isFileName(String s){
		try {
			File file = new File(s); 
			if(s.substring(0, 4).toLowerCase().equals("file")){
				return true;
			}
			return false;
			//return !isWeb;
		} catch (Exception e){
			return false;
		}
	}
	
	/**
	 * get the filesize of a URI file scheme string
	 * @param s 
	 * @return the file size length
	 */
	public static long fileSize(String s){
		try {
			URI u = new URI(s);
			//boolean isWeb = "http".equalsIgnoreCase(u.getScheme())
			   // || "https".equalsIgnoreCase(u.getScheme());
			File file = new File(u); 
			return file.length();
			
			//return !isWeb;
		} catch (URISyntaxException e) {
			return 0;
		}
		
		
	}
	
	/**
	 * all string must pass through this function
	 * @param s string
	 * @return trimmed handled string
	 */
	public static String handleString(String s){
		
		if(s != null){
			String string = s.replace("\\0", "");
			return string.trim();
		}
		else return null;
		
	}
	  /**
		 * get the directory for fetching file to client  
		 * @param String r- uri in argument
		 * @return the directory where the downloaded file is stored
		 */
	public static String getFileName(String f) {
		String fileName = "";
		String fileName2;
		for(int i=(f.length()-1); i>-1; i--) {
			char c = f.charAt(i);
			if(c == '/') {
				break;
				}
			fileName = fileName + c;
			}
			fileName2 = new StringBuilder(fileName).reverse().toString();
			return fileName2;
		}
	
	public static void createFile (Class c,String path1, String path2){
		
		
		try {
			
			InputStream in= c.getResourceAsStream(path1);
			if(in == null){
				System.out.println("fail to read path");
			}
		
			OutputStream out =
			        new FileOutputStream(path2);
			
			int read = 0 ; 
			byte[] bytes = new byte[1024];
			while ((read = in.read(bytes)) != -1) {
				out.write(bytes, 0, read);
			}
			
			if( in != null){
				in.close();
			}
			
			if(out != null){
				out.close();
			}
			
			
		} catch (FileNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

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

}