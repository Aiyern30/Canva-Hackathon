export async function fetchPollData(pollID: string) {
  const apiUrl = process.env.NEXT_PUBLIC_GET_POLL_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const url = `${apiUrl}${pollID}`;

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["api-key"] = apiKey;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch poll data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching poll data:", error);
    throw error;
  }
}

export async function createVote(
  pollID: string,
  optionID: string,
  identifier: string
) {
  const apiUrl = process.env.NEXT_PUBLIC_CREATE_POLL_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  const voteData = {
    poll_id: pollID,
    option_id: optionID,
    identifier: identifier,
  };

  console.log("voteData", voteData);
  if (!apiUrl) {
    throw new Error("API URL is not defined");
  }

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["api-key"] = apiKey;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(voteData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit vote");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
}
