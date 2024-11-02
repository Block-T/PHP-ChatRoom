<?php
header('Content-Type: application/json');

function is_valid_username($username) {
    return isset($username) && preg_match('/^[^<]{3,50}$/', $username);
}

function is_valid_password($password) {
    return isset($password) && preg_match('/^[^<]{6,30}$/', $password);
}

$users_file = '../../chatdata/users.json';

if (!file_exists($users_file)) {
    echo json_encode(['success' => false, 'message' => '服务器错误']);
    exit;
}

$users = json_decode(file_get_contents($users_file), true);

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? null;
$password = $input['password'] ?? null;

if (!is_valid_username($username) || !is_valid_password($password)) {
    echo json_encode(['success' => false, 'message' => '用户名或密码格式不正确']);
    exit;
}

if (!isset($users[$username]) || !password_verify($password, $users[$username]['password'])) {
    echo json_encode(['success' => false, 'message' => '用户名或密码错误']);
    exit;
}

echo json_encode(['success' => true, 'avatar' => $users[$username]['avatar']]);
?>
