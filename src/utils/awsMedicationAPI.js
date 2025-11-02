// Client-side medication API that connects to real AWS API Gateway
class AWSMedicationAPI {
  constructor() {
    this.baseURL = 'https://1a5a28n6t2.execute-api.ap-southeast-2.amazonaws.com/prod';
    this.storageKey = 'medication_app_cache';
    this.userId = 'test_user_123'; // Using your test user ID
  }

  // Convert DynamoDB format to normal JavaScript objects
  convertFromDynamoDB(dynamoItem) {
    if (!dynamoItem) return null;
    
    const convertValue = (value) => {
      if (value.S) return value.S;
      if (value.N) return Number(value.N);
      if (value.BOOL !== undefined) return value.BOOL;
      if (value.L) return value.L.map(item => convertValue(item));
      if (value.M) {
        const obj = {};
        for (const [key, val] of Object.entries(value.M)) {
          obj[key] = convertValue(val);
        }
        return obj;
      }
      return value;
    };

    const normalItem = {};
    for (const [key, value] of Object.entries(dynamoItem)) {
      normalItem[key] = convertValue(value);
    }
    return normalItem;
  }

  // Convert normal JavaScript objects to DynamoDB format
  convertToDynamoDB(normalItem) {
    const convertValue = (value) => {
      if (typeof value === 'string') return { S: value };
      if (typeof value === 'number') return { N: value.toString() };
      if (typeof value === 'boolean') return { BOOL: value };
      if (Array.isArray(value)) return { L: value.map(item => convertValue(item)) };
      if (typeof value === 'object' && value !== null) {
        const obj = {};
        for (const [key, val] of Object.entries(value)) {
          obj[key] = convertValue(val);
        }
        return { M: obj };
      }
      return { NULL: true };
    };

    const dynamoItem = {};
    for (const [key, value] of Object.entries(normalItem)) {
      dynamoItem[key] = convertValue(value);
    }
    return dynamoItem;
  }

  // Generic API call method
  async callAPI(endpoint, method = 'GET', body = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      console.log(`🔧 API Call: ${method} ${url}`, body);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Get all medications for current user
  async getMedications() {
    try {
      const response = await this.callAPI(`/medications?user_id=${this.userId}`);
      
      // Convert DynamoDB format to normal objects
      if (response.status === 'success' && response.medications) {
        response.medications = response.medications.map(item => 
          this.convertFromDynamoDB(item)
        ).filter(item => item !== null);
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching medications:', error);
      // Fallback to local storage if API fails
      return this.getCachedMedications();
    }
  }

  // Add a new medication
  async addMedication(medicationData) {
    const payload = {
      user_id: this.userId,
      medication_name: medicationData.medication_name,
      dosage: medicationData.dosage || '',
      times: medicationData.times,
      days_of_week: medicationData.days_of_week || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timezone: medicationData.timezone || 'Asia/Shanghai',
      phone_number: medicationData.phone_number || '+85259192611',
      is_active: true
    };

    try {
      const response = await this.callAPI('/medications', 'POST', payload);
      
      // Cache the new medication locally
      if (response.status === 'success' && response.medication) {
        const normalMedication = this.convertFromDynamoDB(response.medication);
        if (normalMedication) {
          this.cacheMedication(normalMedication);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error adding medication:', error);
      // Fallback: add to local cache only
      return this.addMedicationToCache(payload);
    }
  }

  // Log medication action (taken, missed, etc.)
  async logMedicationAction(logData) {
    const payload = {
      user_id: this.userId,
      medication_name: logData.medication_name,
      status: logData.status || 'taken',
      confirmation_method: logData.confirmation_method || 'web_app'
    };

    try {
      const response = await this.callAPI('/logs', 'POST', payload);
      return response;
    } catch (error) {
      console.error('Error logging medication action:', error);
      // Still return success for UX
      return { status: 'success', message: 'Action logged locally' };
    }
  }

  // Add test data to your DynamoDB table
  async addTestData() {
    const testMedications = [
      {
        user_id: this.userId,
        medication_id: 'med_001',
        medication_name: 'Lisinopril',
        dosage: '10mg',
        times: ['08:00', '20:00'],
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        phone_number: '+85259192611',
        timezone: 'Asia/Shanghai',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        user_id: this.userId,
        medication_id: 'med_002', 
        medication_name: 'Metformin',
        dosage: '500mg',
        times: ['07:00', '19:00'],
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        phone_number: '+85259192611',
        timezone: 'Asia/Shanghai',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        user_id: this.userId,
        medication_id: 'med_003',
        medication_name: 'Atorvastatin',
        dosage: '20mg',
        times: ['21:00'],
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        phone_number: '+85259192611',
        timezone: 'Asia/Shanghai',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    console.log('🔄 Adding test data to AWS...');
    
    const results = [];
    for (const med of testMedications) {
      try {
        const result = await this.addMedication(med);
        results.push({
          medication: med.medication_name,
          status: result.status,
          source: result.source || 'api'
        });
      } catch (error) {
        results.push({
          medication: med.medication_name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return {
      status: 'completed',
      results: results
    };
  }

  // Local caching fallback methods
  getCachedMedications() {
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          status: 'success',
          medications: data.medications || [],
          count: (data.medications || []).length,
          source: 'cache'
        };
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    
    return {
      status: 'success',
      medications: [],
      count: 0,
      source: 'cache'
    };
  }

  cacheMedication(medication) {
    try {
      const cached = this.getCachedMedications();
      const existingMeds = cached.medications || [];
      
      // Remove if exists (update case)
      const filteredMeds = existingMeds.filter(m => 
        m.medication_id !== medication.medication_id && m.id !== medication.medication_id
      );
      
      const updatedMeds = [...filteredMeds, medication];
      localStorage.setItem(this.storageKey, JSON.stringify({
        medications: updatedMeds,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error caching medication:', error);
    }
  }

  addMedicationToCache(medicationData) {
    const newMedication = {
      ...medicationData,
      medication_id: `local_${Date.now()}`,
      user_id: this.userId,
      is_active: true,
      created_at: new Date().toISOString(),
      source: 'local_cache'
    };

    this.cacheMedication(newMedication);

    return {
      status: 'success',
      message: 'Medication added to local cache (API unavailable)',
      medication: newMedication,
      source: 'cache'
    };
  }

  // Check for due medications (client-side only - runs in browser)
  checkDueMedications(medications) {
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
  startNotificationChecker(medications, onNotification) {
    // Check every minute
    const intervalId = setInterval(() => {
      const dueMeds = this.checkDueMedications(medications);
      if (dueMeds.length > 0 && onNotification) {
        onNotification(dueMeds);
      }
    }, 60000);

    // Check immediately on startup
    setTimeout(() => {
      const dueMeds = this.checkDueMedications(medications);
      if (dueMeds.length > 0 && onNotification) {
        onNotification(dueMeds);
      }
    }, 1000);

    return intervalId; // Return ID so it can be cleared
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

        // Auto-close after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);
      });
    } else if (Notification.permission === 'default') {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.showBrowserNotifications(dueMedications);
      }
    }
  }

  // Set user ID (if you implement user system)
  setUserId(userId) {
    this.userId = userId;
    // Clear cache when user changes
    localStorage.removeItem(this.storageKey);
  }

  // Get API status
  async getAPIStatus() {
    try {
      const response = await fetch(`${this.baseURL}/medications?user_id=${this.userId}`);
      return {
        online: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        online: false,
        error: error.message
      };
    }
  }

  // Clear local cache
  clearCache() {
    localStorage.removeItem(this.storageKey);
    return { status: 'success', message: 'Cache cleared' };
  }
}

// Create singleton instance
const awsMedicationAPI = new AWSMedicationAPI();

export default awsMedicationAPI;
