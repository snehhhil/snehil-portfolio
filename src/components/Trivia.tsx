"use client";

import { ArrowLeft, ArrowRight, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";

type TriviaItem = {
  language: "Java" | "Python";
  question: string;
  answer: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-surface px-1.5 py-0.5 font-mono text-accent-green">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\\n/g, "\n").split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const numberedItem = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        const bulletItem = line.match(/^\s*[-*]\s+(.*)$/);

        if (numberedItem) {
          return (
            <p key={index} className="pl-1">
              <span className="mr-2 font-mono text-accent-cyan">{numberedItem[1]}.</span>
              {renderInlineMarkdown(numberedItem[2])}
            </p>
          );
        }

        if (bulletItem) {
          return (
            <p key={index} className="pl-4 before:mr-2 before:text-accent-cyan before:content-['•']">
              {renderInlineMarkdown(bulletItem[1])}
            </p>
          );
        }

        if (!line.trim()) return <div key={index} className="h-1" />;
        return <p key={index}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function parseTriviaSet(result: string): TriviaItem[] {
  const json = result.match(/\[[\s\S]*\]/)?.[0];
  if (!json) throw new Error("The AI response did not contain a trivia set.");

  const parsed = JSON.parse(json) as Array<Partial<TriviaItem>>;
  if (!Array.isArray(parsed) || parsed.length !== 10) {
    throw new Error("The AI response did not contain exactly 10 questions.");
  }

  const triviaSet = parsed.map((item) => {
    if (
      (item.language !== "Java" && item.language !== "Python") ||
      typeof item.question !== "string" ||
      typeof item.answer !== "string"
    ) {
      throw new Error("The AI response had an invalid trivia format.");
    }

    return item as TriviaItem;
  });

  return triviaSet;
}

function normalizeQuestion(question: string) {
  return question.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function requestTrivia(excludedQuestions: string[]) {
  const excludedList = excludedQuestions.length > 0
    ? `Never repeat any of these questions or concepts: ${excludedQuestions.map((question) => `"${question}"`).join(", ")}.`
    : "There are no previously used questions yet.";
  const prompt = [
    "You are generating a fresh batch for a live computer science trivia stream.",
    "Give me a set of exactly 10 beginner-friendly questions about basic computer science, Java, or Python.",
    "Do not repeat any previous responses, questions, concepts, or wording from the excluded list.",
    "Use a variety of concepts and alternate Java and Python when possible.",
    excludedList,
    'Return only valid JSON with no markdown or extra text: [{"language":"Java or Python","question":"...","answer":"..."}].',
    "Keep every question clear and every answer to exactly one concise sentence.",
  ].filter(Boolean).join(" ");

  const response = await fetch("/api/openrouter-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: prompt, maxTokens: 1400 }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to load trivia.");
  return parseTriviaSet(data.result);
}

async function fetchTriviaSet(excludedQuestions: string[]) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const triviaSet = await requestTrivia(excludedQuestions);
    const questions = triviaSet.map((item) => normalizeQuestion(item.question));
    const hasDuplicate = new Set(questions).size !== questions.length || questions.some(
      (question) => excludedQuestions.some((excluded) => normalizeQuestion(excluded) === question)
    );

    if (!hasDuplicate) return triviaSet;
  }

  throw new Error("The AI returned repeated trivia. Please try again.");
}

export function Trivia() {
  const [triviaHistory, setTriviaHistory] = useState<TriviaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [prefetchedTrivia, setPrefetchedTrivia] = useState<TriviaItem[]>([]);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Curious to know more? Just ask!",
    },
  ]);

  const currentTrivia = triviaHistory[currentIndex];

  const prefetchNext = async (excludedQuestions: string[]) => {
    if (isPrefetching) return;
    setIsPrefetching(true);
    try {
      const nextTrivia = await fetchTriviaSet(excludedQuestions);
      setPrefetchedTrivia((current) => [...current, ...nextTrivia]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load trivia.");
    } finally {
      setIsPrefetching(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchTriviaSet([])
      .then((triviaSet) => {
        if (isMounted) {
          setTriviaHistory([triviaSet[0]]);
          setPrefetchedTrivia(triviaSet.slice(1));
        }
      })
      .catch((requestError: Error) => {
        if (isMounted) setError(requestError.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const showNext = async () => {
    if (isLoading) return;

    if (currentIndex < triviaHistory.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    setError(null);

    if (prefetchedTrivia.length > 0) {
      const nextTrivia = prefetchedTrivia[0];
      const remainingTrivia = prefetchedTrivia.slice(1);
      const excludedQuestions = [
        ...triviaHistory.map((item) => item.question),
        ...prefetchedTrivia.map((item) => item.question),
      ];
      setTriviaHistory((history) => [...history, nextTrivia]);
      setCurrentIndex((index) => index + 1);
      setPrefetchedTrivia(remainingTrivia);
      if (remainingTrivia.length <= 2) void prefetchNext(excludedQuestions);
      return;
    }

    setIsLoading(true);
    try {
      const nextTrivia = await fetchTriviaSet(triviaHistory.map((item) => item.question));
      setTriviaHistory((history) => [...history, nextTrivia[0]]);
      setPrefetchedTrivia(nextTrivia.slice(1));
      setCurrentIndex((index) => index + 1);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load trivia.");
    } finally {
      setIsLoading(false);
    }
  };

  const askAi = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || isChatLoading) return;

    setChatInput("");
    setChatError(null);
    setChatMessages((messages) => [...messages, { role: "user", content: question }]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/openrouter-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Answer this custom computer science question clearly and practically: ${question}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reach the AI.");
      setChatMessages((messages) => [...messages, { role: "assistant", content: data.result }]);
    } catch (requestError) {
      setChatError(requestError instanceof Error ? requestError.message : "Unable to reach the AI.");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <section className="border-t border-border/50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="bytewise"
          number="06. Bytewise"
          title="Know about Compter Science"
          subtitle="A quick tour through the fundamentals behind the code."
        />

        <div className="relative overflow-hidden rounded-lg border border-border bg-surface/70 p-6 shadow-lg sm:p-10">
          <button
            type="button"
            onClick={() => setIsChatOpen((open) => !open)}
            aria-expanded={isChatOpen}
            className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-md border border-accent-cyan/50 bg-accent-cyan/10 px-3 py-2 text-sm text-accent-cyan transition-colors hover:bg-accent-cyan/20 sm:right-10 sm:top-10"
          >
            {isChatOpen ? <X size={16} /> : <MessageCircle size={16} />}
            {isChatOpen ? "Close chat" : "Ask AI"}
          </button>

          <div className="mb-10 flex items-center gap-3 pr-14">
            <span className="font-mono text-sm text-accent-green">{currentTrivia?.language ?? "Loading"}</span>
            <span className="h-px w-10 bg-border" />
            <span className="font-mono text-xs text-muted">
              {currentTrivia ? `${String(currentIndex + 1).padStart(2, "0")} / live` : "-- / live"}
            </span>
          </div>

          <p className="max-w-3xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {currentTrivia?.question ?? (isLoading ? "Fetching a fresh question..." : "Trivia is unavailable right now.")}
          </p>
          <p className="mt-5 max-w-3xl border-l-2 border-accent-cyan pl-4 text-base leading-relaxed text-muted">
            {currentTrivia?.answer ?? error ?? "Try the Next button to request another question."}
          </p>

          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={showPrevious}
              disabled={currentIndex === 0 || isLoading}
              aria-label="Previous trivia question"
              title="Previous question"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              onClick={showNext}
              disabled={isLoading}
              aria-label="Next trivia question"
              title="Next question"
              className="inline-flex items-center gap-2 rounded-md border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-2 text-sm text-accent-cyan transition-colors hover:bg-accent-cyan/20 disabled:cursor-wait disabled:opacity-50"
            >
              {isLoading ? "Loading" : "Next"}
              <ArrowRight size={16} />
            </button>
          </div>

          {isChatOpen && (
            <div className="mt-8 border-t border-border pt-6">
              <div className="mb-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[92%] rounded-md px-4 py-3 text-sm leading-relaxed sm:max-w-[78%] ${
                      message.role === "user"
                        ? "self-end bg-accent-cyan/10 text-accent-cyan"
                        : "self-start border border-border bg-background/70 text-muted"
                    }`}
                  >
                    <MarkdownMessage content={message.content} />
                  </div>
                ))}
                {isChatLoading && (
                  <div className="self-start rounded-md border border-border bg-background/70 px-4 py-3 text-sm text-muted">
                    Thinking...
                  </div>
                )}
              </div>

              {chatError && <p className="mb-3 text-sm text-rose-300">{chatError}</p>}

              <form onSubmit={askAi} className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Ask me..."
                  aria-label="Ask a custom computer science question"
                  className="min-w-0 flex-1 rounded-md border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent-cyan/60"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  aria-label="Send question to AI"
                  title="Send question"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan transition-colors hover:bg-accent-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={17} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}