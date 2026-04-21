import Dexie from 'dexie'

export const db = new Dexie('MobileOSDatabase')

// Declaramos las tablas y las claves por las que queremos buscar
db.version(2).stores({
  photos: '++id, date', // 'id' autoincremental, indexamos por fecha
  notes: '++id, title, date', // 'id' autoincremental, indexamos por título y fecha
  messages: '++id, chatWith, sender, date' // 'chatWith' agrupa la conversación
})

// v3: no se cambia el schema, pero aceptamos el campo 'blob' en messages
// v4: Agregamos alarmas y eventos
db.version(4).stores({
  photos: '++id, date',
  notes: '++id, title, date',
  messages: '++id, chatWith, sender, date',
  alarms: '++id, time, enabled',
  events: '++id, date, title'
})
