import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  haversineKm, calcPolygonScore, calcProximityScore,
  isProximityCorrect, TOTAL_TIME,
} from '../utils/gameLogic';
import { updateStats } from '../utils/storage';
import type { GeoDistrictFeature } from '../types';

const MAX_ATTEMPTS = 3; // Seterra: auto-reveal after this many wrong tries

export function useGame() {
  const game = useGameStore();
  const { difficulty } = useSettingsStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // waitingRef = true: question resolved, timer stopped, waiting to advance
  const waitingRef = useRef(false);
  // feedbackRef = true: showing brief wrong flash, timer keeps ticking, clicks blocked
  const feedbackRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const advance = useCallback(() => {
    clearTimer();
    waitingRef.current = false;
    feedbackRef.current = false;
    const { currentIndex, questions } = useGameStore.getState();
    if (currentIndex + 1 >= questions.length) {
      finalizeGame();
    } else {
      game.nextQuestion();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const finalizeGame = useCallback(() => {
    const { answers, currentStreak } = useGameStore.getState();
    const correct = answers.filter(a => a.correct).length;
    const wrong = answers.filter(a => !a.correct).length;
    const timeSec = answers.reduce((s, a) => s + a.timeUsed, 0);
    const score = Math.max(0, useGameStore.getState().score);
    const mode = useGameStore.getState().mode;
    updateStats(score, correct, wrong, timeSec, mode, difficulty, currentStreak);
    game.endGame();
  }, [difficulty]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer — only paused by waitingRef, NOT feedbackRef (brief wrong flash lets timer tick)
  useEffect(() => {
    if (game.status !== 'playing' || waitingRef.current) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      const { timeLeft, status } = useGameStore.getState();
      if (status !== 'playing' || waitingRef.current) { clearTimer(); return; }
      if (timeLeft <= 1) {
        clearTimer();
        handleTimeout();
      } else {
        game.tickTimer();
      }
    }, 1000);
    return clearTimer;
  }, [game.status, game.currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimeout = useCallback(() => {
    if (waitingRef.current) return;
    // If brief feedback is active when timer fires, cancel the brief feedback
    feedbackRef.current = false;
    waitingRef.current = true;

    const { questions, currentIndex } = useGameStore.getState();
    const q = questions[currentIndex];
    const correctId = q?.correctDistrictId ?? q?.correctProvinceId ?? q?.targetId;

    game.addAnswer({
      questionId: q?.id ?? '',
      correct: false,
      timeUsed: TOTAL_TIME[difficulty],
      pointsEarned: 0,
    });
    if (correctId) game.revealRegion(correctId, 'missed');
    game.setFeedback('wrong', correctId, undefined);
    setTimeout(() => { game.clearFeedback(); advance(); }, 2000);
  }, [difficulty, advance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Province click (provinces, mountains, rivers, etc.)
  const handleProvinceClick = useCallback((feature: GeoDistrictFeature) => {
    if (waitingRef.current || feedbackRef.current || game.status !== 'playing') return;

    const { questions, currentIndex, timeLeft, questionAttempts } = useGameStore.getState();
    const { gameStrategy } = useSettingsStore.getState();
    const q = questions[currentIndex];
    const clickedProvince = feature.properties.provinceId;
    const correct = clickedProvince === q.correctProvinceId;
    const timeUsed = TOTAL_TIME[difficulty] - timeLeft;

    if (correct) {
      waitingRef.current = true;
      feedbackRef.current = true;
      clearTimer();
      const points = calcPolygonScore(true, timeLeft, TOTAL_TIME[difficulty], difficulty);
      game.addAnswer({ questionId: q.id, correct: true, timeUsed, pointsEarned: points, attempts: questionAttempts + 1 });
      game.revealRegion(q.correctProvinceId!, 'correct');
      game.setFeedback('correct', q.correctProvinceId ?? undefined, undefined);
      setTimeout(() => { game.clearFeedback(); advance(); }, 1200);
      return;
    }

    // Wrong click
    if (gameStrategy === 'seterra') {
      const newAttempts = questionAttempts + 1;
      game.addAttempt();

      if (newAttempts >= MAX_ATTEMPTS) {
        // 3rd wrong attempt — auto-reveal
        waitingRef.current = true;
        feedbackRef.current = true;
        clearTimer();
        game.addAnswer({ questionId: q.id, correct: false, timeUsed, pointsEarned: 0, attempts: newAttempts });
        game.revealRegion(q.correctProvinceId!, 'missed');
        game.setFeedback('wrong', q.correctProvinceId ?? undefined, feature.properties.id);
        setTimeout(() => { game.clearFeedback(); advance(); }, 2500);
      } else {
        // Brief flash — timer keeps ticking, question stays
        feedbackRef.current = true;
        game.setFeedback('wrong', undefined, feature.properties.id);
        setTimeout(() => {
          if (!waitingRef.current) {
            game.clearFeedback();
            feedbackRef.current = false;
          }
        }, 900);
      }
    } else {
      // WorldGeo — unlimited attempts, brief flash, stay on question
      feedbackRef.current = true;
      game.setFeedback('wrong', undefined, feature.properties.id);
      setTimeout(() => {
        if (!waitingRef.current) {
          game.clearFeedback();
          feedbackRef.current = false;
        }
      }, 700);
    }
  }, [game, difficulty, advance]); // eslint-disable-line react-hooks/exhaustive-deps

  // District click
  const handleDistrictClick = useCallback((feature: GeoDistrictFeature) => {
    if (waitingRef.current || feedbackRef.current || game.status !== 'playing') return;

    const { questions, currentIndex, timeLeft, questionAttempts } = useGameStore.getState();
    const { gameStrategy } = useSettingsStore.getState();
    const q = questions[currentIndex];
    const correct = feature.properties.id === q.correctDistrictId;
    const timeUsed = TOTAL_TIME[difficulty] - timeLeft;

    if (correct) {
      waitingRef.current = true;
      feedbackRef.current = true;
      clearTimer();
      const points = calcPolygonScore(true, timeLeft, TOTAL_TIME[difficulty], difficulty);
      game.addAnswer({ questionId: q.id, correct: true, timeUsed, pointsEarned: points, attempts: questionAttempts + 1 });
      game.revealRegion(q.correctDistrictId!, 'correct');
      game.setFeedback('correct', q.correctDistrictId ?? undefined, undefined);
      setTimeout(() => { game.clearFeedback(); advance(); }, 1200);
      return;
    }

    // Wrong click
    if (gameStrategy === 'seterra') {
      const newAttempts = questionAttempts + 1;
      game.addAttempt();

      if (newAttempts >= MAX_ATTEMPTS) {
        waitingRef.current = true;
        feedbackRef.current = true;
        clearTimer();
        game.addAnswer({ questionId: q.id, correct: false, timeUsed, pointsEarned: 0, attempts: newAttempts });
        game.revealRegion(q.correctDistrictId!, 'missed');
        game.setFeedback('wrong', q.correctDistrictId ?? undefined, feature.properties.id);
        setTimeout(() => { game.clearFeedback(); advance(); }, 2500);
      } else {
        feedbackRef.current = true;
        game.setFeedback('wrong', undefined, feature.properties.id);
        setTimeout(() => {
          if (!waitingRef.current) {
            game.clearFeedback();
            feedbackRef.current = false;
          }
        }, 900);
      }
    } else {
      feedbackRef.current = true;
      game.setFeedback('wrong', undefined, feature.properties.id);
      setTimeout(() => {
        if (!waitingRef.current) {
          game.clearFeedback();
          feedbackRef.current = false;
        }
      }, 700);
    }
  }, [game, difficulty, advance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Location click (capitals / cities)
  const handleLocationClick = useCallback((lat: number, lng: number) => {
    if (waitingRef.current || feedbackRef.current || game.status !== 'playing') return;
    waitingRef.current = true;
    feedbackRef.current = true;
    clearTimer();

    const { questions, currentIndex, timeLeft } = useGameStore.getState();
    const q = questions[currentIndex];
    if (!q.coords) {
      waitingRef.current = false;
      feedbackRef.current = false;
      advance();
      return;
    }

    const [tLng, tLat] = q.coords;
    const dist = haversineKm(lat, lng, tLat, tLng);
    const correct = isProximityCorrect(dist, difficulty);
    const timeUsed = TOTAL_TIME[difficulty] - timeLeft;
    const points = calcProximityScore(dist, timeLeft, TOTAL_TIME[difficulty], difficulty);

    game.addAnswer({
      questionId: q.id, correct, timeUsed,
      pointsEarned: correct ? points : 0,
      distanceKm: Math.round(dist),
    });
    if (correct && q.correctProvinceId) game.revealRegion(q.correctProvinceId, 'correct');
    game.setFeedback(
      correct ? 'correct' : 'wrong',
      q.correctProvinceId || q.targetId,
      undefined,
    );
    setTimeout(() => { game.clearFeedback(); advance(); }, correct ? 1500 : 2500);
  }, [game, difficulty, advance]); // eslint-disable-line react-hooks/exhaustive-deps

  return { handleProvinceClick, handleDistrictClick, handleLocationClick };
}
