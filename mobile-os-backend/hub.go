package main

import (
	"log"
	"sync"
)

type Hub struct {
	// Registered clients mapped by Virtual Number
	clients map[string]*Client

	// Inbound messages from the clients.
	broadcast chan *Message

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	mu sync.Mutex
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan *Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[string]*Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			// Evitamos registrar si no tiene número virtual asignado todavía
			if client.phoneNumber != "" {
				// Revisar si ya hay alguien conectado con ese número
				if _, ok := h.clients[client.phoneNumber]; ok {
					// El número ya está en uso
					log.Printf("❌ Intento de registro denegado (En uso): %s", client.phoneNumber)
					// Informar al cliente que hay error (evitamos usar el send channel si podemos mandar directo, pero readPump/writePump usan send)
					client.send <- &Message{
						Type: "error",
						Payload: "El Número Virtual ya está en uso por otro dispositivo.",
					}
				} else {
					// Registrar exitosamente
					h.clients[client.phoneNumber] = client
					log.Printf("📱 Registrado: %s (Total: %d)", client.phoneNumber, len(h.clients))
					// Informar al cliente de su éxito
					client.send <- &Message{
						Type: "register_success",
						Payload: "Registrado con éxito en la red.",
					}
				}
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.phoneNumber]; ok {
				delete(h.clients, client.phoneNumber)
				close(client.send)
				log.Printf("🔌 Desconectado: %s (Total: %d)", client.phoneNumber, len(h.clients))
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.Lock()
			// Si el mensaje tiene un Target, intentar enviar punto a punto
			if message.TargetNumber != "" {
				if targetClient, ok := h.clients[message.TargetNumber]; ok {
					select {
					case targetClient.send <- message:
						log.Printf("✉️ Mensaje enrutado: %s -> %s", message.SenderNumber, message.TargetNumber)
					default:
						// No se pudo enviar (buffer lleno), desconectar
						close(targetClient.send)
						delete(h.clients, targetClient.phoneNumber)
					}
				} else {
					log.Printf("⚠️ Destino no encontrado en la red: %s", message.TargetNumber)
				}
			}
			h.mu.Unlock()
		}
	}
}
