package server;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseCredentials;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URISyntaxException;
import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FireBaseConfig{


    @Value("https://vetquoll-c22f9.firebaseio.com/")
    private String databaseUrl;

    @Value("/service-account.json")
    private String configPath;




    @PostConstruct
    public void init(){

        FileInputStream serviceAccount = null;
        try{
            File file = new File(this.getClass().getResource(configPath).toURI());
            serviceAccount = new FileInputStream(file);
        }catch(FileNotFoundException e){
            e.printStackTrace();
        }catch(URISyntaxException e){
            e.printStackTrace();
        }

        try{
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredential(FirebaseCredentials.fromCertificate(serviceAccount))
                    .setDatabaseUrl(databaseUrl)
                    .build();
            FirebaseApp.initializeApp(options);

        }catch(IOException e){
            e.printStackTrace();
        }
    }
}