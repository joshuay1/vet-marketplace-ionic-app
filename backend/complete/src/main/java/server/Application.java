package server;
import java.util.Arrays;
import java.io.FileInputStream;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import java.io.FileNotFoundException;
import java.io.IOException;

import com.google.firebase.*;
import com.google.firebase.auth.FirebaseCredentials;

@SpringBootApplication
public class Application {
    private static final String DATABASE_URL = "https://vetquoll-c22f9.firebaseio.com/";
    public static void main(String[] args) {
        try {
            // [START initialize]
            FirebaseOptions options = null;
            FileInputStream serviceAccount = new FileInputStream("service-account.json");
            try{
                options = new FirebaseOptions.Builder()
                    .setCredential(FirebaseCredentials.fromCertificate(serviceAccount))
                    .setDatabaseUrl(DATABASE_URL)
                    .build();
            }
            catch (IOException e){
                System.out.println("ERROR: invalid service account credentials. See README.");
                System.out.println(e.getMessage());
    
                System.exit(1);    

            }
            FirebaseApp.initializeApp(options);
            // [END initialize]*/
            
        } catch (FileNotFoundException e) {
            System.out.println("ERROR: invalid service account credentials. See README.");
            System.out.println(e.getMessage());

            System.exit(1);
        }
        SpringApplication.run(Application.class, args);
        
    }

    @Bean
    public CommandLineRunner commandLineRunner(ApplicationContext ctx) {
        return args -> {

            System.out.println("Let's inspect the beans provided by Spring Boot:");

            String[] beanNames = ctx.getBeanDefinitionNames();
            Arrays.sort(beanNames);
            for (String beanName : beanNames) {
                System.out.println(beanName);
            }

        };
    }

}
