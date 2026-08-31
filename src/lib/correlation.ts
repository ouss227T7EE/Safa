import { AttentionTestResult, DailyLog } from '../types';

export interface PairedDataPoint {
  date: string;
  screenTimeMinutes: number;
  score: number;
  commissionErrors?: number;
  meanRT?: number | null;
}

export interface CorrelationAnalysis {
  pairedCount: number;
  points: PairedDataPoint[];
  pearsonR: number | null;
  rFormatted: string;
  direction: 'negative' | 'positive' | 'neutral' | 'insufficient';
  strength: 'strong' | 'moderate' | 'weak' | 'none' | 'insufficient';
  slopePerHour: number | null;
  meanScreenTime: number;
  meanScore: number;
  minScreenTime: number;
  maxScreenTime: number;
  insightAr: string;
  insightEn: string;
}

// Sample benchmark data derived from PNAS Nexus 14-day cognitive study
export const BENCHMARK_PAIRED_DATA: PairedDataPoint[] = [
  { date: 'Day 1', screenTimeMinutes: 390, score: 48, commissionErrors: 6, meanRT: 380 },
  { date: 'Day 3', screenTimeMinutes: 340, score: 55, commissionErrors: 5, meanRT: 360 },
  { date: 'Day 6', screenTimeMinutes: 280, score: 64, commissionErrors: 4, meanRT: 345 },
  { date: 'Day 9', screenTimeMinutes: 210, score: 73, commissionErrors: 3, meanRT: 320 },
  { date: 'Day 12', screenTimeMinutes: 160, score: 82, commissionErrors: 2, meanRT: 310 },
  { date: 'Day 14', screenTimeMinutes: 120, score: 89, commissionErrors: 1, meanRT: 295 },
];

/**
 * Pairs daily screen time logs with the closest SART attention test score
 */
export function extractPairedData(
  dailyLogs: Record<string, DailyLog>,
  attentionTests: AttentionTestResult[]
): PairedDataPoint[] {
  const paired: PairedDataPoint[] = [];

  const sortedDates = Object.keys(dailyLogs).sort();

  for (const dateKey of sortedDates) {
    const log = dailyLogs[dateKey];
    if (log && typeof log.screenTimeMinutes === 'number' && log.screenTimeMinutes >= 0) {
      // 1. Look for exact date match
      const exactMatch = attentionTests.find((t) => t.date === dateKey);
      if (exactMatch) {
        paired.push({
          date: dateKey,
          screenTimeMinutes: log.screenTimeMinutes,
          score: exactMatch.score,
          commissionErrors: exactMatch.commissionErrors,
          meanRT: exactMatch.meanRT,
        });
      } else if (attentionTests.length > 0) {
        // 2. Look for closest test in chronological time
        const logTime = new Date(dateKey).getTime();
        let closestTest: AttentionTestResult | null = null;
        let minDiff = Infinity;

        for (const test of attentionTests) {
          const testTime = test.timestamp || new Date(test.date).getTime();
          const diff = Math.abs(testTime - logTime);
          // Only pair within 48 hours
          if (diff < minDiff && diff <= 48 * 60 * 60 * 1000) {
            minDiff = diff;
            closestTest = test;
          }
        }

        if (closestTest) {
          // Avoid duplicate pairing for the same test on same date
          if (!paired.some((p) => p.date === dateKey)) {
            paired.push({
              date: dateKey,
              screenTimeMinutes: log.screenTimeMinutes,
              score: closestTest.score,
              commissionErrors: closestTest.commissionErrors,
              meanRT: closestTest.meanRT,
            });
          }
        }
      }
    }
  }

  return paired;
}

/**
 * Computes Pearson correlation coefficient and linear slope
 */
export function computeCorrelation(points: PairedDataPoint[]): CorrelationAnalysis {
  if (points.length < 2) {
    return {
      pairedCount: points.length,
      points,
      pearsonR: null,
      rFormatted: '—',
      direction: 'insufficient',
      strength: 'insufficient',
      slopePerHour: null,
      meanScreenTime: points[0]?.screenTimeMinutes || 0,
      meanScore: points[0]?.score || 0,
      minScreenTime: points[0]?.screenTimeMinutes || 0,
      maxScreenTime: points[0]?.screenTimeMinutes || 0,
      insightAr: 'بيانات غير كافية لحساب معامل الارتباط. سجّل على الأقل يومين مع اختبارين لمشاهدة التحليل الإحصائي.',
      insightEn: 'Insufficient paired data. Log at least two days with SART tests to compute the empirical correlation.',
    };
  }

  const n = points.length;
  const x = points.map((p) => p.screenTimeMinutes);
  const y = points.map((p) => p.score);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const r = denomX > 0 && denomY > 0 ? numerator / Math.sqrt(denomX * denomY) : 0;
  const slope = denomX > 0 ? numerator / denomX : 0; // delta score per minute
  const slopePerHour = Math.round(slope * 60 * 10) / 10; // delta score per 60 mins

  let direction: CorrelationAnalysis['direction'] = 'neutral';
  let strength: CorrelationAnalysis['strength'] = 'none';

  if (r <= -0.6) {
    direction = 'negative';
    strength = 'strong';
  } else if (r <= -0.25) {
    direction = 'negative';
    strength = 'moderate';
  } else if (r >= 0.6) {
    direction = 'positive';
    strength = 'strong';
  } else if (r >= 0.25) {
    direction = 'positive';
    strength = 'moderate';
  } else {
    direction = 'neutral';
    strength = 'weak';
  }

  let insightAr = '';
  let insightEn = '';

  if (direction === 'negative') {
    insightAr = `ارتباط عكسي واضح (r = ${r.toFixed(2)}): كلما انخفض وقت الشاشة اليومي، ارتفعت درجات الانتباه SART وتراجعت أخطاء التشتت بمعدل تقديري ${Math.abs(slopePerHour)} نقطة لكل ساعة شاشة تُقلصها.`;
    insightEn = `Strong Inverse Correlation (r = ${r.toFixed(2)}): Lower daily screen time strongly associates with higher SART focus scores, reflecting an estimated +${Math.abs(slopePerHour)} pts per hour of screen time reduced.`;
  } else if (direction === 'positive') {
    insightAr = `ارتباط طردي (r = ${r.toFixed(2)}): لم يظهر أثر سلبي مباشر لوقت الشاشة على درجاتك الحالية، استمر بالتسجيل لزيادة دقة النموذج.`;
    insightEn = `Direct correlation (r = ${r.toFixed(2)}): Focus scores remained resilient across logged screen times; continue logging for higher confidence.`;
  } else {
    insightAr = `ارتباط محايد / ضعيف (r = ${r.toFixed(2)}): البيانات حتى الآن تظهر تشتتًا متوازنًا، أضف المزيد من الجلسات لتحديد الاتجاه المعرفي الدقيق.`;
    insightEn = `Neutral correlation (r = ${r.toFixed(2)}): Variance is balanced across sessions; record additional logs to establish definitive directional trends.`;
  }

  return {
    pairedCount: n,
    points,
    pearsonR: Math.round(r * 100) / 100,
    rFormatted: (r >= 0 ? '+' : '') + r.toFixed(2),
    direction,
    strength,
    slopePerHour,
    meanScreenTime: Math.round(meanX),
    meanScore: Math.round(meanY),
    minScreenTime: Math.min(...x),
    maxScreenTime: Math.max(...x),
    insightAr,
    insightEn,
  };
}
