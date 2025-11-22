import { SurveySection } from '@/lib/generatePrompt';

export function formatMarkdown(sections: SurveySection[]): string {
  let globalQuestionIndex = 0;
  
  return sections.map((section) => {
    const sectionContent = section.questions.map((q) => {
      let optionsText = '';

      if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTI_CHOICE') {
        const marker = q.type === 'SINGLE_CHOICE' ? '( )' : '[ ]';
        optionsText = q.options?.map(opt => `- ${marker} ${opt}`).join('\n') || '';
        if (q.config?.allow_other) optionsText += `\n- ${marker} Other...`;
      } else if (q.type === 'LIKERT_SCALE') {
        const min = q.config?.scale_min || 1;
        const max = q.config?.scale_max || 5;
        optionsText = `Scale: ${min} to ${max}`;
        if (q.config?.scale_labels && Array.isArray(q.config.scale_labels)) {
          optionsText += ` (${q.config.scale_labels.join(' ... ')})`;
        }
      } else if (q.type === 'RANK_ORDER') {
        optionsText = q.options?.map((opt, i) => `${i + 1}. ${opt}`).join('\n') || '';
      } else if (q.type === 'NUMERIC_INPUT') {
        optionsText = `> [Number]${q.config?.unit ? ` (${q.config.unit})` : ''}`;
      } else {
        optionsText = '> [Open Answer]';
      }

      const questionNumber = globalQuestionIndex + 1;
      globalQuestionIndex++;
      
      return `### ${questionNumber}. ${q.text}
*Type: ${q.type}*
${optionsText}

> **Rationale:** ${q.rationale}
`;
    }).join('\n---\n\n');
    
    return `## ${section.title}\n\n${sectionContent}`;
  }).join('\n\n---\n\n');
}
