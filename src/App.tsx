import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { CoursePage } from './components/CoursePage';
import { Layout, type TabId } from './components/Layout';
import { MePage } from './components/MePage';
import { ReviewPage } from './components/ReviewPage';
import { TodayPage } from './components/TodayPage';
import { basicEnglishCourse } from './content/course';
import { pictureDescribeTasksByDayId } from './content/pictureDescribeTasks';
import { scenarioCapabilities } from './content/scenarioCapabilities';
import { sceneRemixTasksByDayId } from './content/sceneRemixTasks';
import { sceneGoalsByDayId } from './content/sceneGoals';
import { getActiveReviewDayIds, selectDueReviewItems } from './domain/review';
import { SpeechProvider } from './speech/SpeechProvider';
import type { SpeechRate } from './speech/speechService';
import { resolveEffectiveTheme, type ThemePreference } from './theme';
import { createIndexedDbProgressRepository } from './storage/indexedDbProgressRepository';

const WordsPage = lazy(() => import('./components/WordsPage').then((module) => ({ default: module.WordsPage })));

const CHINESE_HELP_STORAGE_KEY = 'basic-english-show-chinese-help';
const READING_ENABLED_STORAGE_KEY = 'basic-english-reading-enabled';
const READING_RATE_STORAGE_KEY = 'basic-english-reading-rate';
const THEME_STORAGE_KEY = 'basic-english-theme';

function safeGetLocalStorageItem(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Keep the in-memory setting when persistence is unavailable.
  }
}

function readInitialChineseHelpSetting() {
  return safeGetLocalStorageItem(CHINESE_HELP_STORAGE_KEY) === 'true';
}

function readInitialReadingEnabledSetting() {
  return safeGetLocalStorageItem(READING_ENABLED_STORAGE_KEY) !== 'false';
}

function readInitialSpeechRateSetting(): SpeechRate {
  return safeGetLocalStorageItem(READING_RATE_STORAGE_KEY) === 'slow' ? 'slow' : 'normal';
}

function readInitialThemePreference(): ThemePreference {
  const stored = safeGetLocalStorageItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [showChineseHelp, setShowChineseHelp] = useState(readInitialChineseHelpSetting);
  const [readingEnabled, setReadingEnabled] = useState(readInitialReadingEnabledSetting);
  const [speechRate, setSpeechRate] = useState<SpeechRate>(readInitialSpeechRateSetting);
  const [themePreference, setThemePreference] = useState<ThemePreference>(readInitialThemePreference);
  const [reviewCount, setReviewCount] = useState(0);
  const [completedDayIds, setCompletedDayIds] = useState<string[]>([]);
  const [activeReviewDayIds, setActiveReviewDayIds] = useState<string[]>([]);
  const repository = useMemo(() => createIndexedDbProgressRepository(), []);

  const refreshProgressSummary = async () => {
    const [dayProgress, activeReviews] = await Promise.all([
      repository.listDayProgress(),
      repository.listReviewItems('active'),
    ]);
    setCompletedDayIds(
      dayProgress
        .filter((progress) => progress.status === 'completed' || progress.currentStep === 'done')
        .map((progress) => progress.dayId),
    );
    const dueReviews = selectDueReviewItems(activeReviews, new Date().toISOString());
    setReviewCount(dueReviews.length);
    setActiveReviewDayIds(getActiveReviewDayIds(dueReviews));
  };

  useEffect(() => {
    void refreshProgressSummary();
  }, [repository]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    void refreshProgressSummary();
  };

  useEffect(() => {
    safeSetLocalStorageItem(CHINESE_HELP_STORAGE_KEY, String(showChineseHelp));
  }, [showChineseHelp]);

  useEffect(() => {
    safeSetLocalStorageItem(READING_ENABLED_STORAGE_KEY, String(readingEnabled));
  }, [readingEnabled]);

  useEffect(() => {
    safeSetLocalStorageItem(READING_RATE_STORAGE_KEY, speechRate);
  }, [speechRate]);

  useEffect(() => {
    safeSetLocalStorageItem(THEME_STORAGE_KEY, themePreference);

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.dataset.theme = resolveEffectiveTheme(themePreference, darkQuery.matches);
    };
    applyTheme();

    if (themePreference !== 'system') return;
    darkQuery.addEventListener('change', applyTheme);
    return () => darkQuery.removeEventListener('change', applyTheme);
  }, [themePreference]);

  return (
    <SpeechProvider enabled={readingEnabled} rate={speechRate}>
      <Layout activeTab={activeTab} onTabChange={handleTabChange} reviewCount={reviewCount}>
        {activeTab === 'today' && (
          <TodayPage
            course={basicEnglishCourse}
            repository={repository}
            sceneGoalsByDayId={sceneGoalsByDayId}
            sceneRemixTasksByDayId={sceneRemixTasksByDayId}
            pictureDescribeTasksByDayId={pictureDescribeTasksByDayId}
            showChineseHelp={showChineseHelp}
            onProgressChange={() => void refreshProgressSummary()}
          />
        )}
        {activeTab === 'course' && (
          <CoursePage
            course={basicEnglishCourse}
            completedDayIds={completedDayIds}
            activeReviewDayIds={activeReviewDayIds}
            reviewCount={reviewCount}
            onStartDay={() => handleTabChange('today')}
          />
        )}
        {activeTab === 'review' && (
          <ReviewPage repository={repository} onStartToday={() => handleTabChange('today')} onReviewChange={() => void refreshProgressSummary()} />
        )}
        {activeTab === 'words' && (
          <Suspense fallback={<section className="panel">Loading Words...</section>}>
            <WordsPage
              course={basicEnglishCourse}
              repository={repository}
              showChineseHelp={showChineseHelp}
              onProgressChange={() => void refreshProgressSummary()}
            />
          </Suspense>
        )}
        {activeTab === 'me' && (
          <MePage
            repository={repository}
            scenarioCapabilities={scenarioCapabilities}
            sceneGoalsByDayId={sceneGoalsByDayId}
            pictureDescribeTasksByDayId={pictureDescribeTasksByDayId}
            showChineseHelp={showChineseHelp}
            onShowChineseHelpChange={setShowChineseHelp}
            readingEnabled={readingEnabled}
            onReadingEnabledChange={setReadingEnabled}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
            themePreference={themePreference}
            onThemePreferenceChange={setThemePreference}
            totalDayCount={basicEnglishCourse.weeks.flatMap((week) => week.days).length}
          />
        )}
      </Layout>
    </SpeechProvider>
  );
}
