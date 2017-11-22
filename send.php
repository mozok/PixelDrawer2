<?php
//Import the PHPMailer class into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
require 'src/PHPMailer.php';
require 'src/Exception.php';

if($_POST){
    $msg = '';
    $mail = new PHPMailer;

    if(array_key_exists('name', $_POST))
    {
        $name = $_POST['name'];
    }
    else {
        $name = 'Unknown';
    }

    if(array_key_exists('work', $_POST))
    {
        $work = $_POST['work'];
    }
    else {
        $work = 'Unknown';
    }

    if(array_key_exists('contact', $_POST))
    {
        $contact = $_POST['contact'];
    }
    else {
        $contact = 'Unknown';
    }

    if(array_key_exists('imgData', $_POST))
    {
        $imgDataMCU = $_POST['imgData'];
    }
    else {
        $imgDataMCU = 'Blank';
    }
    

    $mail->setFrom('info@ipanel.com', 'PixelDrawer');
    $mail->addAddress('coworking.shostka@gmail.com', 'Коворкинг Шостка');

    $mail->isHTML(true);

    $mail->Subject = $name;
    $mail->Body = "Name: $name <br> Work: $work <br> Contact: $contact <br> Img Data for MCU: $imgDataMCU";
    
    if(array_key_exists('img', $_POST))
    {
    $image_data = $_POST['img'];
    $image_data = str_replace('data:image/png;base64,', '', $image_data);
    $image_data = str_replace(' ', '+', $image_data);
    $data = base64_decode($image_data);
    $filename = 'image.png';
    file_put_contents($filename, $data);
    $mail->addAttachment($filename, 'MyImage');
    }   

    if (!$mail->send()) {
        // $msg .= "Mailer Error: " . $mail->ErrorInfo;
        $answer = '0';
    } else {
        // $msg .= "Message sent!";
        $answer = '1';
    }
    die( $answer );
}
?>

