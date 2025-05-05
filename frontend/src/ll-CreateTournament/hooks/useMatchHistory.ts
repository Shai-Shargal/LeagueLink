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
    addToHistory(newMatches);
    setMatches(newMatches);
  };

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    const newMatches = matches.map((match) =>
      match.id === matchId ? { ...match, ...updates } : match
    );
    addToHistory(newMatches);
    setMatches(newMatches);
  };

  const deleteMatch = (matchId: string) => {
    const newMatches = matches.filter((match) => match.id !== matchId);
    addToHistory(newMatches);
    setMatches(newMatches);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMatches(matchHistory[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < matchHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMatches(matchHistory[newIndex]);
    }
  };

  const clearAll = () => {
    addToHistory([]);
    setMatches([]);
  };

  return {
    matches,
    matchHistory,
    historyIndex,
    addMatch,
    updateMatch,
    deleteMatch,
    undo,
    redo,
    clearAll,
  };
};
