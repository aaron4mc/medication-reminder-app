// AWS Daily Living Support API Integration
const AWS_DAILY_LIVING_API_URL = 'https://1a5a28n6t2.execute-api.ap-southeast-2.amazonaws.com/prod/daily-living';

class AWSDailyLivingAPI {
  constructor() {
    this.baseURL = AWS_DAILY_LIVING_API_URL;
  }

  async callDailyLivingAPI(actionData) {
    try {
      console.log('🔄 Calling AWS Daily Living API with:', actionData);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ AWS Daily Living API response:', result);
      return result;

    } catch (error) {
      console.error('❌ AWS Daily Living API call failed:', error);
      
      // Fallback to local simulation
      console.log('🔄 Falling back to local simulation');
      return this.simulateDailyLivingAPI(actionData);
    }
  }

  simulateDailyLivingAPI(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate the Python function logic in JavaScript
        const response = this.handleDailyLivingEvent(params);
        resolve(response);
      }, 1000);
    });
  }

  // JavaScript implementation of the Python daily living functions
  handleDailyLivingEvent(params) {
    const user_id = params.user_id || 'user_123';
    const action_type = params.action_type || 'get_today_summary';
    
    if (!user_id) {
      return { status: "error", message: "user_id is required" };
    }
    
    switch (action_type) {
      case 'meal_log':
        return this.logMeal(user_id, params);
      case 'appointment_check':
        return this.checkAppointments(user_id, params);
      case 'hydration_track':
        return this.trackHydration(user_id);
      case 'activity_log':
        return this.logActivity(user_id, params);
      case 'get_today_summary':
        return this.getTodaySummary(user_id);
      default:
        return { status: "error", message: "Invalid action_type" };
    }
  }

  logMeal(user_id, params) {
    const meal_type = params.meal_type || 'lunch';
    const meal_items = params.meal_items || this.getDefaultMeal(meal_type);
    const completion_level = params.completion_level || 'full';
    
    const nutrition_feedback = this.generateNutritionFeedback(meal_type, meal_items);
    const log_id = `meal_${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`;
    
    return {
      status: "success",
      message: `${meal_type.charAt(0).toUpperCase() + meal_type.slice(1)} logged successfully`,
      data: {
        log_id,
        user_id,
        meal_type,
        meal_items,
        completion_level,
        timestamp: new Date().toISOString(),
        nutrition_feedback,
        next_meal_suggestion: this.getNextMealSuggestion(meal_type),
        hydration_reminder: "Don't forget to drink water with your meal! 💧"
      }
    };
  }

  checkAppointments(user_id, params) {
    const appointment_type = params.appointment_type || 'all';
    const appointments = this.generateAppointments();
    
    const filteredAppointments = appointment_type !== 'all' 
      ? appointments.filter(apt => apt.type === appointment_type)
      : appointments;
    
    const now = new Date();
    const nextAppointment = filteredAppointments.find(apt => 
      new Date(apt.date_time) > now
    );
    
    return {
      status: "success",
      message: `Found ${filteredAppointments.length} upcoming appointments`,
      data: {
        user_id,
        appointment_type,
        total_appointments: filteredAppointments.length,
        next_appointment: nextAppointment,
        all_appointments: filteredAppointments,
        today_appointments: filteredAppointments.filter(apt => 
          apt.date_time.startsWith(now.toISOString().split('T')[0])
        ),
        reminders: this.generateAppointmentReminders(filteredAppointments)
      }
    };
  }

  trackHydration(user_id) {
    const daily_goal = 8;
    const consumed_today = Math.floor(Math.random() * 5) + 3;
    const remaining = Math.max(0, daily_goal - consumed_today);
    const hydration_status = consumed_today >= 6 ? "good" : "needs_improvement";
    
    return {
      status: "success",
      message: `Hydration tracking: ${consumed_today}/${daily_goal} glasses today`,
      data: {
        user_id,
        daily_goal_glasses: daily_goal,
        consumed_today,
        remaining_glasses: remaining,
        hydration_status,
        last_drink_time: new Date(Date.now() - (Math.random() * 90 + 30) * 60000).toISOString(),
        reminders: [
          `Time for water! You have ${remaining} glasses to go today`,
          "Staying hydrated helps with energy and digestion"
        ],
        tips: [
          "Keep a water bottle nearby",
          "Drink a glass with each meal",
          "Set hourly reminders if needed"
        ]
      }
    };
  }

  logActivity(user_id, params) {
    const activity_type = params.activity_type || 'walk';
    const duration_minutes = params.duration_minutes || 15;
    
    const activityInfo = {
      walk: { benefits: "Improves circulation, mood, and joint health", intensity: "light", calories_burned: duration_minutes * 3 },
      exercise: { benefits: "Strengthens muscles, improves balance", intensity: "moderate", calories_burned: duration_minutes * 5 },
      social: { benefits: "Reduces loneliness, improves mental health", intensity: "light", calories_burned: duration_minutes * 2 },
      hobby: { benefits: "Cognitive stimulation, relaxation", intensity: "sedentary", calories_burned: duration_minutes * 1 }
    };
    
    const info = activityInfo[activity_type] || activityInfo.walk;
    const activity_id = `activity_${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`;
    
    return {
      status: "success",
      message: `${activity_type.charAt(0).toUpperCase() + activity_type.slice(1)} activity logged for ${duration_minutes} minutes`,
      data: {
        activity_id,
        user_id,
        activity_type,
        duration_minutes,
        timestamp: new Date().toISOString(),
        benefits: info.benefits,
        intensity: info.intensity,
        calories_burned: info.calories_burned,
        encouragement: this.getActivityEncouragement(activity_type, duration_minutes),
        next_activity_suggestion: this.suggestNextActivity(activity_type)
      }
    };
  }

  getTodaySummary(user_id) {
    const todayData = {
      meals_logged: Math.floor(Math.random() * 2) + 2,
      medications_taken: `${Math.floor(Math.random() * 21) + 80}%`,
      water_glasses: Math.floor(Math.random() * 5) + 4,
      activities_completed: Math.floor(Math.random() * 3) + 1,
      mood: ["happy", "content", "peaceful"][Math.floor(Math.random() * 3)],
      sleep_hours: (Math.random() * 2.5 + 6).toFixed(1),
      steps_taken: Math.floor(Math.random() * 3500) + 1500
    };
    
    const wellness_score = this.calculateWellnessScore(todayData);
    
    return {
      status: "success",
      message: "Today's daily living summary",
      data: {
        user_id,
        date: new Date().toISOString().split('T')[0],
        wellness_score,
        daily_data: todayData,
        achievements: this.identifyAchievements(todayData),
        areas_for_improvement: this.identifyImprovementAreas(todayData),
        tomorrow_goals: this.generateTomorrowGoals(todayData),
        caregiver_notes: "All daily activities completed successfully today"
      }
    };
  }

  // Helper functions
  getDefaultMeal(mealType) {
    const defaultMeals = {
      breakfast: "oatmeal with fruit, toast, orange juice",
      lunch: "chicken soup, whole wheat bread, apple",
      dinner: "baked fish, steamed vegetables, rice",
      snack: "yogurt, nuts, banana"
    };
    return defaultMeals[mealType] || "meal";
  }

  generateNutritionFeedback(mealType, mealItems) {
    const feedback = [];
    
    if (mealItems.toLowerCase().includes("vegetable") || mealItems.toLowerCase().includes("fruit")) {
      feedback.push("Great job including fruits/vegetables! 🥦");
    }
    
    if (mealItems.toLowerCase().includes("whole") || mealItems.toLowerCase().includes("grain")) {
      feedback.push("Good fiber choice with whole grains! 🌾");
    }
    
    if (mealType === "breakfast") {
      feedback.push("Good start to the day with breakfast! ☀️");
    } else if (mealType === "lunch") {
      feedback.push("Balanced lunch helps maintain energy! 🥗");
    } else if (mealType === "dinner") {
      feedback.push("Nutritious dinner supports good sleep! 🌙");
    }
    
    if (feedback.length === 0) {
      feedback.push("Thank you for logging your meal! Regular meals are important. 🍽️");
    }
    
    return feedback;
  }

  getNextMealSuggestion(currentMeal) {
    const suggestions = {
      breakfast: "For lunch, consider protein like chicken or fish with vegetables",
      lunch: "For dinner, a light meal with complex carbs helps sleep",
      dinner: "For tomorrow's breakfast, oatmeal with berries provides sustained energy",
      snack: "Next meal: balanced plate with protein, veggies, and whole grains"
    };
    return suggestions[currentMeal] || "Stay hydrated between meals!";
  }

  generateAppointments() {
    const now = new Date();
    return [
      {
        id: "apt_001",
        type: "medical",
        provider: "Dr. Smith - Cardiology",
        date_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
        location: "123 Main St, Suite 400",
        preparation: "Fasting required for 12 hours before",
        transportation: "scheduled"
      },
      {
        id: "apt_002",
        type: "therapy",
        provider: "Physical Therapy Center",
        date_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
        location: "456 Oak Avenue",
        preparation: "Wear comfortable clothing",
        transportation: "family"
      },
      {
        id: "apt_003",
        type: "social",
        provider: "Bridge Club",
        date_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
        location: "Community Center",
        preparation: "Bring your card deck",
        transportation: "volunteer"
      }
    ];
  }

  generateAppointmentReminders(appointments) {
    const reminders = [];
    const now = new Date();
    
    appointments.forEach(apt => {
      const aptTime = new Date(apt.date_time);
      const timeDiff = aptTime - now;
      
      if (timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000) {
        reminders.push(`Today: ${apt.provider} at ${aptTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
      } else if (timeDiff > 24 * 60 * 60 * 1000 && timeDiff < 2 * 24 * 60 * 60 * 1000) {
        reminders.push(`Tomorrow: ${apt.provider}`);
      }
    });
    
    return reminders;
  }

  getActivityEncouragement(activityType, duration) {
    if (duration >= 30) {
      return `Excellent! ${duration} minutes of ${activityType} is fantastic for your health! 🎉`;
    } else if (duration >= 15) {
      return `Great job! Regular ${activityType} helps maintain mobility and mood! 👍`;
    } else {
      return `Every bit of movement counts! Thanks for staying active! 💪`;
    }
  }

  suggestNextActivity(currentActivity) {
    const suggestions = {
      walk: "Try some light stretching or chair exercises next",
      exercise: "A gentle walk would be great for cooldown",
      social: "Some quiet reading or puzzles would balance your day",
      hobby: "A short walk outside would be refreshing"
    };
    return suggestions[currentActivity] || "Mix different activities for best results";
  }

  calculateWellnessScore(data) {
    let score = 50;
    
    // Meal scoring
    if (data.meals_logged >= 3) score += 15;
    else if (data.meals_logged >= 2) score += 10;
    
    // Medication scoring
    const medPercent = parseInt(data.medications_taken);
    score += (medPercent / 100) * 15;
    
    // Hydration scoring
    if (data.water_glasses >= 6) score += 10;
    else if (data.water_glasses >= 4) score += 5;
    
    // Activity scoring
    if (data.activities_completed >= 2) score += 10;
    
    return Math.min(100, score);
  }

  identifyAchievements(data) {
    const achievements = [];
    
    if (data.meals_logged >= 3) achievements.push("✅ Ate 3 balanced meals today");
    if (parseInt(data.medications_taken) >= 90) achievements.push("✅ Medications taken on schedule");
    if (data.water_glasses >= 6) achievements.push("✅ Good hydration today");
    if (data.activities_completed >= 2) achievements.push("✅ Stayed active throughout day");
    
    if (achievements.length === 0) achievements.push("✅ Completed daily living activities");
    
    return achievements;
  }

  identifyImprovementAreas(data) {
    const improvements = [];
    
    if (data.water_glasses < 6) improvements.push("💧 Drink more water - aim for 6-8 glasses");
    if (data.activities_completed < 2) improvements.push("🚶 Add more movement to your day");
    if (data.meals_logged < 3) improvements.push("🍽️ Try to eat 3 meals for consistent energy");
    
    return improvements;
  }

  generateTomorrowGoals(data) {
    const goals = [];
    
    if (data.water_glasses < 6) goals.push(`Drink ${6 - data.water_glasses} more glasses of water`);
    if (data.activities_completed < 2) goals.push("Complete 2 different activities");
    
    goals.push("Take all medications as scheduled");
    goals.push("Eat 3 balanced meals");
    
    return goals;
  }
}

// Create and export singleton instance
const awsDailyLivingAPI = new AWSDailyLivingAPI();
export default awsDailyLivingAPI;
