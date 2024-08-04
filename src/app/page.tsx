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

type Question = {
  question: string;
  options: string[];
};

const questions: Question[] = [
  {
    question: "What's your favorite fruit?",
    options: ["Apple", "Banana", "Cherry"],
  },
  {
    question: "Which cuisine do you prefer?",
    options: ["Italian", "Chinese", "Mexican", "Indian", "Japanese"],
  },
  {
    question: "What's your favorite sport?",
    options: [
      "Soccer",
      "Basketball",
      "Tennis",
      "Baseball",
      "Hockey",
      "Cricket",
    ],
  },
  {
    question: "Which programming language do you like the most?",
    options: [
      "JavaScript",
      "Python",
      "Java",
      "C#",
      "Ruby",
      "Go",
      "Swift",
      "Rust",
    ],
  },
  {
    question: "What's your favorite type of movie?",
    options: [
      "Action",
      "Comedy",
      "Drama",
      "Horror",
      "Sci-Fi",
      "Fantasy",
      "Documentary",
      "Romance",
      "Thriller",
    ],
  },
];

export default function Home() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(questions.length).fill(null)
  );
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [showAlert, setShowAlert] = useState(false); // State for alert visibility

  const watchedAnswers = watch();

  useEffect(() => {
    const allAnswered = answers.every((answer) => answer !== null);
    setButtonDisabled(!allAnswered);
  }, [answers]);

  const handleOptionChange = (index: number, option: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
  };

  const onSubmit = (data: any) => {
    console.log("Submitted data:", answers);
    setShowAlert(true); // Show the alert
    setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
  };

  return (
    <div className="flex justify-center items-center min-h-screen ">
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
          className="w-full max-w-xl flex justify-center items-center "
        >
          <CarouselContent className="py-4 h-[300px] ">
            {questions.map((q, index) => (
              <CarouselItem key={index} className="pt-1 md:basis-full ">
                <div className="p-1">
                  <Card className="min-w-[270px] max-w-[500px] ">
                    <CardContent className="flex flex-col items-center justify-center p-6 ">
                      <span className="text-3xl font-semibold mb-4">
                        {index + 1}. {q.question}
                      </span>
                      <RadioGroup
                        onValueChange={(value) => {
                          handleOptionChange(index, value);
                          register(`question${index + 1}`, { required: true });
                        }}
                        className={`grid gap-2 ${
                          q.options.length > 10
                            ? "grid-cols-3"
                            : q.options.length > 6
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        {q.options.map((option) => (
                          <div
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${index}-${option}`}
                              {...register(`question${index + 1}`, {
                                required: true,
                              })}
                            />
                            <Label htmlFor={`option-${index}-${option}`}>
                              {option}
                            </Label>
                          </div>
                        ))}
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
