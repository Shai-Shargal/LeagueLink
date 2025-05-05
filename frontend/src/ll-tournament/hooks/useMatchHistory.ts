import { useState } from "react";
import { Match } from "../types";

export const useMatchHistory = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchHistory, setMatchHistory] = useState<Match[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = (newMatches: Match[]) => {
    const newHistory = matchHistory.slice(0, historyIndex + 1);
    newHistory.push(newMatches);
    setMatchHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addMatch = (match: Match) => {
    const newMatches = [...matches, match];
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    const newMatches = matches.map((match) =>
      match.id === matchId ? { ...match, ...updates } : match
    );
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  const deleteMatch = (matchId: string) => {
    const newMatches = matches.filter((match) => match.id !== matchId);
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMatches(matchHistory[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < matchHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMatches(matchHistory[historyIndex + 1]);
    }
  };

  const clearAllMatches = () => {
    const newMatches: Match[] = [];
    setMatches(newMatches);
    addToHistory(newMatches);
  };

  const autoArrangeMatches = () => {
    const matchesPerRow = 3;
    const matchWidth = 220;
    const matchHeight = 120;
    const horizontalGap = 50;
    const verticalGap = 50;

    const newMatches = matches.map((match, index) => {
      const row = Math.floor(index / matchesPerRow);
      const col = index % matchesPerRow;
      return {
        ...match,
        position: {
          x: col * (matchWidth + horizontalGap),
          y: row * (matchHeight + verticalGap),
        },
      };
    });

    addToHistory(newMatches);
    setMatches(newMatches);
  };

  return {
    matches,
    setMatches,
    historyIndex,
    handleUndo,
    handleRedo,
    clearAllMatches,
    autoArrangeMatches,
    addToHistory,
    addMatch,
    updateMatch,
    deleteMatch,
  };
};
