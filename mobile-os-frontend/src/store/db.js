import Dexie from 'dexie'

export const db = new Dexie('MobileOSDatabase')

// Declaramos las tablas y las claves por las que queremos buscar
db.version(1).stores({
  photos: '++id, date', // 'id' autoincremental, indexamos por fecha
  notes: '++id, title, date' // 'id' autoincremental, indexamos por título y fecha
})
