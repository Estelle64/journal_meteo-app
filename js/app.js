/**
 * app.js
 * Point d'entrée principal de l'application
 */

/**
 * Initialiser l'application au chargement de la page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌧️ Journal de Pluie - Application démarrée');
    
    // 1. Charger les données du localStorage
    loadData();
    
    // 2. Initialiser l'interface
    updateCurrentDate();
    updateStats();
    updateHistory();
    
    // 3. Initialiser le graphique
    initChart();
    
    // 4. Initialiser les événements UI
    initUIEvents();
    
    // 5. Vérifier les rappels de sauvegarde
    checkBackupReminder();
    
    console.log('✓ Application prête');
});

/**
 * Gestion du rechargement/fermeture de page
 * Avertir l'utilisateur si des données non sauvegardées
 */
window.addEventListener('beforeunload', function(e) {
    // Vérifier si des données ont été ajoutées aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const todayValue = getRainfallForDate(today);
    
    // Si des données existent et pas de sauvegarde récente
    const lastExport = localStorage.getItem('last_export_date');
    if (todayValue > 0 && !lastExport) {
        e.preventDefault();
        e.returnValue = '';
    }
});
