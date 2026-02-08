/**
 * storage.js
 * Gestion du stockage des données météo.
 * Utilise IndexedDB pour les données principales et localStorage pour les indicateurs simples.
 */

// Clé pour l'ancien système de localStorage, utilisée pour la migration
const LEGACY_STORAGE_KEY = 'weather_data';

// --- Données en mémoire ---
let weatherData = {
    rainfall: {},
    temperature: {},
    comments: {},
    watts: {}
};

/**
 * Charge les données depuis IndexedDB.
 * Gère une migration unique depuis localStorage si nécessaire.
 */
async function loadData() {
    try {
        // Essayer de charger depuis IndexedDB
        const idbData = await getWeatherDataFromDB();
        
        // Vérifier si des données existent dans l'ancien localStorage pour la migration
        const legacyDataRaw = localStorage.getItem(LEGACY_STORAGE_KEY);

        if (legacyDataRaw) {
            console.log('Données héritées trouvées dans localStorage. Migration vers IndexedDB...');
            const legacyData = JSON.parse(legacyDataRaw);
            
            // Fusionner les données (priorité aux données de localStorage en cas de conflit rare)
            const mergedData = {
                rainfall: { ...idbData.rainfall, ...legacyData.rainfall },
                temperature: { ...idbData.temperature, ...legacyData.temperature },
                comments: { ...idbData.comments, ...legacyData.comments },
                watts: { ...idbData.watts, ...legacyData.watts }
            };
            
            weatherData = mergedData;
            await setWeatherDataInDB(weatherData); // Sauvegarder les données fusionnées dans IndexedDB
            
            // Nettoyer l'ancien localStorage
            localStorage.removeItem(LEGACY_STORAGE_KEY);
            console.log('Migration terminée et ancien localStorage nettoyé.');
        } else {
            // Si pas de migration, utiliser simplement les données d'IndexedDB
            weatherData = idbData;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données depuis IndexedDB:', error);
        // En cas d'erreur, on part d'un état vide pour éviter de planter l'app
        weatherData = { rainfall: {}, temperature: {}, comments: {}, watts: {} };
    }
}


/**
 * Sauvegarde les données en mémoire dans IndexedDB.
 */
async function saveData() {
    try {
        await setWeatherDataInDB(weatherData);
        // Conserver la date de sauvegarde dans localStorage pour un accès simple et rapide
        localStorage.setItem('last_backup_date', new Date().toISOString());
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans IndexedDB:', error);
        showNotification('❌ Erreur lors de la sauvegarde', 'warning');
    }
}

// --- Fonctions Pluie ---

function getRainfallForDate(date) {
    return weatherData.rainfall[date] || 0;
}

function setRainfallForDate(date, value) {
    weatherData.rainfall[date] = value;
    saveData();
}

function getAllRainfallDates(ascending = false) {
    const dates = Object.keys(weatherData.rainfall).sort();
    return ascending ? dates : dates.reverse();
}

function getTotalRainfallForPeriod(startDate, endDate) {
    let total = 0;
    Object.keys(weatherData.rainfall).forEach(dateStr => {
        const date = new Date(dateStr);
        if (date >= startDate && date <= endDate) {
            total += weatherData.rainfall[dateStr];
        }
    });
    return total;
}

// --- Fonctions Température ---

function getTemperatureForDate(date) {
    return weatherData.temperature[date] || { morning: null, afternoon: null };
}

function setTemperatureForDate(date, morning, afternoon) {
    weatherData.temperature[date] = { morning, afternoon };
    saveData();
}

// --- Fonctions Commentaires ---

function getCommentForDate(date) {
    return weatherData.comments[date] || '';
}

function setCommentForDate(date, comment) {
    if (comment.trim() === '') {
        delete weatherData.comments[date];
    } else {
        weatherData.comments[date] = comment;
    }
    saveData();
}

function getAllCommentDates(ascending = false) {
    const dates = Object.keys(weatherData.comments).sort();
    return ascending ? dates : dates.reverse();
}

// --- Fonctions Watts ---

function getWattForDate(date) {
    return weatherData.watts[date] || 0;
}

function setWattForDate(date, value) {
    weatherData.watts[date] = value;
    saveData();
}

function getAllWattDates(ascending = false) {
    const dates = Object.keys(weatherData.watts).sort();
    return ascending ? dates : dates.reverse();
}

function getTotalWattForPeriod(startDate, endDate) {
    let total = 0;
    Object.keys(weatherData.watts).forEach(dateStr => {
        const date = new Date(dateStr);
        if (date >= startDate && date <= endDate) {
            total += weatherData.watts[dateStr];
        }
    });
    return total;
}

// --- Fonctions communes d'import/export ---

/**
 * Exporter toutes les données en JSON
 */
async function exportData() {
    try {
        const dataToExport = await getWeatherDataFromDB(); // Obtenir les données fraîches
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meteo-donnees-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        localStorage.setItem('last_export_date', new Date().toISOString());
        updateLastBackupDisplay();
        showNotification('✓ Données exportées avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        showNotification('❌ Erreur lors de l\'export', 'warning');
    }
}

/**
 * Importer des données depuis un fichier JSON
 */
async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (typeof imported !== 'object' || imported === null) {
                throw new Error('Format invalide');
            }
            
            // Fusionner les données importées avec les données existantes en mémoire
            if (imported.rainfall) {
                weatherData.rainfall = { ...weatherData.rainfall, ...imported.rainfall };
            }
            if (imported.temperature) {
                weatherData.temperature = { ...weatherData.temperature, ...imported.temperature };
            }
            if (imported.comments) {
                weatherData.comments = { ...weatherData.comments, ...imported.comments };
            }
            if (imported.watts) {
                weatherData.watts = { ...weatherData.watts, ...imported.watts };
            }

            await saveData(); // Sauvegarder les données fusionnées dans IndexedDB
            
            // Rafraîchir toute l'interface
            updateStats();
            updateHistory();
            updateChart();
            updateTemperatureCharts();
            updateWattChart();
            updateWattHistory();
            updateCommentHistory();
            fillTodaysInputs();

            showNotification('✓ Données importées avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            showNotification('❌ Erreur lors de l\'importation. Vérifiez le fichier.', 'warning');
        }
    };
    
    reader.onerror = function() {
        showNotification('❌ Impossible de lire le fichier', 'warning');
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

/**
 * Vérifier et afficher la dernière date de sauvegarde
 */
function updateLastBackupDisplay() {
    const lastExport = localStorage.getItem('last_export_date');
    const backupElement = document.getElementById('lastBackup');
    
    if (lastExport && backupElement) {
        const date = new Date(lastExport);
        const formatted = date.toLocaleDateString('fr-FR');
        backupElement.textContent = formatted;
    }
}

/**
 * Vérifier si un rappel de sauvegarde est nécessaire
 */
function checkBackupReminder() {
    updateLastBackupDisplay();
    
    const lastExport = localStorage.getItem('last_export_date');
    const hasData = Object.keys(weatherData.rainfall).length > 0 || Object.keys(weatherData.temperature).length > 0 || Object.keys(weatherData.comments).length > 0 || Object.keys(weatherData.watts).length > 0;

    if (!lastExport && hasData) {
        setTimeout(() => {
            showNotification('💡 N\'oubliez pas de sauvegarder vos données !', 'warning');
        }, 2000);
        return;
    }

    if (lastExport) {
        const daysSinceBackup = (Date.now() - new Date(lastExport)) / (1000 * 60 * 60 * 24);
        if (daysSinceBackup > 30) {
            setTimeout(() => {
                showNotification('⚠️ Dernière sauvegarde il y a plus d\'un mois !', 'warning');
            }, 2000);
        }
    }
}