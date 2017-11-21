<?php
//Import the PHPMailer class into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
require 'src/PHPMailer.php';
require 'src/Exception.php';

if($_POST){
    $msg = '';
    $mail = new PHPMailer;

    $image_data = $_POST['img'];
    //$uploadfile = substr($image_data, strpos($image_data, ","));
    $uploadfile = str_replace(" ", "+", substr($image_data, strpos($image_data, ",")+1));
    //$uploadfile = str_replace(' ','+',$image_data);
    //$uploadfile2 = base64_decode($uploadfile);

//  $fp = fopen('test.png', 'w');
//  fwrite($fp, $uploadfile);
//  fclose($fp);

    $mail->setFrom('info@ipanel.com', 'PixelDrawer');
    $mail->addAddress('mozokevgen@gmail.com', 'Коворкинг Шостка');

    $mail->isHTML(true);

    $mail->Subject = $_POST['name'];
    $mail->Body = "Name: {$_POST['name']}<br> Work: {$_POST['work']} <br> $uploadfile";
    //$mail-> AddStringAttachment($uploadfile, 'Image.png');
    // addStringEmbeddedImage
    // data from url?
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

