import {
  FinancialSnapshot,
  FinancialAnalysis,
  Warning,
  Recommendation,
  Insight
} from './types';

export function generateInsights(params: {
  snapshot: FinancialSnapshot;
  analysis: Omit<FinancialAnalysis, 'warnings' | 'recommendations' | 'insights'>;
  warnings: Warning[];
  recommendations: Recommendation[];
}): Insight[] {
  const insights: Insight[] = [];

  if (params.analysis.savingRate > 20) {
    insights.push({
      tone: 'positive',
      messageHT: 'Ou gen yon bon rit epay. Kontinye konsa!',
      messageFR: 'Vous avez un excellent taux d\'épargne. Continuez ainsi!',
      messageEN: 'You have an excellent saving rate. Keep it up!',
    });
  }

  if (params.analysis.expenseRatio < 70) {
    insights.push({
      tone: 'positive',
      messageHT: 'Ou kontwòl depans ou byen. Ou gen disiplin!',
      messageFR: 'Vous contrôlez bien vos dépenses. Vous avez de la discipline!',
      messageEN: 'You control your expenses well. You have discipline!',
    });
  }

  if (params.warnings.some(w => w.severity === 'critical')) {
    insights.push({
      tone: 'warning',
      messageHT: 'Ou gen alèz kritik. Agis rapideman!',
      messageFR: 'Vous avez des alertes critiques. Agissez rapidement!',
      messageEN: 'You have critical warnings. Act quickly!',
    });
  }

  if (params.analysis.emergencyFund.isAdequate) {
    insights.push({
      tone: 'positive',
      messageHT: 'Fon irjans ou an bon eta. Ou pwoteje kont risk!',
      messageFR: 'Votre fonds d\'urgence est en bon état. Vous êtes protégé contre les risques!',
      messageEN: 'Your emergency fund is in good shape. You are protected against risks!',
    });
  }

  if (params.analysis.savings.goals.length > 0 && params.analysis.savings.goals.every(g => g.isOnTrack)) {
    insights.push({
      tone: 'positive',
      messageHT: 'Tout objektif ou yo an bon wout. Kontinye konsa!',
      messageFR: 'Tous vos objectifs sont sur la bonne voie. Continuez ainsi!',
      messageEN: 'All your goals are on track. Keep it up!',
    });
  }

  return insights;
}
