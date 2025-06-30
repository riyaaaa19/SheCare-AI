import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getRecommendations } from "../api";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Recommendations component mounted");
    fetchRecommendations();
  }, []);

  useEffect(() => {
    console.log("Recommendations state changed:", recommendations);
  }, [recommendations, loading]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      console.log("Fetching recommendations...");
      const data = await getRecommendations();
      console.log("Recommendations received:", data);
      console.log("Setting recommendations state with:", data);
      setRecommendations(data);
      setError(null);
      console.log("State updated, recommendations count:", data.length);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load personalized recommendations. Using fallback recommendations.");
      // Fallback to static recommendations if API fails
      const fallbackData = getFallbackRecommendations();
      console.log("Using fallback recommendations:", fallbackData);
      setRecommendations(fallbackData);
      console.log("Fallback recommendations set, count:", fallbackData.length);
    } finally {
      setLoading(false);
      console.log("Loading set to false");
    }
  };

  const getFallbackRecommendations = () => {
    return [
      {
        id: 1,
        type: "general",
        text: "Stay hydrated and listen to your body today.",
        date: new Date().toISOString()
      },
      {
        id: 2,
        type: "wellness",
        text: "Your body needs rest — take it slow and breathe.",
        date: new Date().toISOString()
      },
      {
        id: 3,
        type: "nutrition",
        text: "Eat fresh, move gently, and love yourself today.",
        date: new Date().toISOString()
      },
      {
        id: 4,
        type: "mood",
        text: "Mood dips detected — try journaling or light meditation.",
        date: new Date().toISOString()
      },
      {
        id: 5,
        type: "cycle",
        text: "Your cycle is approaching — prep with warm teas and comfort foods.",
        date: new Date().toISOString()
      },
      {
        id: 6,
        type: "nutrition",
        text: "Avoid junk food today for better energy and mood.",
        date: new Date().toISOString()
      },
      {
        id: 7,
        type: "wellness",
        text: "Try 10 minutes of gentle yoga or stretching to ease tension.",
        date: new Date().toISOString()
      },
      {
        id: 8,
        type: "nutrition",
        text: "Include healthy fats like avocado and nuts in your meals today.",
        date: new Date().toISOString()
      },
      {
        id: 9,
        type: "mood",
        text: "Start your day with 5 minutes of gratitude journaling.",
        date: new Date().toISOString()
      },
      {
        id: 10,
        type: "wellness",
        text: "Aim for 7-9 hours of quality sleep tonight for better recovery.",
        date: new Date().toISOString()
      },
      {
        id: 11,
        type: "wellness",
        text: "Try 10 minutes of gentle yoga or stretching to ease tension.",
        date: new Date().toISOString()
      },
      {
        id: 12,
        type: "nutrition",
        text: "Include healthy fats like avocado and nuts in your meals today.",
        date: new Date().toISOString()
      },
      {
        id: 13,
        type: "mood",
        text: "Start your day with 5 minutes of gratitude journaling.",
        date: new Date().toISOString()
      },
      {
        id: 14,
        type: "wellness",
        text: "Take a 20-minute walk in nature to boost your mood.",
        date: new Date().toISOString()
      },
      {
        id: 15,
        type: "nutrition",
        text: "Drink herbal teas like chamomile or peppermint for relaxation.",
        date: new Date().toISOString()
      },
      {
        id: 16,
        type: "cycle",
        text: "Warm bath with Epsom salts can help with period cramps.",
        date: new Date().toISOString()
      },
      {
        id: 17,
        type: "wellness",
        text: "Take a digital detox break for 1 hour to reduce stress.",
        date: new Date().toISOString()
      },
      {
        id: 18,
        type: "nutrition",
        text: "Include calcium-rich foods for bone health and muscle function.",
        date: new Date().toISOString()
      },
      {
        id: 19,
        type: "mood",
        text: "Connect with a friend or family member for emotional support.",
        date: new Date().toISOString()
      },
      {
        id: 20,
        type: "wellness",
        text: "Practice deep breathing exercises for 5 minutes.",
        date: new Date().toISOString()
      },
      {
        id: 21,
        type: "nutrition",
        text: "Eat vitamin C-rich foods to boost your immune system.",
        date: new Date().toISOString()
      },
      {
        id: 22,
        type: "cycle",
        text: "Log your cycle data to identify patterns and irregularities.",
        date: new Date().toISOString()
      },
      {
        id: 23,
        type: "wellness",
        text: "Try a new hobby or creative activity to boost mental health.",
        date: new Date().toISOString()
      },
      {
        id: 24,
        type: "nutrition",
        text: "Include omega-3 rich foods for hormonal balance and brain health.",
        date: new Date().toISOString()
      },
      {
        id: 25,
        type: "mood",
        text: "Read a book or listen to a podcast for mental stimulation.",
        date: new Date().toISOString()
      },
      {
        id: 26,
        type: "wellness",
        text: "Do light strength training to improve bone density.",
        date: new Date().toISOString()
      },
      {
        id: 27,
        type: "nutrition",
        text: "Choose whole grains over refined carbs for sustained energy.",
        date: new Date().toISOString()
      },
      {
        id: 28,
        type: "cycle",
        text: "Monitor your basal body temperature for fertility awareness.",
        date: new Date().toISOString()
      },
      {
        id: 29,
        type: "wellness",
        text: "Try progressive muscle relaxation to reduce tension.",
        date: new Date().toISOString()
      },
      {
        id: 30,
        type: "nutrition",
        text: "Snack on protein-rich foods to maintain stable blood sugar.",
        date: new Date().toISOString()
      },
      {
        id: 31,
        type: "mood",
        text: "Express yourself through art, writing, or music.",
        date: new Date().toISOString()
      },
      {
        id: 32,
        type: "wellness",
        text: "Engage in moderate cardio for 30 minutes to boost endorphins.",
        date: new Date().toISOString()
      },
      {
        id: 33,
        type: "nutrition",
        text: "Eat a rainbow of colorful vegetables for diverse nutrients.",
        date: new Date().toISOString()
      },
      {
        id: 34,
        type: "cycle",
        text: "Keep a symptom diary to track patterns with your healthcare provider.",
        date: new Date().toISOString()
      },
      {
        id: 35,
        type: "wellness",
        text: "Try aromatherapy with lavender or eucalyptus for relaxation.",
        date: new Date().toISOString()
      },
      {
        id: 36,
        type: "nutrition",
        text: "Drink water with lemon for natural detoxification.",
        date: new Date().toISOString()
      },
      {
        id: 37,
        type: "mood",
        text: "Practice self-compassion and positive self-talk today.",
        date: new Date().toISOString()
      },
      {
        id: 38,
        type: "wellness",
        text: "Try mindfulness meditation for 10 minutes.",
        date: new Date().toISOString()
      },
      {
        id: 39,
        type: "nutrition",
        text: "Choose dark chocolate (70%+) for mood-boosting antioxidants.",
        date: new Date().toISOString()
      },
      {
        id: 40,
        type: "cycle",
        text: "Schedule regular check-ups with your gynecologist.",
        date: new Date().toISOString()
      },
      {
        id: 41,
        type: "wellness",
        text: "Get 15 minutes of morning sunlight for vitamin D and mood.",
        date: new Date().toISOString()
      },
      {
        id: 42,
        type: "nutrition",
        text: "Consider probiotic foods for gut health and immunity.",
        date: new Date().toISOString()
      },
      {
        id: 43,
        type: "mood",
        text: "Set small, achievable goals to build confidence.",
        date: new Date().toISOString()
      },
      {
        id: 44,
        type: "wellness",
        text: "Practice gentle stretching before bed for better sleep.",
        date: new Date().toISOString()
      },
      {
        id: 45,
        type: "nutrition",
        text: "Eat fiber-rich foods to support digestive health.",
        date: new Date().toISOString()
      },
      {
        id: 46,
        type: "cycle",
        text: "Use period tracking apps to monitor cycle length and symptoms.",
        date: new Date().toISOString()
      },
      {
        id: 47,
        type: "wellness",
        text: "Try herbal supplements like evening primrose oil for PMS.",
        date: new Date().toISOString()
      },
      {
        id: 48,
        type: "nutrition",
        text: "Include magnesium-rich foods to help with muscle relaxation.",
        date: new Date().toISOString()
      },
      {
        id: 49,
        type: "mood",
        text: "Reach out to a mental health professional if needed.",
        date: new Date().toISOString()
      },
      {
        id: 50,
        type: "wellness",
        text: "Try swimming for low-impact, full-body exercise.",
        date: new Date().toISOString()
      }
    ];
  };

  const getTypeIcon = (type) => {
    const icons = {
      cycle: "🩸",        // Menstrual blood drop
      mood: "🧠",         // Brain for mood/mental health
      symptom: "🤒",      // Face with thermometer
      pcos: "🧬",         // DNA for PCOS
      engagement: "🎯",   // Target for engagement
      age: "🎂",          // Birthday cake for age
      nutrition: "🍉",    // Watermelon for nutrition
      wellness: "🧘",     // Person in lotus position for wellness
      seasonal: "🌸",     // Cherry blossom for seasonal
      achievement: "🥇",  // Gold medal for achievement
      motivation: "🚀",   // Rocket for motivation
      general: "✨"       // Sparkles for general
    };
    return icons[type] || "✨";
  };

  const getTypeColor = (type) => {
    const colors = {
      cycle: "#ff6b9d",
      mood: "#4ecdc4",
      symptom: "#ff9ff3",
      pcos: "#54a0ff",
      engagement: "#5f27cd",
      age: "#00d2d3",
      nutrition: "#ff9f43",
      wellness: "#10ac84",
      seasonal: "#48dbfb",
      achievement: "#ffd32a",
      motivation: "#ff6b6b",
      general: "#d72660"
    };
    return colors[type] || "#d72660";
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)",
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          textAlign: "center",
          color: "#d72660"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <div style={{ fontSize: 18, fontWeight: 500 }}>Analyzing your health data...</div>
          <div style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>Generating personalized recommendations</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #ffe0ec 0%, #f8f9fa 100%)",
      padding: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div className="shecare-main-content" style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 16px"
      }}>
        <h2 style={{
          color: "#d72660",
          marginBottom: 32,
          textAlign: "center",
          fontWeight: 700,
          letterSpacing: 1,
          fontSize: 30,
        }}>
          💡 Your Recommendations
        </h2>
        
        {error && (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            color: "#856404",
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        {recommendations.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#666",
            padding: 40
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>No recommendations yet</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>
              Start tracking your cycles, moods, and symptoms to get personalized insights!
            </div>
          </div>
        ) : (
          <>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              border: "1px solid #ffe0ec",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                🤖 AI-Powered Analysis
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Based on your {recommendations.length} health patterns and data
              </div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                Debug: Showing {recommendations.length} recommendations
              </div>
            </div>

            <div style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              maxWidth: "1200px",
              margin: "0 auto"
            }}>
              {recommendations.map((rec, i) => {
                console.log(`Rendering recommendation ${i + 1}:`, rec);
                return (
                <motion.div
                  key={rec.id || i}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(215,38,96,0.15)" }}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: "0 4px 16px rgba(215,38,96,0.10)",
                    border: `2px solid ${getTypeColor(rec.type)}20`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    minHeight: 100,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: getTypeColor(rec.type),
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: 0.5
                  }}>
                    <span style={{ marginRight: 4 }}>{getTypeIcon(rec.type)}</span>{rec.type}
                  </div>
                  
                  <span style={{ 
                    color: "#333", 
                    fontSize: 16, 
                    fontWeight: 500, 
                    lineHeight: 1.6,
                    marginTop: 8
                  }}>
                    <span style={{ 
                      fontSize: 28, 
                      verticalAlign: "middle", 
                      marginRight: 12 
                    }}>
                      {getTypeIcon(rec.type)}
                    </span>
                    {rec.text}
                  </span>
                  
                  <div style={{ 
                    fontSize: 12, 
                    color: "#888", 
                    textAlign: "right", 
                    marginTop: 16, 
                    width: "100%",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 12
                  }}>
                    {new Date(rec.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </motion.div>
              )})}
            </div>

            <div style={{
              textAlign: "center",
              marginTop: 32,
              padding: 20,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #ffe0ec"
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                💡 Tips for better recommendations:
              </div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                • Track your cycles regularly • Log your moods and symptoms • Complete your profile • Take health assessments
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendations; 