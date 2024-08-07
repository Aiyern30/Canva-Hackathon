"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/Radio-group";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import Globe from "@/components/magicui/globe";

// Fetch poll data from the API
const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const createVoteUrl = process.env.NEXT_PUBLIC_CREATE_POLL_URL;
const getPollByIdentifierUrl = process.env.NEXT_PUBLIC_GET_POLL_BY_IDENTIFIER;

const fetchPollDataByIdentifier = async (identifier: string) => {
  const apiUrl = `${getPollByIdentifierUrl}${identifier}`;
  if (!apiKey) {
    throw new Error("API key is not defined");
  }
  const response = await fetch(apiUrl, {
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch poll data: ${response.statusText}`);
  }
  return await response.json();
};

// Submit a vote to the API
const createVote = async (
  pollID: string,
  optionID: string,
  identifier: string
) => {
  if (!createVoteUrl) {
    throw new Error("API URL is not defined");
  }

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (!apiKey) {
    throw new Error("API key is not defined");
  }

  const response = await fetch(createVoteUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({ poll_id: pollID, option_id: optionID, identifier }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to submit vote: ${errorData.message}`);
  }

  return await response.json();
};

interface Option {
  id: string;
  text: string;
  votes_count: number;
  poll_id: string;
  created_at: string;
  updated_at: string;
  data: string;
  entity: string;
}

interface PollData {
  id: string;
  question: string;
  options: Option[];
  created_at: string;
  updated_at: string;
  data: string;
  entity: string;
  identifier: string;
}

interface PollResponse {
  status: string;
  statusCode: number;
  data: {
    docs: PollData[];
    totalDocs: number;
    offset: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: null | number;
    nextPage: null | number;
  };
}

export default function Home() {
  const [pollData, setPollData] = useState<PollData[]>([]);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [answers, setAnswers] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const identifier = searchParams.get("qrCodeID");
  const surveyTitle = identifier?.split("-")[0];

  useEffect(() => {
    const getData = async () => {
      if (identifier) {
        try {
          const jsonData: PollResponse = await fetchPollDataByIdentifier(
            identifier
          );
          const fetchedPolls = jsonData.data.docs;
          setPollData(fetchedPolls);
          setAnswers(Array(fetchedPolls.length).fill(""));
        } catch (error) {
          console.error("Error fetching poll data:", error);
        }
      }
    };

    getData();
  }, [identifier]);

  const handleOptionChange = (pollIndex: number, optionId: string) => {
    const newAnswers = [...answers];
    newAnswers[pollIndex] = optionId;
    setAnswers(newAnswers);
  };

  useEffect(() => {
    const allAnswered = answers.every((answer) => answer !== "");
    setButtonDisabled(!allAnswered);
  }, [answers]);

  const onSubmit = async () => {
    if (pollData.length === 0) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        pollData.map((poll, pollIndex) =>
          createVote(poll.id, answers[pollIndex], poll.identifier)
        )
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

      // Mark submission as complete
      setSubmissionComplete(true);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
    setIsSubmitting(false);
  };

  if (pollData.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative flex justify-center items-center min-h-screen">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] skew-y-12 absolute top-0 left-0 w-full h-full"
        )}
      />
      {isSubmitting ? (
        <div className="flex flex-col items-center">
          <div className="text-3xl font-semibold mb-4">Submitting...</div>
          {/* You can add a spinner or loading animation here */}
        </div>
      ) : submissionComplete ? (
        <div className="flex flex-col items-center">
          <div className="text-3xl font-semibold mb-4">Thank You!</div>
          <div className="text-lg">
            Your answers have been successfully submitted.
          </div>
        </div>
      ) : (
        <Card className="relative p-5 pb-14 bg-white bg-opacity-80 z-10 rounded-lg shadow-xl">
          <div className="text-5xl text-center pb-20">{surveyTitle}</div>
          {showAlert && (
            <Alert className="absolute -top-32 bg-green-500 text-white">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your answers have been successfully submitted.
              </AlertDescription>
            </Alert>
          )}
          <Carousel
            opts={{ align: "start" }}
            orientation="vertical"
            className="w-full max-w-xl flex justify-center items-center"
          >
            <CarouselContent className="py-4 h-[300px]">
              {pollData.map((poll, pollIndex) => (
                <CarouselItem key={poll.id} className="pt-1 md:basis-full">
                  <div className="p-1">
                    <Card className="min-w-[270px] max-w-[500px]">
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <span className="text-3xl font-semibold mb-4">
                          {pollIndex + 1}. {poll.question}
                        </span>
                        <RadioGroup
                          onValueChange={(value) =>
                            handleOptionChange(pollIndex, value)
                          }
                          className="grid gap-2 grid-cols-1"
                          onClick={(e) => e.stopPropagation()} // Stop propagation here
                        >
                          {poll.options.map((option, optionIndex) => (
                            <div
                              key={option.id}
                              className="flex items-center space-x-2"
                              onClick={(e) => e.stopPropagation()} // Stop propagation here
                            >
                              <RadioGroupItem
                                value={option.id}
                                id={`option-${pollIndex}-${optionIndex}-${option.text}`}
                                {...register(`question${pollIndex + 1}`, {
                                  required: true,
                                })}
                              />
                              <Label
                                htmlFor={`option-${pollIndex}-${optionIndex}-${option.text}`}
                              >
                                {option.text}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {errors[`question${pollIndex + 1}`] && (
                          <span className="text-red-500">
                            This question is required
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious onClick={(e) => e.stopPropagation()} />
            <CarouselNext onClick={(e) => e.stopPropagation()} />
          </Carousel>
          <Button
            onClick={handleSubmit(onSubmit)} // Trigger form submission on button click
            className="absolute -bottom-12 right-4"
            disabled={isButtonDisabled}
          >
            Submit
          </Button>
        </Card>
      )}
    </div>
  );
}
