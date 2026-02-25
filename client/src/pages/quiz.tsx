import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Plus,
  Trophy,
  Info,
  ArrowLeft,
} from "lucide-react";
import type { Dog, BreedEntry } from "@shared/schema";
import { allBreedNames, breedInfoMap } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface GuessEntry {
  breedName: string;
  percentage: number;
}

interface RoundResult {
  dog: Dog;
  guesses: GuessEntry[];
  actualBreeds: BreedEntry[];
  score: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateScore(guesses: GuessEntry[], actual: BreedEntry[]): number {
  let score = 0;
  const maxBreedScore = 100 / actual.length;

  for (const actualBreed of actual) {
    const guess = guesses.find(
      (g) => g.breedName.toLowerCase() === actualBreed.breedName.toLowerCase()
    );
    if (guess) {
      const breedNameScore = maxBreedScore * 0.6;
      const percentageDiff = Math.abs(guess.percentage - actualBreed.percentage);
      const percentageScore = maxBreedScore * 0.4 * Math.max(0, 1 - percentageDiff / 50);
      score += breedNameScore + percentageScore;
    }
  }

  return Math.round(score);
}

export default function Quiz() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const requestedCount = parseInt(params.get("count") || "3");

  const { data: allDogs = [], isLoading } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
  });

  const quizDogs = useMemo(() => {
    if (allDogs.length === 0) return [];
    const shuffled = shuffleArray(allDogs);
    return shuffled.slice(0, Math.min(requestedCount, shuffled.length));
  }, [allDogs, requestedCount]);

  const [currentRound, setCurrentRound] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [guesses, setGuesses] = useState<GuessEntry[]>([{ breedName: "", percentage: 0 }]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentDog = quizDogs[currentRound];
  const progress = quizDogs.length > 0 ? ((currentRound) / quizDogs.length) * 100 : 0;

  const updateGuess = (index: number, field: keyof GuessEntry, value: string | number) => {
    setGuesses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addGuessRow = () => {
    setGuesses((prev) => [...prev, { breedName: "", percentage: 0 }]);
  };

  const removeGuessRow = (index: number) => {
    if (guesses.length <= 1) return;
    setGuesses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitGuess = () => {
    if (!currentDog) return;
    const validGuesses = guesses.filter((g) => g.breedName && g.percentage > 0);
    const actual = currentDog.breeds as BreedEntry[];
    const score = validGuesses.length > 0 ? calculateScore(validGuesses, actual) : 0;

    setResults((prev) => [
      ...prev,
      { dog: currentDog, guesses: validGuesses, actualBreeds: actual, score },
    ]);
    setShowAnswer(true);
  };

  const handleNextRound = () => {
    if (currentRound + 1 >= quizDogs.length) {
      setQuizComplete(true);
    } else {
      setCurrentRound((prev) => prev + 1);
      setCurrentImageIndex(0);
      setGuesses([{ breedName: "", percentage: 0 }]);
      setShowAnswer(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading quiz...</div>
      </div>
    );
  }

  if (quizDogs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">No dogs available for the quiz.</p>
            <Button onClick={() => navigate("/")} data-testid="button-go-home">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizComplete) {
    return <QuizResults results={results} totalDogs={quizDogs.length} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 gap-2">
          <Button variant="ghost" onClick={() => navigate("/")} data-testid="button-quit-quiz">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quit
          </Button>
          <div className="text-sm text-muted-foreground" data-testid="text-round-counter">
            Dog {currentRound + 1} of {quizDogs.length}
          </div>
        </div>

        <Progress value={progress} className="mb-6" data-testid="progress-quiz" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentRound}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {currentDog && (
              <div className="space-y-6">
                <Card>
                  <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden rounded-t-md">
                    <img
                      src={currentDog.images[currentImageIndex]}
                      alt="Mystery dog"
                      className="w-full h-full object-cover"
                      data-testid="img-quiz-dog"
                    />
                    {currentDog.images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-8 h-8 bg-background/70 backdrop-blur-sm"
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? currentDog.images.length - 1 : prev - 1
                            )
                          }
                          data-testid="button-prev-image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="px-3 py-1 rounded-md bg-background/70 backdrop-blur-sm text-sm">
                          {currentImageIndex + 1} / {currentDog.images.length}
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-8 h-8 bg-background/70 backdrop-blur-sm"
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === currentDog.images.length - 1 ? 0 : prev + 1
                            )
                          }
                          data-testid="button-next-image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h2 className="text-xl font-semibold" data-testid="text-dog-name">
                      {currentDog.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      What breeds make up this pup? Guess the breeds and their percentages!
                    </p>
                  </CardContent>
                </Card>

                {!showAnswer ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Guesses</h3>
                    <div className="space-y-3">
                      {guesses.map((guess, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <Select
                              value={guess.breedName}
                              onValueChange={(val) => updateGuess(index, "breedName", val)}
                            >
                              <SelectTrigger data-testid={`select-guess-breed-${index}`}>
                                <SelectValue placeholder="Select breed" />
                              </SelectTrigger>
                              <SelectContent>
                                {allBreedNames.map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={guess.percentage || ""}
                              onChange={(e) =>
                                updateGuess(index, "percentage", parseInt(e.target.value) || 0)
                              }
                              className="w-20 text-center"
                              placeholder="%"
                              data-testid={`input-guess-percentage-${index}`}
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                            {guesses.length > 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeGuessRow(index)}
                                data-testid={`button-remove-guess-${index}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={addGuessRow}
                      className="w-full"
                      data-testid="button-add-guess"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Breed Guess
                    </Button>

                    <Button
                      onClick={handleSubmitGuess}
                      className="w-full"
                      data-testid="button-submit-guess"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Submit Guess
                    </Button>
                  </div>
                ) : (
                  <AnswerReveal
                    result={results[results.length - 1]}
                    onNext={handleNextRound}
                    isLast={currentRound + 1 >= quizDogs.length}
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnswerReveal({
  result,
  onNext,
  isLast,
}: {
  result: RoundResult;
  onNext: () => void;
  isLast: boolean;
}) {
  const [expandedBreed, setExpandedBreed] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">Results</h3>
        <Badge
          variant={result.score >= 70 ? "default" : result.score >= 40 ? "secondary" : "destructive"}
          data-testid="badge-round-score"
        >
          Score: {result.score}/100
        </Badge>
      </div>

      <div className="space-y-3">
        {result.actualBreeds.map((breed, index) => {
          const guess = result.guesses.find(
            (g) => g.breedName.toLowerCase() === breed.breedName.toLowerCase()
          );
          const breedInfo = breedInfoMap[breed.breedName];
          const isExpanded = expandedBreed === breed.breedName;

          return (
            <Card key={index} data-testid={`card-result-breed-${index}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" data-testid={`text-actual-breed-${index}`}>
                        {breed.breedName}
                      </span>
                      <Badge variant="secondary" data-testid={`badge-actual-percentage-${index}`}>
                        {breed.percentage}%
                      </Badge>
                      {guess ? (
                        <div className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-sm text-muted-foreground">
                            You guessed {guess.percentage}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-destructive" />
                          <span className="text-sm text-muted-foreground">Not guessed</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${breed.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.15 }}
                      />
                    </div>
                  </div>

                  {breedInfo && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setExpandedBreed(isExpanded ? null : breed.breedName)
                      }
                      data-testid={`button-breed-info-${index}`}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && breedInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-sm text-muted-foreground">{breedInfo.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {breedInfo.group}
                          </Badge>
                          <Badge variant="outline">
                            {breedInfo.size}
                          </Badge>
                          <Badge variant="outline">
                            {breedInfo.lifespan}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Temperament: {breedInfo.temperament}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}

        {result.guesses
          .filter(
            (g) =>
              !result.actualBreeds.some(
                (b) => b.breedName.toLowerCase() === g.breedName.toLowerCase()
              )
          )
          .map((wrongGuess, index) => (
            <Card key={`wrong-${index}`} className="border-destructive/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">
                    You guessed <span className="font-medium text-foreground">{wrongGuess.breedName}</span> at{" "}
                    {wrongGuess.percentage}% — not in the mix
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Button onClick={onNext} className="w-full" data-testid="button-next-round">
        {isLast ? (
          <>
            <Trophy className="w-4 h-4 mr-2" />
            See Final Score
          </>
        ) : (
          <>
            Next Dog
            <ChevronRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  );
}

function QuizResults({
  results,
  totalDogs,
}: {
  results: RoundResult[];
  totalDogs: number;
}) {
  const [, navigate] = useLocation();
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxScore = totalDogs * 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getMessage = () => {
    if (percentage >= 90) return "Amazing! You really know your breeds!";
    if (percentage >= 70) return "Great job! You've got a keen eye for dogs!";
    if (percentage >= 50) return "Not bad! Keep learning those breeds!";
    if (percentage >= 30) return "Room for improvement, but nice effort!";
    return "Better luck next time! Keep studying those breeds!";
  };

  const getGrade = () => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-quiz-complete">Quiz Complete!</h1>
          <p className="text-muted-foreground text-lg mb-4">{getMessage()}</p>

          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary" data-testid="text-total-score">
                {totalScore}
              </div>
              <div className="text-sm text-muted-foreground">out of {maxScore}</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-grade">
                {getGrade()}
              </div>
              <div className="text-sm text-muted-foreground">{percentage}%</div>
            </div>
          </div>
        </motion.div>

        <h2 className="text-xl font-semibold mb-4">Round by Round</h2>
        <div className="space-y-4 mb-8">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card data-testid={`card-round-result-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                      <img
                        src={result.dog.images[0]}
                        alt={result.dog.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{result.dog.name}</h3>
                        <Badge
                          variant={
                            result.score >= 70
                              ? "default"
                              : result.score >= 40
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {result.score}/100
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.actualBreeds.map((b, bi) => (
                          <span key={bi} className="text-xs text-muted-foreground">
                            {b.breedName} ({b.percentage}%)
                            {bi < result.actualBreeds.length - 1 ? " · " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate("/")} variant="outline" className="flex-1" data-testid="button-go-home-results">
            Back to Home
          </Button>
          <Button
            onClick={() => {
              navigate(`/quiz?count=${totalDogs}&t=${Date.now()}`);
              window.location.reload();
            }}
            className="flex-1"
            data-testid="button-play-again"
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
}
