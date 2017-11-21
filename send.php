<?php
//Import the PHPMailer class into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
require 'src/PHPMailer.php';
require 'src/Exception.php';

if($_POST){
    $msg = '';
    $mail = new PHPMailer;

    $uploadfile = $_POST['img'];

    $mail->setFrom('from@example.com', 'First Last');
    $mail->addAddress('coworking.shostka@gmail.com', 'Коворкинг Шостка');

    $mail->isHTML(true);

    $mail->Subject = $_POST['name'];
    $mail->Body = "Name: {$_POST['name']}<br> Work: {$_POST['work']}";
    $mail-> AddStringAttachment($_POST['img'], 'Image.png', 'base64', 'image/png');
    if (!$mail->send()) {
        $msg .= "Mailer Error: " . $mail->ErrorInfo;
        $answer = '1';
    } else {
        $msg .= "Message sent!";
        $answer = '0';
    }
    die( $msg );
}
?>

