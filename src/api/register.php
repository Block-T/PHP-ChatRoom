<?php
header('Content-Type: application/json');

function is_valid_username($username) {
    return preg_match('/^[^<]{3,50}$/', $username);
}

function is_valid_password($password) {
    return preg_match('/^[^<]{6,30}$/', $password);
}

function is_valid_avatar($avatar) {
    return $avatar['size'] <= 500 * 1024;
}

$users_file = '../../chatdata/users.json';
$avatars_dir = '../../chatdata/avatars_dir/';

if (!file_exists($users_file)) {
    file_put_contents($users_file, json_encode([]));
}

$users = json_decode(file_get_contents($users_file), true);

$username = $_POST['username'];
$password = $_POST['password'];
$avatar = $_FILES['avatar'];

if (!is_valid_username($username)) {
    echo json_encode(['success' => false, 'message' => '用户名格式不正确']);
    exit;
}

if (!is_valid_password($password)) {
    echo json_encode(['success' => false, 'message' => '密码格式不正确']);
    exit;
}

if (isset($avatar) && !is_valid_avatar($avatar)) {
    echo json_encode(['success' => false, 'message' => '头像文件大小必须小于500KB']);
    exit;
}

if (isset($users[$username])) {
    echo json_encode(['success' => false, 'message' => '用户名已被使用']);
    exit;
}

$avatar_path = '';
if (isset($avatar) && $avatar['size'] > 0) {
    $avatar_path = $avatars_dir . basename($avatar['name']);
    move_uploaded_file($avatar['tmp_name'], $avatar_path);
}

$users[$username] = [
    'password' => password_hash($password, PASSWORD_DEFAULT),
    'avatar' => $avatar_path,
];

file_put_contents($users_file, json_encode($users));

echo json_encode(['success' => true, 'avatar' => $avatar_path]);
?>
