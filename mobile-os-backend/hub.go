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

	// Unregister requests from clients (disconnect).
	unregister chan *Client

	// Deregister: liberar número sin desconectar el socket
	deregister chan *Client

	mu sync.Mutex
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan *Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		deregister: make(chan *Client),
		clients:    make(map[string]*Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if client.isClosed {
				h.mu.Unlock()
				continue
			}
			requested := client.pendingNumber
			client.pendingNumber = "" // Limpiar siempre, haya éxito o no

			if requested != "" {
				if _, ok := h.clients[requested]; ok {
					// Número en uso — NO se toca client.phoneNumber (se preserva el número actual)
					log.Printf("❌ Intento de registro denegado (En uso): %s", requested)
					client.send <- &Message{
						Type:    "error",
						Payload: "El Número Virtual ya está en uso por otro dispositivo.",
					}
				} else {
					// Liberar el número anterior si tenía uno
					if client.phoneNumber != "" {
						delete(h.clients, client.phoneNumber)
					}
					// Solo ahora confirmamos el nuevo número
					client.phoneNumber = requested
					h.clients[client.phoneNumber] = client
					log.Printf("📱 Registrado: %s (Total: %d)", client.phoneNumber, len(h.clients))
					client.send <- &Message{
						Type:    "register_success",
						Payload: "Registrado con éxito en la red.",
					}
				}
			}
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if existingClient, ok := h.clients[client.phoneNumber]; ok {
				if existingClient == client {
					delete(h.clients, client.phoneNumber)
					log.Printf("🔌 Desconectado: %s (Total: %d)", client.phoneNumber, len(h.clients))
				}
			}
			if !client.isClosed {
				client.isClosed = true
				close(client.send)
			}
			h.mu.Unlock()

		case client := <-h.deregister:
			// Liberar número sin cerrar el socket
			h.mu.Lock()
			if existingClient, ok := h.clients[client.phoneNumber]; ok {
				if existingClient == client {
					delete(h.clients, client.phoneNumber)
					log.Printf("🟡 Liberado número: %s (Total: %d)", client.phoneNumber, len(h.clients))
				}
			}
			client.phoneNumber = ""
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
						if !targetClient.isClosed {
							targetClient.isClosed = true
							close(targetClient.send)
						}
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
