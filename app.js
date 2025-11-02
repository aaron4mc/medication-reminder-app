const API_URL = 'https://1a5a28n6t2.execute-api.ap-southeast-2.amazonaws.com/prod';
const USER_ID = 'test_user_123';

// Load medications on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMedications();
});

async function loadMedications() {
    showLoading();
    hideError();
    hideContent();

    try {
        const response = await fetch(`${API_URL}/medications?user_id=${USER_ID}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            displayMedications(data.medications);
            showContent();
        } else {
            throw new Error(data.error || 'Failed to load medications');
        }
    } catch (error) {
        console.error('Error loading medications:', error);
        showError();
    } finally {
        hideLoading();
    }
}

function displayMedications(medications) {
    const todayMedsDiv = document.getElementById('todayMeds');
    const allMedsDiv = document.getElementById('allMeds');
    const medSelect = document.getElementById('medSelect');

    // Clear existing content
    todayMedsDiv.innerHTML = '';
    allMedsDiv.innerHTML = '';
    medSelect.innerHTML = '<option value="">Select medication to log...</option>';

    // Get current day and time
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    medications.forEach(med => {
        // Add to dropdown
        const option = document.createElement('option');
        option.value = med.medication_name;
        option.textContent = `${med.medication_name} ${med.dosage}`;
        medSelect.appendChild(option);

        // Create medication card
        const medCard = createMedicationCard(med, currentDay, currentTime);
        allMedsDiv.appendChild(medCard);

        // Check if medication is for today
        if (med.days_of_week.includes(currentDay)) {
            todayMedsDiv.appendChild(medCard.cloneNode(true));
        }
    });

    // Show message if no medications for today
    if (todayMedsDiv.children.length === 0) {
        todayMedsDiv.innerHTML = '<p class="no-meds">No medications scheduled for today! 🎉</p>';
    }
}

function createMedicationCard(med, currentDay, currentTime) {
    const card = document.createElement('div');
    card.className = 'medication-card';
    
    const timesHTML = med.times.map(time => {
        const isPast = currentDay === med.days_of_week[0] && time < currentTime;
        return `<span class="time-badge ${isPast ? 'past' : ''}">${time}</span>`;
    }).join('');

    card.innerHTML = `
        <h3>${med.medication_name} ${med.dosage}</h3>
        <p><strong>Times:</strong> ${timesHTML}</p>
        <p><strong>Days:</strong> ${med.days_of_week.join(', ')}</p>
        <p><strong>Timezone:</strong> ${med.timezone}</p>
    `;
    
    return card;
}

async function logMedication(status) {
    const medName = document.getElementById('medSelect').value;
    
    if (!medName) {
        alert('Please select a medication first');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/logs`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: USER_ID,
                medication_name: medName,
                status: status,
                confirmation_method: 'web'
            })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            alert(`✅ Successfully logged ${medName} as ${status}`);
            // Reload to show updated status
            loadMedications();
        } else {
            throw new Error(data.error || 'Failed to log medication');
        }
    } catch (error) {
        alert('Error logging medication. Please try again.');
        console.error('Error:', error);
    }
}

// Add new medication form handler
document.getElementById('addMedForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const medName = document.getElementById('medName').value;
    const dosage = document.getElementById('medDosage').value;
    const times = document.getElementById('medTimes').value.split(',').map(t => t.trim());

    try {
        const response = await fetch(`${API_URL}/medications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: USER_ID,
                medication_name: medName,
                dosage: dosage,
                times: times,
                timezone: 'Asia/Shanghai',
                phone_number: '+85259192611'
            })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            alert('✅ Medication added successfully!');
            this.reset();
            loadMedications(); // Refresh the list
        } else {
            throw new Error(data.error || 'Failed to add medication');
        }
    } catch (error) {
        alert('Error adding medication. Please try again.');
        console.error('Error:', error);
    }
});

// UI Helper Functions
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showContent() {
    document.getElementById('content').style.display = 'block';
}

function hideContent() {
    document.getElementById('content').style.display = 'none';
}

function showError() {
    document.getElementById('error').style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}
