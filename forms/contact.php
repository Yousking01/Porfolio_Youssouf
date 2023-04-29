<?php
//get data from form  
$name = $_POST['name'];
$email= $_POST['email'];
// $subject= $_POST['subject'];
$message= $_POST['message'];
$to = "djireyoussouf1999@gmail.com";
$subject = "Mail From website";
$txt ="Name = ". $name . "\r\n  Email = " . $email . "\r\n Message =" . $message;
$headers = "From: noreply@yoursite.com";
if($email!=NULL){
    mail($to,$subject,$txt,$headers);
}
//redirect
// header("Location:thankyou.html");
?>