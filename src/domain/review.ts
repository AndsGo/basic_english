export interface ReviewWordState {
  wordId: string;
  status: 'new' | 'seen' | 'review' | 'known' | 'mastered';
  lastSeenAt?: string;
}

const statusRank: Record<ReviewWordState['status'], number> = {
  review: 0,
  seen: 1,
  known: 2,
  new: 3,
  mastered: 4,
};

export function selectReviewWordIds(words: ReviewWordState[], count: number): string[] {
  return [...words]
    .sort((a, b) => {
      const byStatus = statusRank[a.status] - statusRank[b.status];
      if (byStatus !== 0) return byStatus;

      return (a.lastSeenAt ?? '').localeCompare(b.lastSeenAt ?? '');
    })
    .slice(0, count)
    .map((word) => word.wordId);
}
