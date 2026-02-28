import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// Simple in-memory lock/queue to prevent concurrent writes to the same file
const locks = new Map();
// In-memory cache for JSON data
const cache = new Map();

async function acquireLock(fileName) {
    while (locks.get(fileName)) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    locks.set(fileName, true);
}

function releaseLock(fileName) {
    locks.delete(fileName);
}

/**
 * Reads JSON from a file with in-memory caching.
 * @param {string} fileName - name of the file (e.g., 'habits.json')
 * @returns {Promise<Array|Object>} - parsed JSON data
 */
export async function readJSON(fileName) {
    // Return cached data if available
    if (cache.has(fileName)) {
        return JSON.parse(JSON.stringify(cache.get(fileName))); // Return deep copy
    }

    const filePath = path.join(DATA_DIR, fileName);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(data);
        cache.set(fileName, parsed);
        return JSON.parse(JSON.stringify(parsed));
    } catch (error) {
        if (error.code === 'ENOENT') {
            cache.set(fileName, []);
            return [];
        }
        throw error;
    }
}

/**
 * Writes data to a JSON file atomically and updates the cache.
 * @param {string} fileName - name of the file
 * @param {Array|Object} data - data to write
 */
export async function writeJSON(fileName, data) {
    const filePath = path.join(DATA_DIR, fileName);
    const tempPath = `${filePath}.tmp`;

    await acquireLock(fileName);
    try {
        const jsonString = JSON.stringify(data, null, 2);
        // Update cache
        cache.set(fileName, JSON.parse(jsonString));

        // Write to temp file
        await fs.writeFile(tempPath, jsonString, 'utf8');
        // Rename temp file to actual file (atomic rename)
        await fs.rename(tempPath, filePath);
    } finally {
        releaseLock(fileName);
    }
}
