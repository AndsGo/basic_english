import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
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
    expect(screen.queryByRole('button', { name: 'Review Day' })).not.toBeInTheDocument();
  });

  it('locks Week 2 until Week 1 is complete', () => {
    render(
      <CoursePage
        course={basicEnglishCourse}
        completedDayIds={[]}
        activeReviewDayIds={[]}
        reviewCount={0}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Week 1: People, Identity, and Basic Sentences' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Week 2: Home & Things' })).toBeInTheDocument();
    expect(screen.getAllByText('0 / 7 days completed')).toHaveLength(basicEnglishCourse.weeks.length);

    const day8Card = screen.getByText('Day 8: My Room').closest('article');
    expect(day8Card).not.toBeNull();
    expect(within(day8Card!).getByText('Locked')).toBeInTheDocument();
    expect(within(day8Card!).getByText('Complete Week 1 to unlock Home & Things.')).toBeInTheDocument();
    expect(within(day8Card!).queryByRole('button', { name: 'Open Today' })).not.toBeInTheDocument();
  });

  it('makes Day 8 current after Week 1 is complete', () => {
    const week1DayIds = basicEnglishCourse.weeks[0].days.map((day) => day.id);

    render(
      <CoursePage
        course={basicEnglishCourse}
        completedDayIds={week1DayIds}
        activeReviewDayIds={[]}
        reviewCount={0}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getByText('7 / 7 days completed')).toBeInTheDocument();
    expect(screen.getAllByText('0 / 7 days completed').length).toBeGreaterThan(0);
    expect(screen.queryByText('Complete Week 1 to unlock Home & Things.')).not.toBeInTheDocument();

    const day8Card = screen.getByText('Day 8: My Room').closest('article');
    expect(day8Card).not.toBeNull();
    expect(within(day8Card!).getByText('Current')).toBeInTheDocument();
    expect(within(day8Card!).getByRole('button', { name: 'Open Today' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Open Today' })).toHaveLength(1);

    const day1Card = screen.getByText('Day 1: My Name').closest('article');
    expect(day1Card).not.toBeNull();
    expect(within(day1Card!).getByText('Completed')).toBeInTheDocument();
    expect(within(day1Card!).queryByRole('button')).not.toBeInTheDocument();
  });
});
