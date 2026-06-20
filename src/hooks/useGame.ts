import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  haversineKm, calcPolygonScore, calcProximityScore,
  isProximityCorrect, TOTAL_TIME,
} from '../utils/gameLogic';
import { updateStats } from '../utils/storage';
import type { GeoDistrictFeature, District } from '../types';

export function useGame() {
  const game = useGameStore();
  const { difficulty } = useSettingsStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waitingRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const advance = useCallback(() => {
    clearTimer();
    waitingRef.current = false;
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

  // Timer effect
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
    waitingRef.current = true;
    const { questions, currentIndex, lives } = useGameStore.getState();
    const q = questions[currentIndex];
    const correctId = q?.correctDistrictId || q?.correctProvinceId || q?.targetId;

    game.addAnswer({
      questionId: q?.id ?? '',
      correct: false,
      timeUsed: TOTAL_TIME[difficulty],
      pointsEarned: -10,
      distanceKm: undefined,
    });
    game.setFeedback('wrong', correctId, undefined);
    game.loseLife();

    if (lives <= 1) { finalizeGame(); return; }
    setTimeout(() => { game.clearFeedback(); advance(); }, 2000);
  }, [difficulty, advance, finalizeGame]); // eslint-disable-line react-hooks/exhaustive-deps

  // Province click
  const handleProvinceClick = useCallback((feature: GeoDistrictFeature) => {
    if (waitingRef.current || game.status !== 'playing') return;
    waitingRef.current = true;
    clearTimer();

    const { questions, currentIndex, timeLeft, lives } = useGameStore.getState();
    const q = questions[currentIndex];
    const clickedProvince = feature.properties.provinceId;
    const correct = clickedProvince === q.correctProvinceId;
    const timeUsed = TOTAL_TIME[difficulty] - timeLeft;
    const points = calcPolygonScore(correct, timeLeft, TOTAL_TIME[difficulty], difficulty);

    game.addAnswer({ questionId: q.id, correct, timeUsed, pointsEarned: correct ? points : -10 });
    game.setFeedback(
      correct ? 'correct' : 'wrong',
      q.correctProvinceId ?? undefined,
      correct ? undefined : feature.properties.id,
    );
    if (!correct) game.loseLife();
    if (!correct && lives <= 1) { finalizeGame(); return; }
    setTimeout(() => { game.clearFeedback(); advance(); }, correct ? 1200 : 2000);
  }, [game, difficulty, advance, finalizeGame]); // eslint-disable-line react-hooks/exhaustive-deps

  // District click
  const handleDistrictClick = useCallback((feature: GeoDistrictFeature) => {
    if (waitingRef.current || game.status !== 'playing') return;
    waitingRef.current = true;
    clearTimer();

    const { questions, currentIndex, timeLeft, lives } = useGameStore.getState();
    const q = questions[currentIndex];
    const correct = feature.properties.id === q.correctDistrictId;
    const timeUsed = TOTAL_TIME[difficulty] - timeLeft;
    const points = calcPolygonScore(correct, timeLeft, TOTAL_TIME[difficulty], difficulty);

    game.addAnswer({ questionId: q.id, correct, timeUsed, pointsEarned: correct ? points : -10 });
    game.setFeedback(
      correct ? 'correct' : 'wrong',
      q.correctDistrictId ?? undefined,
      correct ? undefined : feature.properties.id,
    );
    if (!correct) game.loseLife();
    if (!correct && lives <= 1) { finalizeGame(); return; }
    setTimeout(() => { game.clearFeedback(); advance(); }, correct ? 1200 : 2000);
  }, [game, difficulty, advance, finalizeGame]); // eslint-disable-line react-hooks/exhaustive-deps

  // Location click (capitals / cities)
  const handleLocationClick = useCallback((lat: number, lng: number) => {
    if (waitingRef.current || game.status !== 'playing') return;
    waitingRef.current = true;
    clearTimer();

    const { questions, currentIndex, timeLeft, lives } = useGameStore.getState();
    const q = questions[currentIndex];
    if (!q.coords) return;

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
    game.setFeedback(
      correct ? 'correct' : 'wrong',
      q.correctProvinceId || q.targetId,
      undefined,
    );
    if (!correct) game.loseLife();
    if (!correct && lives <= 1) { finalizeGame(); return; }
    setTimeout(() => { game.clearFeedback(); advance(); }, correct ? 1500 : 2500);
  }, [game, difficulty, advance, finalizeGame]); // eslint-disable-line react-hooks/exhaustive-deps

  // District center click (for district mode — proximity based)
  const handleDistrictCenter = useCallback((district: District, lat: number, lng: number) => {
    if (waitingRef.current || game.status !== 'playing') return;
    waitingRef.current = true;
    clearTimer();

    const { questions, currentIndex, timeLeft, lives } = useGameStore.getState();
    const q = questions[currentIndex];
    const [tLng, tLat] = district.center;
    const dist = haversineKm(lat, lng, tLat, tLng);
    const correct = district.id === q.correctDistrictId;
    const timeUsed = TOTAL_TIME[difficulty] - timeLeft;
    const points = calcPolygonScore(correct, timeLeft, TOTAL_TIME[difficulty], difficulty);

    game.addAnswer({
      questionId: q.id, correct, timeUsed,
      pointsEarned: correct ? points : -10,
      distanceKm: Math.round(dist),
    });
    game.setFeedback(
      correct ? 'correct' : 'wrong',
      q.correctDistrictId ?? undefined,
      correct ? undefined : district.id,
    );
    if (!correct) game.loseLife();
    if (!correct && lives <= 1) { finalizeGame(); return; }
    setTimeout(() => { game.clearFeedback(); advance(); }, correct ? 1200 : 2000);
  }, [game, difficulty, advance, finalizeGame]); // eslint-disable-line react-hooks/exhaustive-deps

  return { handleProvinceClick, handleDistrictClick, handleLocationClick, handleDistrictCenter };
}
