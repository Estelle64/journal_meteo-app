/**
 * idb.js
 * IndexedDB wrapper for weather data storage.
 */

const DB_NAME = 'WeatherJournalDB';
const DB_VERSION = 1;
const STORE_NAME = 'weatherData';

let db;

/**
 * Opens the IndexedDB database and creates the object store if needed.
 * @returns {Promise<IDBDatabase>}
 */
function openWeatherDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject('Error opening IndexedDB.');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Retrieves the weather data object from IndexedDB.
 * @returns {Promise<object>}
 */
async function getWeatherDataFromDB() {
    const db = await openWeatherDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('main'); // We'll store all data under a single key 'main'

        request.onerror = (event) => {
            console.error('Error fetching data from IndexedDB:', event.target.error);
            reject('Error fetching data.');
        };

        request.onsuccess = (event) => {
            // If data exists, return it, otherwise return a default structure
            resolve(event.target.result ? event.target.result.data : {
                rainfall: {},
                temperature: {},
                comments: {},
                watts: {}
            });
        };
    });
}

/**
 * Saves the weather data object to IndexedDB.
 * @param {object} data The complete weatherData object.
 * @returns {Promise<void>}
 */
async function setWeatherDataInDB(data) {
    const db = await openWeatherDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // We use a fixed key 'main' to store our single data object
        const request = store.put({ id: 'main', data: data });

        request.onerror = (event) => {
            console.error('Error saving data to IndexedDB:', event.target.error);
            reject('Error saving data.');
        };

        request.onsuccess = () => {
            resolve();
        };
    });
}
