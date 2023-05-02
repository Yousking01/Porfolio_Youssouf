<?php
      //Si le formulaire a étét soumis
      if (isset($_POST["message"])) {
        $message = "Ce message vous a été envoyé via la page contact de votre portfolio
        Name : " . $_POST["name"] . "
        Email : " . $_POST["email"] . "
        Subject : " . $_POST["subject"] . "
        Message : " . $_POST["message"];

        $retour = mail("djireyoussouf1999@gmail.com", $_POST["name"],
        $message, "Reply-to:" . $_POST["email"], $_POST["subject"]);
        if($retour) {
          echo "<p>L'email a bien été envoyé.</p>";
        }
      }
    ?>