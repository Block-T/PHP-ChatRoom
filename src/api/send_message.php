<?php
header('Content-Type: application/json');

function is_valid_message($text) {
    return !empty(trim($text)) && strlen($text) <= 120;
}

$users_file = '../../chatdata/users.json';
$messages_file = '../../chatdata/messages.json';

if (!file_exists($users_file) || !file_exists($messages_file)) {
    echo json_encode(['success' => false, 'message' => '服务器错误']);
    exit;
}

// 读取用户数据
$users = json_decode(file_get_contents($users_file), true);
$messages = json_decode(file_get_contents($messages_file), true);

// 读取输入数据
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'];
$password = $input['password'];
$text = $input['text'];

if (!isset($users[$username]) || !password_verify($password, $users[$username]['password'])) {
    echo json_encode(['success' => false, 'message' => '用户名或密码错误']);
    exit;
}
if (!is_valid_message($text)) {
    echo json_encode(['success' => false, 'message' => '消息内容不合法']);
    exit;
}


$user_avatar = $users[$username]['avatar'] ?? null; // 使用 null 合并运算符确保如果用户没有头像，avatar 不会是 undefined


$avatar = $user_avatar ?: 'chatdata/icon/UserIcon.jpeg'; // 替换 'default_avatar_url' 为你的默认头像URL

$message = [
    'username' => $username,
    'text' => $text,
    'time' => date('Y-m-d H:i:s'),
    'avatar' => $avatar
];

$messages[] = $message;
file_put_contents($messages_file, json_encode($messages));

echo json_encode(['success' => true]);
?>
