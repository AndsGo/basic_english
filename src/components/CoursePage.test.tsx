import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { week1Course } from '../content/week1';
import { CoursePage } from './CoursePage';

afterEach(() => cleanup());

describe('CoursePage', () => {
  it('shows week progress, review count, and course day states', () => {
    render(
      <CoursePage
        course={week1Course}
        completedDayIds={['day-001']}
        activeReviewDayIds={['day-001']}
        reviewCount={1}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getByText('1 / 7 days completed')).toBeInTheDocument();
    expect(screen.getByText('Review: 1 item')).toBeInTheDocument();
    expect(screen.getByText('Review needed')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getAllByText('Locked').length).toBeGreaterThan(0);
  });

  it('counts review items separately from review-needed days', () => {
    render(
      <CoursePage
        course={week1Course}
        completedDayIds={['day-001']}
        activeReviewDayIds={['day-001']}
        reviewCount={2}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getByText('Review: 2 items')).toBeInTheDocument();
    expect(screen.getByText('Review needed')).toBeInTheDocument();
  });
});
