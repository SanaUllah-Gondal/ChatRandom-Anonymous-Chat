<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  $conn = new PDO("mysql:host=localhost;dbname=chat", "user", "pass");
  $stmt = $conn->prepare("INSERT INTO reports (reported_id, reason) VALUES (?, ?)");
  $stmt->execute([$data['peerId'], $data['reason']]);
  echo json_encode(['status' => 'success']);
}