package main

import "time"

type Message struct {
	Type         string      `json:"type"`         // "register", "chat", "signal"
	SenderNumber string      `json:"senderNumber"` // Ej: "0414-123-4567"
	TargetNumber string      `json:"targetNumber"` // Ej: "0412-987-6543"
	Payload      interface{} `json:"payload"`      // Contenido (texto, SDP de PeerJS, etc)
	Timestamp    time.Time   `json:"timestamp"`
}
