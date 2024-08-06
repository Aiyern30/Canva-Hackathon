"use client";

import { useState, useEffect } from "react";
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
import { fetchPollData, createVote } from "./api/route";
import { useSearchParams, usePathname } from "next/navigation";

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
  data: PollData;
}

export default function Home() {
  const [pollData, setPollData] = useState<PollData | null>(null);
  console.log("pollData", pollData);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [answers, setAnswers] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get the qrCodeId from the query parameters
  const qrCodeId = searchParams.get("qrCodeID")?.split("-");
  const surveyName = qrCodeId?.[0];
  const surveyID = qrCodeId?.[1];
  console.log("surveyName", surveyName);
  console.log("surveyID", surveyID);

  console.log("qrCodeID", qrCodeId);

  const ID = "66b1f40e01b0dc0010e83378";
  console.log("ID", ID);

  useEffect(() => {
    const getData = async () => {
      try {
        const jsonData: PollResponse = await fetchPollData(ID);
        setPollData(jsonData.data);
        setAnswers(Array(jsonData.data.options.length).fill(""));
      } catch (error) {
        console.error("Error fetching poll data:", error);
      }
    };

    getData();
  }, [ID]);

  const handleOptionChange = (index: number, optionId: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = optionId;
    setAnswers(newAnswers);
  };

  useEffect(() => {
    const allAnswered = answers.every((answer) => answer !== "");
    setButtonDisabled(!allAnswered);
  }, [answers]);

  const onSubmit = async () => {
    if (!pollData) return;
    try {
      // Log the answers to debug
      console.log("Submitting votes:", answers);
      await Promise.all(
        answers.map((optionId) =>
          createVote(pollData.id, optionId, pollData.identifier)
        )
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  if (!pollData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        {showAlert && (
          <Alert className="absolute -top-32 bg-green-500 text-white">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your answers have been successfully submitted.
            </AlertDescription>
          </Alert>
        )}
        <Carousel
          opts={{
            align: "start",
          }}
          orientation="vertical"
          className="w-full max-w-xl flex justify-center items-center"
        >
          <CarouselContent className="py-4 h-[300px]">
            {pollData.options.map((option, index) => (
              <CarouselItem key={option.id} className="pt-1 md:basis-full">
                <div className="p-1">
                  <Card className="min-w-[270px] max-w-[500px]">
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <span className="text-3xl font-semibold mb-4">
                        {index + 1}. {pollData.question}
                      </span>
                      <RadioGroup
                        onValueChange={(value) =>
                          handleOptionChange(index, value)
                        }
                        className="grid gap-2 grid-cols-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={option.id} // Ensure this is option.id
                            id={`option-${index}-${option.text}`}
                            {...register(`question${index + 1}`, {
                              required: true,
                            })} // Register here
                          />
                          <Label htmlFor={`option-${index}-${option.text}`}>
                            {option.text}
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors[`question${index + 1}`] && (
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
          type="submit"
          className="absolute -bottom-12 right-4"
          disabled={isButtonDisabled}
        >
          Submit
        </Button>
      </form>
    </div>
  );
}
