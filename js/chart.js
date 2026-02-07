/**
 * chart.js
 * Gestion des graphiques avec Chart.js
 */

let chart = null;
let currentChartPeriod = 'month';

/**
 * Initialiser le graphique
 */
function initChart() {
    console.log('initChart() called.');
    const ctx = document.getElementById('rainfallChart');
    if (!ctx) {
        console.warn('Canvas element with ID "rainfallChart" not found.');
        return;
    }
    console.log('Canvas context found.');
    
    chart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Précipitations (mm)',
                data: [],
                backgroundColor: 'rgba(90, 154, 184, 0.6)',
                borderColor: 'rgba(44, 95, 122, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(184, 220, 232, 0.3)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    updateChart('month');
}

/**
 * Changer de période de graphique
 * @param {string} period - 'month' ou 'year'
 */
function switchChart(period) {
    currentChartPeriod = period;
    
    // Mettre à jour les onglets actifs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // The 'event' object might not be directly available if called without a direct event.
    // Assuming 'this' refers to the clicked tab in an actual event handler.
    // If this is called programmatically, you might need to pass the target element.
    const targetTab = event ? event.target : null;
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    updateChart(period);
}

/**
 * Mettre à jour le graphique
 * @param {string} period - 'month' ou 'year'
 */
function updateChart(period = 'month') {
    console.log('updateChart() called with period:', period);
    if (!chart) {
        console.warn('Chart instance not found when trying to update.');
        return;
    }
    
    const now = new Date();
    let labels = [];
    let data = [];

    if (period === 'month') {
        // Données du mois en cours (par jour)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(now.getFullYear(), now.getMonth(), i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(i.toString());
            data.push(getRainfallForDate(dateStr));
        }
    } else {
        // Données de l'année (par mois)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        for (let i = 0; i < 12; i++) {
            labels.push(months[i]);
            
            const monthStart = new Date(now.getFullYear(), i, 1);
            const monthEnd = new Date(now.getFullYear(), i + 1, 0);
            const monthTotal = getTotalForPeriod(monthStart, monthEnd);
            
            data.push(monthTotal);
        }
    }

    console.log('Chart data for period', period, ': Labels:', labels, 'Data:', data);

    // Mettre à jour les données du graphique
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

/**
 * Obtenir les données pour un graphique personnalisé
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {Object} Objet avec labels et data
 */
function getChartDataForRange(startDate, endDate) {
    const labels = [];
    const data = [];
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
        data.push(getRainfallForDate(dateStr));
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return { labels, data };
}
