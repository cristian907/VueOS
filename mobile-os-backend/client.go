package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 5242880 // Aumentado a 5MB para soportar fotos Base64
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Evitar problemas de CORS al desarrollar con Vite en local
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	hub         *Hub
	conn        *websocket.Conn
	send        chan *Message
	phoneNumber string // Número confirmado por el hub
	pendingNumber string // Número solicitado, aún no confirmado
	isClosed    bool
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, rawMsg, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var msg Message
		err = json.Unmarshal(rawMsg, &msg)
		if err != nil {
			log.Printf("JSON Unmarshal error: %v", err)
			continue
		}

		// Si es un mensaje de registro, guardar el número SOLICITADO en pending (no confirmar aún)
		if msg.Type == "register" && msg.SenderNumber != "" {
			c.pendingNumber = msg.SenderNumber // Solo pendiente hasta que el hub lo confirme
			c.hub.register <- c
			continue
		}

		// deregister ya no es necesario con el nuevo flujo, pero lo mantenemos por compatibilidad
		if msg.Type == "deregister" {
			c.hub.deregister <- c
			continue
		}

		// Si ya está registrado, enviar el mensaje al Hub para rutearlo a su destino
		if c.phoneNumber != "" {
			// Forzar el sender al número real de este cliente por seguridad
			msg.SenderNumber = c.phoneNumber 
			msg.Timestamp = time.Now()
			c.hub.broadcast <- &msg
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteJSON(message); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan *Message, 256)}

	// No lo registramos en el Hub automáticamente.
	// Debe enviar su número virtual en un mensaje de "register".
	
	// Correr rutinas concurrentes para I/O
	go client.writePump()
	go client.readPump()
}
