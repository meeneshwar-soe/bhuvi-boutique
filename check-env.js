   require('dotenv').config();
   console.log("--- CHECKING ENV ---");
   console.log("HOST:", process.env.SMTP_HOST);
   console.log("USER:", process.env.SMTP_USER);
   
   // We only print the first 10 letters of the password for safety
   const pass = process.env.SMTP_PASS || "EMPTY";
   console.log("PASS starts with:", pass.substring(0, 10) + "..."); 
   console.log("--------------------");