/**
 * app.js
 * Point d'entrée principal de l'application
 */

/**
 * Initialiser l'application au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌦️ Journal Météo - Application démarrée');
    
    // 1. Charger les données du localStorage
    loadData();
    
    // 2. Initialiser l'interface
    // updateCurrentDate(); // No longer needed, as date inputs are handled by fillTodaysInputs()
    updateStats();
    
    // 3. Initialiser les graphiques
    initChart();
    initTemperatureCharts();
    initWattChart(); // Initialiser le graphique de watts
    
    // 4. Initialiser les événements UI
    initUIEvents();
    
    // 5. Vérifier les rappels de sauvegarde
    checkBackupReminder();
    
    console.log('✓ Application prête');
});

/**
 * Changer d'onglet principal
 * @param {string} tabName - 'rain', 'temp', 'watt', ou 'comment'
 */
function switchMainTab(tabName) {
    // Gérer les onglets
    document.querySelectorAll('.main-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.main-tab[onclick="switchMainTab('${tabName}')"]`).classList.add('active');

    // Gérer le contenu
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Content').classList.add('active');

    // Mettre à jour les graphiques ou l'historique spécifiques à l'onglet actif
    if (tabName === 'rain') {
        fillTodaysInputs(); // Ensure inputs for rain tab are up-to-date
        updateChart();
        updateHistory();
    } else if (tabName === 'temp') {
        fillTodaysInputs(); // Ensure inputs for temp tab are up-to-date
        updateTemperatureCharts();
    } else if (tabName === 'watt') {
        fillTodaysInputs(); // Ensure inputs for watt tab are up-to-date
        updateWattChart();
        updateWattHistory();
    } else if (tabName === 'comment') {
        fillTodaysInputs(); // Ensure inputs for comment tab are up-to-date
        updateCommentHistory();
    }
}

/**
 * Enregistrer les données de température pour aujourd'hui
 */
function saveTemperature() {
    const morningInput = document.getElementById('tempMorningInput');
    const afternoonInput = document.getElementById('tempAfternoonInput');
    const tempDateInput = document.getElementById('tempDateInput');
    if (!morningInput || !afternoonInput || !tempDateInput) return;

    const morningTemp = morningInput.value !== '' ? parseFloat(morningInput.value) : null;
    const afternoonTemp = afternoonInput.value !== '' ? parseFloat(afternoonInput.value) : null;
    const date = tempDateInput.value; // Get date from input

    if (!date) {
        showNotification('Veuillez sélectionner une date', 'warning');
        return;
    }

    setTemperatureForDate(date, morningTemp, afternoonTemp);
    
    updateTemperatureCharts();
    
    showNotification(`🌡️ Températures (${date}) enregistrées !`, 'success');
}

/**
 * Enregistrer les données de watts pour une date
 */
function saveWatt() {
    const wattInput = document.getElementById('wattInput');
    const wattDateInput = document.getElementById('wattDateInput');
    if (!wattInput || !wattDateInput) return;

    const value = parseFloat(wattInput.value);
    const date = wattDateInput.value;

    if (isNaN(value) || value < 0) {
        showNotification('Veuillez entrer une valeur valide pour les watts', 'warning');
        return;
    }
    if (!date) {
        showNotification('Veuillez sélectionner une date pour les watts', 'warning');
        return;
    }

    setWattForDate(date, value);

    showNotification(`⚡ Watts (${date}) enregistrés !`, 'success');
    wattInput.value = value;
    
    updateWattChart();
    updateWattHistory();
}

/**
 * Gestion du rechargement/fermeture de page
 * Avertir l'utilisateur si des données non sauvegardées
 */
window.addEventListener('beforeunload', function(e) {
    const today = new Date().toISOString().split('T')[0];
    const todayRain = getRainfallForDate(today);
    const todayTemp = getTemperatureForDate(today);
    const todayWatt = getWattForDate(today);
    const todayComment = getCommentForDate(today);
    const hasTodayData = todayRain > 0 || todayTemp.morning !== null || todayTemp.afternoon !== null || todayWatt > 0 || todayComment !== '';
    
    const lastExport = localStorage.getItem('last_export_date');
    if (hasTodayData && !lastExport) {
        e.preventDefault();
        e.returnValue = '';
    }
});
