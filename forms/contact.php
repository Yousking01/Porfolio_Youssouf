<?php
if(isset($_POST['submit'])){
    // Get the data entered in the form
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    // Build the message to send
    $to = "djireyoussouf1999@gmail.com";
    $subject = "New contact message";
    $headers = "From: ".$name." <".$email.">\r\n"."Reply-To: ".$email."\r\n"."X-Mailer: PHP/".phpversion();
    $body = "Name: ".$name."\r\n"."Email: ".$email."\r\n"."Message: ".$message;

    // Send the message
    if(mail($to, $subject, $body, $headers)){
        echo "<p>Your message has been sent.</p>";
    }else{
        echo "<p>An error occurred while sending the message. Please try again later.</p>";
    }
}
?>