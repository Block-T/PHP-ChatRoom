<?php
header('Content-Type: application/json');

$messages_file = '../../chatdata/messages.json';

if (!file_exists($messages_file)) {
    echo json_encode([]);
    exit;
}

$messages = json_decode(file_get_contents($messages_file), true);

echo json_encode($messages);
?>