import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    const period = url.searchParams.get('period') || '30' // days
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const periodDays = Math.min(parseInt(period), 365) // Max 1 year

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - (periodDays * 24 * 60 * 60 * 1000))

    // Format dates for SQL
    const startDateStr = start.toISOString().split('T')[0]
    const endDateStr = end.toISOString().split('T')[0]

    // Fetch mood trends data
    const { data: moodTrends, error: trendsError } = await supabase
      .from('mood_trends')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })

    if (trendsError) {
      console.error('Error fetching mood trends:', trendsError)
      return NextResponse.json(
        { error: 'Failed to fetch mood trends' },
        { status: 500 }
      )
    }

    // Fetch journal entries for the period to get additional insights
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('date, mood_rating, energy_level, stress_level, ai_mood_analysis, tags')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })

    if (journalError) {
      console.error('Error fetching journal entries:', journalError)
      return NextResponse.json(
        { error: 'Failed to fetch journal data' },
        { status: 500 }
      )
    }

    // Calculate analytics
    const analytics = calculateMoodAnalytics(moodTrends || [], journalEntries || [])

    return NextResponse.json({
      success: true,
      period: {
        start: startDateStr,
        end: endDateStr,
        days: periodDays
      },
      analytics,
      raw_data: {
        mood_trends: moodTrends || [],
        journal_entries: journalEntries || []
      }
    })

  } catch (error) {
    console.error('Error in mood analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface MoodTrend {
  date: string
  overall_mood: number
  energy_level: number
  stress_level: number
  notes: string | null
}

interface JournalEntry {
  date: string
  mood_rating: number | null
  energy_level: number | null
  stress_level: number | null
  ai_mood_analysis: {
    dominant_emotion: string
    confidence: number
    themes: string[]
    growth_areas: string[]
  } | null
  tags: string[] | null
}

function calculateMoodAnalytics(moodTrends: MoodTrend[], journalEntries: JournalEntry[]) {
  // Combine data from both sources
  const allData = new Map()
  
  // Add mood trends data
  moodTrends.forEach(trend => {
    allData.set(trend.date, {
      date: trend.date,
      mood: trend.overall_mood,
      energy: trend.energy_level,
      stress: trend.stress_level,
      notes: trend.notes
    })
  })
  
  // Add/merge journal data
  journalEntries.forEach(entry => {
    const existing = allData.get(entry.date) || { date: entry.date }
    allData.set(entry.date, {
      ...existing,
      mood: entry.mood_rating || existing.mood,
      energy: entry.energy_level || existing.energy,
      stress: entry.stress_level || existing.stress,
      ai_mood_analysis: entry.ai_mood_analysis,
      tags: entry.tags
    })
  })
  
  const dataPoints = Array.from(allData.values()).filter(d => d.mood || d.energy || d.stress)
  
  if (dataPoints.length === 0) {
    return {
      summary: {
        total_entries: 0,
        average_mood: null,
        average_energy: null,
        average_stress: null,
        mood_trend: 'insufficient_data',
        consistency_score: 0
      },
      patterns: {
        best_days: [],
        challenging_days: [],
        common_emotions: [],
        recurring_themes: []
      },
      recommendations: [
        'ابدأ بتسجيل مزاجك يومياً لنتمكن من تحليل الأنماط',
        'استخدم تقييمات المزاج من 1 إلى 10 للحصول على رؤى أفضل'
      ]
    }
  }

  // Calculate averages
  const moodValues = dataPoints.filter(d => d.mood).map(d => d.mood)
  const energyValues = dataPoints.filter(d => d.energy).map(d => d.energy)
  const stressValues = dataPoints.filter(d => d.stress).map(d => d.stress)
  
  const avgMood = moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : null
  const avgEnergy = energyValues.length > 0 ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length : null
  const avgStress = stressValues.length > 0 ? stressValues.reduce((a, b) => a + b, 0) / stressValues.length : null

  // Calculate trend (simple linear regression on mood)
  let moodTrend = 'stable'
  if (moodValues.length >= 3) {
    const firstHalf = moodValues.slice(0, Math.floor(moodValues.length / 2))
    const secondHalf = moodValues.slice(Math.floor(moodValues.length / 2))
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    if (secondAvg > firstAvg + 0.5) moodTrend = 'improving'
    else if (secondAvg < firstAvg - 0.5) moodTrend = 'declining'
  }

  // Find best and challenging days
  const sortedByMood = dataPoints.filter(d => d.mood).sort((a, b) => b.mood - a.mood)
  const bestDays = sortedByMood.slice(0, 3).map(d => ({
    date: d.date,
    mood: d.mood,
    energy: d.energy,
    stress: d.stress
  }))
  
  const challengingDays = sortedByMood.slice(-3).reverse().map(d => ({
    date: d.date,
    mood: d.mood,
    energy: d.energy,
    stress: d.stress
  }))

  // Extract common emotions from AI analysis
  const emotions = new Map()
  dataPoints.forEach(d => {
    if (d.ai_mood_analysis?.dominant_emotion) {
      const emotion = d.ai_mood_analysis.dominant_emotion
      emotions.set(emotion, (emotions.get(emotion) || 0) + 1)
    }
  })
  
  const commonEmotions = Array.from(emotions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion, count]) => ({ emotion, count }))

  // Extract recurring themes from tags
  const themes = new Map()
  dataPoints.forEach(d => {
    if (d.tags && Array.isArray(d.tags)) {
      d.tags.forEach((tag: string) => {
        themes.set(tag, (themes.get(tag) || 0) + 1)
      })
    }
  })
  
  const recurringThemes = Array.from(themes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme, count]) => ({ theme, count }))

  // Calculate consistency score (how often user logs data)
  const totalDays = Math.max(1, (new Date(dataPoints[dataPoints.length - 1]?.date || new Date()).getTime() - 
                                 new Date(dataPoints[0]?.date || new Date()).getTime()) / (1000 * 60 * 60 * 24))
  const consistencyScore = Math.round((dataPoints.length / totalDays) * 100)

  // Generate personalized recommendations
  const recommendations = generateRecommendations(avgMood, avgEnergy, avgStress, moodTrend, consistencyScore)

  return {
    summary: {
      total_entries: dataPoints.length,
      average_mood: avgMood ? Math.round(avgMood * 10) / 10 : null,
      average_energy: avgEnergy ? Math.round(avgEnergy * 10) / 10 : null,
      average_stress: avgStress ? Math.round(avgStress * 10) / 10 : null,
      mood_trend: moodTrend,
      consistency_score: consistencyScore
    },
    patterns: {
      best_days: bestDays,
      challenging_days: challengingDays,
      common_emotions: commonEmotions,
      recurring_themes: recurringThemes
    },
    recommendations
  }
}

function generateRecommendations(avgMood: number | null, avgEnergy: number | null, avgStress: number | null, trend: string, consistency: number): string[] {
  const recommendations: string[] = []
  
  // Consistency recommendations
  if (consistency < 50) {
    recommendations.push('حاول تسجيل مزاجك يومياً للحصول على رؤى أعمق عن أنماطك الشخصية')
  }
  
  // Mood-based recommendations
  if (avgMood !== null) {
    if (avgMood < 5) {
      recommendations.push('متوسط مزاجك منخفض. فكر في التحدث مع مستشار أو ممارسة تقنيات الاسترخاء')
      recommendations.push('جرب ممارسة الامتنان يومياً - اكتب 3 أشياء تشعر بالامتنان لها')
    } else if (avgMood >= 7) {
      recommendations.push('مزاجك ممتاز! حافظ على العادات التي تساهم في سعادتك')
    }
  }
  
  // Energy recommendations
  if (avgEnergy !== null) {
    if (avgEnergy < 5) {
      recommendations.push('مستوى طاقتك منخفض. تأكد من الحصول على نوم كافٍ وممارسة الرياضة')
      recommendations.push('فكر في تحسين نظامك الغذائي وتناول المزيد من الماء')
    }
  }
  
  // Stress recommendations
  if (avgStress !== null) {
    if (avgStress > 6) {
      recommendations.push('مستوى التوتر مرتفع. جرب تقنيات إدارة التوتر مثل التأمل أو التنفس العميق')
      recommendations.push('حدد مصادر التوتر وفكر في طرق للتعامل معها بشكل صحي')
    }
  }
  
  // Trend-based recommendations
  if (trend === 'declining') {
    recommendations.push('لاحظنا انخفاضاً في مزاجك مؤخراً. قد يكون من المفيد مراجعة التغييرات الأخيرة في حياتك')
  } else if (trend === 'improving') {
    recommendations.push('مزاجك يتحسن! حدد ما الذي يعمل بشكل جيد واستمر في فعله')
  }
  
  // General recommendations
  if (recommendations.length < 3) {
    recommendations.push('استمر في التأمل الذاتي والكتابة - إنها أدوات قوية للنمو الشخصي')
    recommendations.push('شارك مشاعرك مع الأشخاص المقربين منك')
  }
  
  return recommendations.slice(0, 5) // Limit to 5 recommendations
}
