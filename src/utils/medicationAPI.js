// Client-side medication management that mimics AWS Lambda functionality
class MedicationAPI {
  constructor() {
    this.storageKey = 'medication_app_data';
    this.init();
  }

  init() {
    // Initialize data structure if it doesn't exist
    if (!this.getData()) {
      this.setData({
        medications: [],
        logs: [],
        settings: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: true
        }
      });
    }
    this.startNotificationChecker();
  }

  getData() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return {};
    }
  }

  setData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Get all medications for a user
  async getMedications(userId = 'default') {
    const data = this.getData();
    return {
      status: 'success',
      medications: data.medications || [],
      count: (data.medications || []).length
    };
  }

  // Add a new medication
  async addMedication(medicationData) {
    const data = this.getData();
    const newMedication = {
      medication_id: `med_${Date.now()}`,
      user_id: medicationData.user_id || 'default',
      medication_name: medicationData.medication_name,
      dosage: medicationData.dosage || '',
      times: medicationData.times,
      days_of_week: medicationData.days_of_week || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: medicationData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      is_active: true,
      created_at: new Date().toISOString()
    };

    data.medications = [...(data.medications || []), newMedication];
    this.setData(data);

    return {
      status: 'success',
      message: 'Medication added successfully',
      medication: newMedication
    };
  }

  // Log medication action
  async logMedicationAction(logData) {
    const data = this.getData();
    const newLog = {
      user_id: logData.user_id || 'default',
      timestamp: new Date().toISOString(),
      medication_name: logData.medication_name,
      status: logData.status || 'taken',
      confirmation_method: logData.confirmation_method || 'web_app'
    };

    data.logs = [...(data.logs || []), newLog];
    this.setData(data);

    // If marking as taken, update medication status
    if (logData.status === 'taken') {
      data.medications = data.medications.map(med => 
        med.medication_name === logData.medication_name 
          ? { ...med, last_taken: new Date().toISOString() }
          : med
      );
      this.setData(data);
    }

    return {
      status: 'success',
      message: 'Medication action logged successfully',
      log: newLog
    };
  }

  // Check for due medications
  checkDueMedications() {
    const data = this.getData();
    const medications = data.medications || [];
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const dueMedications = medications.filter(med => {
      if (!med.is_active) return false;

      // Check if today is in the scheduled days
      const scheduledDays = med.days_of_week || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      if (!scheduledDays.includes(currentDay)) return false;

      // Check if current time matches any scheduled time (within 2 minutes)
      return med.times.some(scheduledTime => {
        return this.timesMatch(scheduledTime, currentTime, 2);
      });
    });

    return dueMedications;
  }

  timesMatch(scheduledTime, currentTime, toleranceMinutes = 2) {
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':');
      return parseInt(h) * 60 + parseInt(m);
    };

    const scheduledMinutes = toMinutes(scheduledTime);
    const currentMinutes = toMinutes(currentTime);
    const timeDiff = Math.abs(scheduledMinutes - currentMinutes);

    return timeDiff <= toleranceMinutes;
  }

  // Start background notification checker
  startNotificationChecker() {
    // Check every minute
    setInterval(() => {
      const dueMeds = this.checkDueMedications();
      if (dueMeds.length > 0) {
        this.showBrowserNotifications(dueMeds);
      }
    }, 60000);

    // Check immediately on startup
    setTimeout(() => {
      const dueMeds = this.checkDueMedications();
      if (dueMeds.length > 0) {
        this.showBrowserNotifications(dueMeds);
      }
    }, 1000);
  }

  // Show browser notifications
  async showBrowserNotifications(dueMedications) {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      dueMedications.forEach(med => {
        const notification = new Notification('💊 Medication Reminder', {
          body: `Time to take ${med.medication_name}${med.dosage ? ` (${med.dosage})` : ''}`,
          icon: '/favicon.ico',
          tag: `med-reminder-${med.medication_id}`
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      });
    } else if (Notification.permission === 'default') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.showBrowserNotifications(dueMedications);
        }
      });
    }
  }

  // Get medication statistics
  getStats() {
    const data = this.getData();
    const medications = data.medications || [];
    const logs = data.logs || [];

    const today = new Date().toDateString();
    const todayLogs = logs.filter(log => 
      new Date(log.timestamp).toDateString() === today
    );

    return {
      totalMedications: medications.length,
      activeMedications: medications.filter(m => m.is_active).length,
      takenToday: todayLogs.filter(log => log.status === 'taken').length,
      totalLogs: logs.length
    };
  }

  // Export data (for backup)
  exportData() {
    return this.getData();
  }

  // Import data (for restore)
  importData(data) {
    this.setData(data);
    return { status: 'success', message: 'Data imported successfully' };
  }
}

// Create singleton instance
const medicationAPI = new MedicationAPI();

export default medicationAPI;
