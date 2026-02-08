/**
 * temperature.js
 * Gestion des graphiques de température avec Chart.js
 */

let tempMorningChart = null;
let tempAfternoonChart = null;

/**
 * Initialiser les graphiques de température
 */
function initTemperatureCharts() {
    const morningCtx = document.getElementById('tempMorningChart');
    const afternoonCtx = document.getElementById('tempAfternoonChart');
    if (!morningCtx || !afternoonCtx) return;

    const chartOptions = {
        type: 'line',
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
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(184, 220, 232, 0.3)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.4 // Makes the line smoother
                }
            }
        }
    };

    tempMorningChart = new Chart(morningCtx.getContext('2d'), {
        ...chartOptions,
        data: {
            labels: [],
            datasets: [{
                label: 'Température Matin (°C)',
                data: [],
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 2,
                fill: true
            }]
        }
    });

    tempAfternoonChart = new Chart(afternoonCtx.getContext('2d'), {
        ...chartOptions,
        data: {
            labels: [],
            datasets: [{
                label: 'Température Après-midi (°C)',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: true
            }]
        }
    });

    updateTemperatureCharts();
}

let currentTemperatureChartPeriod = 'month';

/**
 * Changer de période de graphique température
 * @param {string} period - 'month' ou 'year'
 */
function switchTemperatureChart(period) {
    currentTemperatureChartPeriod = period;
    
    // Mettre à jour les onglets actifs (dans le contexte du graphique température)
    const tabsContainer = event.target.closest('.tabs');
    if (tabsContainer) {
        tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
    }
    event.target.classList.add('active');
    
    updateTemperatureCharts(period);
}

/**
 * Mettre à jour les graphiques de température
 * @param {string} period - 'month' ou 'year'
 */
function updateTemperatureCharts(period = 'month') {
    if (!tempMorningChart || !tempAfternoonChart) return;

    const now = new Date();
    let labels = [];
    let morningData = [];
    let afternoonData = [];

    if (period === 'month') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(now.getFullYear(), now.getMonth(), i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(i.toString());
            
            const tempData = getTemperatureForDate(dateStr); 
            morningData.push(tempData.morning);
            afternoonData.push(tempData.afternoon);
        }
    } else { // period === 'year'
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        for (let i = 0; i < 12; i++) {
            labels.push(months[i]);
            
            const monthStart = new Date(now.getFullYear(), i, 1);
            const monthEnd = new Date(now.getFullYear(), i + 1, 0);
            const monthData = getTemperatureDataForPeriod(monthStart, monthEnd); // Needs a new function in storage.js
            
            morningData.push(monthData.morningAvg); // Needs to calculate average
            afternoonData.push(monthData.afternoonAvg); // Needs to calculate average
        }
    }

    // Mettre à jour le graphique du matin
    tempMorningChart.data.labels = labels;
    tempMorningChart.data.datasets[0].data = morningData;
    tempMorningChart.update();

    // Mettre à jour le graphique de l'après-midi
    tempAfternoonChart.data.labels = labels;
    tempAfternoonChart.data.datasets[0].data = afternoonData;
    tempAfternoonChart.update();
}
