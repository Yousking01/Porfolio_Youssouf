<?php
use PHPMailer\PHPMailer\PHPMailer;


require_once "PHPMailer/PHPMailer.php";
    require_once "PHPMailer/SMTP.php";
    require_once "PHPMailer/Exception.php";

    $mail = new PHPMailer();

if(isset($_POST['submit'])){
    $name = $_POST['name'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    try{
      //smtp settings
    $mail->isSMTP();
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = "djireyoussouf1999@gmail.com";
    $mail->Password = 'Tenoukan1999';
    
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = '587';

    $mail->setFrom("djireyoussouf1999@gmail.com");
    $mail->addAddress("djireyoussouf1999@gmail.com");

    $mail->isHTML(true);
    $mail->Subject = 'Messge réçu a partir de la page contact de votre portfolio';
    $mail->Body = '<h3>Name: $name <br>Email: $email <br>Message: $message</h3>';
    
    $mail->send();
      
  } catch (Exception $e){
    
  }
}

 
?>