/**
 * ui.js
 * Gestion de l'interface utilisateur
 */

/**
 * Afficher la date actuelle sur l'onglet température
 */
function updateCurrentDate() {
  // This function is no longer needed to update currentDateTemp as it's now an input.
  // The input value is set in fillTodaysInputs().
  // Keeping it empty or removing it depends on other uses.
  // For now, let's keep it empty.
}

/**
 * Mettre à jour les statistiques de pluie affichées
 */
function updateStats() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  const todayValue = getRainfallForDate(today);
  const todayElement = document.getElementById("todayValue");
  if (todayElement) todayElement.textContent = todayValue.toFixed(1);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTotal = getTotalRainfallForPeriod(monthStart, now);
  const monthElement = document.getElementById("monthTotal");
  if (monthElement) monthElement.textContent = monthTotal.toFixed(1);

  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearTotal = getTotalRainfallForPeriod(yearStart, now);
  const yearElement = document.getElementById("yearTotal");
  if (yearElement) yearElement.textContent = yearTotal.toFixed(1);
}

/**
 * Mettre à jour l'historique des entrées de pluie
 */
function updateHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  const sortedDates = getAllRainfallDates(false);

  if (sortedDates.length === 0) {
    historyList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                <p>Aucune donnée de pluie enregistrée</p>
            </div>
        `;
    return;
  }

  historyList.innerHTML = sortedDates
    .slice(0, 50)
    .map((date) => {
      const dateObj = new Date(date);
      const formatted = dateObj.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const value = getRainfallForDate(date);

      return `
            <div class="history-item">
                <span class="history-date">${formatted}</span>
                <span class="history-value">${value.toFixed(1)} mm</span>
            </div>
        `;
    })
    .join("");
}

/**
 * Mettre à jour l'historique des entrées de watts
 */
function updateWattHistory() {
  const wattHistoryList = document.getElementById("wattHistoryList");
  if (!wattHistoryList) return;

  const sortedDates = getAllWattDates(false);

  if (sortedDates.length === 0) {
    wattHistoryList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                <p>Aucune donnée de production solaire enregistrée</p>
            </div>
        `;
    return;
  }

  wattHistoryList.innerHTML = sortedDates
    .slice(0, 50)
    .map((date) => {
      const dateObj = new Date(date);
      const formatted = dateObj.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      const value = getWattForDate(date);

      return `
            <div class="history-item">
                <span class="history-date">${formatted}</span>
                <span class="history-value">${value.toFixed(1)} kWh</span>
            </div>
        `;
    })
    .join("");
}

/**
 * Mettre à jour l'historique des commentaires
 */
function updateCommentHistory() {
    const commentHistoryList = document.getElementById('commentHistoryList');
    if (!commentHistoryList) return;
    
    const sortedDates = getAllCommentDates(false);

    if (sortedDates.length === 0) {
        commentHistoryList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                <p>Aucun commentaire enregistré</p>
            </div>
        `;
        return;
    }

    commentHistoryList.innerHTML = sortedDates.slice(0, 50).map(date => {
        const dateObj = new Date(date);
        const formatted = dateObj.toLocaleDateString('fr-FR', {
            weekday: 'short', day: 'numeric', month: 'short'
        });
        const value = getCommentForDate(date);
        
        return `
            <div class="history-item">
                <span class="history-date">${formatted}</span>
                <span class="history-value">${value}</span>
            </div>
        `;
    }).join('');
}


/**
 * Enregistrer une nouvelle mesure de pluie
 */
function saveRainfall() {
  const rainfallInput = document.getElementById("rainfallInput");
  const rainfallDateInput = document.getElementById("rainfallDateInput");
  if (!rainfallInput || !rainfallDateInput) return;

  const value = parseFloat(rainfallInput.value);
  const date = rainfallDateInput.value; // Get date from input

  if (isNaN(value) || value < 0) {
    showNotification("Veuillez entrer une valeur valide", "warning");
    return;
  }
  if (!date) {
    // Check if date is selected
    showNotification("Veuillez sélectionner une date", "warning");
    return;
  }

  setRainfallForDate(date, value); // Use selected date

  showNotification(`✓ Pluie (${date}) enregistrée !`, "success");
  rainfallInput.value = value; // Keep value in input after saving for the day

  updateStats();
  updateHistory();
  updateChart();
}

/**
 * Enregistrer les données de température pour une date
 */
function saveTemperature() {
    const morningInput = document.getElementById('tempMorningInput');
    const afternoonInput = document.getElementById('tempAfternoonInput');
    const tempDateInput = document.getElementById('tempDateInput'); // Get date input
    if (!morningInput || !afternoonInput || !tempDateInput) return;

    const morningTemp = morningInput.value !== '' ? parseFloat(morningInput.value) : null;
    const afternoonTemp = afternoonInput.value !== '' ? parseFloat(afternoonInput.value) : null;
    const date = tempDateInput.value; // Get date from input

    if (!date) {
        showNotification('Veuillez sélectionner une date', 'warning');
        return;
    }

    setTemperatureForDate(date, morningTemp, afternoonTemp); // Use selected date
    
    updateTemperatureCharts();
    
    showNotification(`🌡️ Températures (${date}) enregistrées !`, 'success');
}

/**
 * Enregistrer un commentaire pour une date
 */
function saveNewComment() {
  const commentInput = document.getElementById("newCommentInput");
  const commentDateInput = document.getElementById("commentDateInput");
  if (!commentInput || !commentDateInput) return;

  const comment = commentInput.value;
  const date = commentDateInput.value;

  if (!date) {
    showNotification(
      "Veuillez sélectionner une date pour le commentaire",
      "warning",
    );
    return;
  }

  setCommentForDate(date, comment);
  showNotification(`✓ Commentaire (${date}) enregistré !`, "success");
  updateCommentHistory();
}

/**
 * Afficher une notification temporaire
 */
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideInRight 0.5s ease reverse";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

/**
 * Pré-remplir les champs de saisie avec les données du jour ou de la date sélectionnée
 */
function fillTodaysInputs() {
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];

  // Pluie
  const rainfallInput = document.getElementById("rainfallInput");
  const rainfallDateInput = document.getElementById("rainfallDateInput");
  if (rainfallInput && rainfallDateInput) {
    if (!rainfallDateInput.value) {
      rainfallDateInput.value = todayISO;
    }
    const selectedDate = rainfallDateInput.value;
    const rainValue = getRainfallForDate(selectedDate);
    rainfallInput.value = rainValue > 0 ? rainValue : "";
  }

  // Température
  const tempMorningInput = document.getElementById("tempMorningInput");
  const tempAfternoonInput = document.getElementById("tempAfternoonInput");
  const tempDateInput = document.getElementById("tempDateInput"); 
  if (tempMorningInput && tempAfternoonInput && tempDateInput) {
    if (!tempDateInput.value) {
        tempDateInput.value = todayISO;
    }
    const selectedDate = tempDateInput.value; // Get selected date for temperature
    const todayTemp = getTemperatureForDate(selectedDate); // Use selectedDate
    tempMorningInput.value =
      todayTemp.morning !== null ? todayTemp.morning : "";
    tempAfternoonInput.value =
      todayTemp.afternoon !== null ? todayTemp.afternoon : "";
  }

  // Nouveaux Commentaires
  const newCommentInput = document.getElementById('newCommentInput');
  const commentDateInput = document.getElementById('commentDateInput');
  if (newCommentInput && commentDateInput) {
      if (!commentDateInput.value) {
          commentDateInput.value = todayISO;
      }
      const selectedDate = commentDateInput.value;
      newCommentInput.value = getCommentForDate(selectedDate);
  }


  // Watts
  const wattInput = document.getElementById("wattInput");
  const wattDateInput = document.getElementById("wattDateInput");
  if (wattInput && wattDateInput) {
    if (!wattDateInput.value) {
      wattDateInput.value = todayISO;
    }
    const selectedDate = wattDateInput.value;
    const wattValue = getWattForDate(selectedDate);
    wattInput.value = wattValue > 0 ? wattValue : "";
  }
}

/**
 * Initialiser les événements de l'interface
 */
function initUIEvents() {
  fillTodaysInputs();
  updateHistory();
  updateWattHistory();
  updateCommentHistory();

  // Event listeners pour la touche "Entrée"
  document
    .getElementById("rainfallInput")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") saveRainfall();
    });
  document
    .getElementById("tempMorningInput")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") saveTemperature();
    });
  document
    .getElementById("tempAfternoonInput")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") saveTemperature();
    });

  // Event listeners pour les changements de date
  document
    .getElementById("rainfallDateInput")
    ?.addEventListener("change", fillTodaysInputs);
  document
    .getElementById("wattDateInput")
    ?.addEventListener("change", fillTodaysInputs);
  document
    .getElementById("commentDateInput")
    ?.addEventListener("change", fillTodaysInputs);


  // Event listener pour la touche "Entrée" dans le nouveau commentaire
  document.getElementById('newCommentInput')?.addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          saveNewComment();
      }
  });

  // Event listener pour la touche "Entrée" dans l'input watts
  document.getElementById("wattInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveWatt();
  });

  // Event listener pour le changement de date de watts
  document
    .getElementById("wattDateInput")
    ?.addEventListener("change", fillTodaysInputs);
}
