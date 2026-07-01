import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import { week1Course } from '../content/week1';
import { CoursePage } from './CoursePage';

afterEach(() => cleanup());

describe('CoursePage', () => {
  const allBasicEnglishDays = basicEnglishCourse.weeks.flatMap((week) => week.days);

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

    expect(screen.getByRole('heading', { name: 'Week 1: Persons and Basic Sentences' })).toBeInTheDocument();
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

  it('makes Day 42 current after the first 41 days are complete', () => {
    const completedThroughDay41 = allBasicEnglishDays.filter((day) => day.dayNumber < 42).map((day) => day.id);

    render(
      <CoursePage
        course={basicEnglishCourse}
        completedDayIds={completedThroughDay41}
        activeReviewDayIds={[]}
        reviewCount={0}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getAllByText('7 / 7 days completed')).toHaveLength(5);
    expect(screen.getByText('6 / 7 days completed')).toBeInTheDocument();

    const day42Card = screen.getByText('Day 42: Week 6 Story').closest('article');
    expect(day42Card).not.toBeNull();
    expect(within(day42Card!).getByText('Current')).toBeInTheDocument();
    expect(within(day42Card!).getByRole('button', { name: 'Open Today' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Open Today' })).toHaveLength(1);
  });

  it('makes Day 49 current after the first 48 days are complete', () => {
    const completedThroughDay48 = allBasicEnglishDays.filter((day) => day.dayNumber < 49).map((day) => day.id);

    render(
      <CoursePage
        course={basicEnglishCourse}
        completedDayIds={completedThroughDay48}
        activeReviewDayIds={[]}
        reviewCount={0}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getAllByText('7 / 7 days completed')).toHaveLength(6);
    expect(screen.getByText('6 / 7 days completed')).toBeInTheDocument();

    const day49Card = screen.getByText('Day 49: Week 7 Care Story').closest('article');
    expect(day49Card).not.toBeNull();
    expect(within(day49Card!).getByText('Current')).toBeInTheDocument();
    expect(within(day49Card!).getByRole('button', { name: 'Open Today' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Open Today' })).toHaveLength(1);
  });

  it('shows all twelve weeks complete after Day 84 is complete', () => {
    render(
      <CoursePage
        course={basicEnglishCourse}
        completedDayIds={allBasicEnglishDays.map((day) => day.id)}
        activeReviewDayIds={[]}
        reviewCount={0}
        onStartDay={vi.fn()}
      />,
    );

    expect(screen.getAllByText('7 / 7 days completed')).toHaveLength(12);
    expect(screen.queryByRole('button', { name: 'Open Today' })).not.toBeInTheDocument();

    const day84Card = screen.getByText('Day 84: Week 12 Time Story').closest('article');
    expect(day84Card).not.toBeNull();
    expect(within(day84Card!).getByText('Completed')).toBeInTheDocument();
  });
});
