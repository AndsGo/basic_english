import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { week1Course } from '../content/week1';
import { CoursePage } from './CoursePage';

describe('CoursePage', () => {
  it('shows week progress, review count, and course day states', () => {
    render(
      <CoursePage
        course={week1Course}
        completedDayIds={['day-001']}
        activeReviewDayIds={['day-001']}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getByText('1 / 7 days completed')).toBeInTheDocument();
    expect(screen.getByText('Review: 1 item')).toBeInTheDocument();
    expect(screen.getByText('Review needed')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getAllByText('Locked').length).toBeGreaterThan(0);
  });
});
