import { useEffect, useMemo, useState } from 'react';
import { CoursePage } from './components/CoursePage';
import { Layout, type TabId } from './components/Layout';
import { MePage } from './components/MePage';
import { ReviewPage } from './components/ReviewPage';
import { TodayPage } from './components/TodayPage';
import { WordsPage } from './components/WordsPage';
import { week1Course } from './content/week1';
import { getActiveReviewDayIds } from './domain/review';
import { SpeechProvider } from './speech/SpeechProvider';
import type { SpeechRate } from './speech/speechService';
import { createIndexedDbProgressRepository } from './storage/indexedDbProgressRepository';

const CHINESE_HELP_STORAGE_KEY = 'basic-english-show-chinese-help';
const READING_ENABLED_STORAGE_KEY = 'basic-english-reading-enabled';
const READING_RATE_STORAGE_KEY = 'basic-english-reading-rate';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [showChineseHelp, setShowChineseHelp] = useState(readInitialChineseHelpSetting);
  const [readingEnabled, setReadingEnabled] = useState(readInitialReadingEnabledSetting);
  const [speechRate, setSpeechRate] = useState<SpeechRate>(readInitialSpeechRateSetting);
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
    setReviewCount(activeReviews.length);
    setActiveReviewDayIds(getActiveReviewDayIds(activeReviews));
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

  return (
    <SpeechProvider enabled={readingEnabled} rate={speechRate}>
      <Layout activeTab={activeTab} onTabChange={handleTabChange} reviewCount={reviewCount}>
        {activeTab === 'today' && (
          <TodayPage
            course={week1Course}
            repository={repository}
            showChineseHelp={showChineseHelp}
            onProgressChange={() => void refreshProgressSummary()}
          />
        )}
        {activeTab === 'course' && (
          <CoursePage
            course={week1Course}
            completedDayIds={completedDayIds}
            activeReviewDayIds={activeReviewDayIds}
            reviewCount={reviewCount}
            onStartDay={() => handleTabChange('today')}
          />
        )}
        {activeTab === 'review' && (
          <ReviewPage repository={repository} onStartToday={() => handleTabChange('today')} onReviewChange={() => void refreshProgressSummary()} />
        )}
        {activeTab === 'words' && <WordsPage course={week1Course} showChineseHelp={showChineseHelp} />}
        {activeTab === 'me' && (
          <MePage
            repository={repository}
            showChineseHelp={showChineseHelp}
            onShowChineseHelpChange={setShowChineseHelp}
            readingEnabled={readingEnabled}
            onReadingEnabledChange={setReadingEnabled}
            speechRate={speechRate}
            onSpeechRateChange={setSpeechRate}
          />
        )}
      </Layout>
    </SpeechProvider>
  );
}
