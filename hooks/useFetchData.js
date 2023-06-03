// hooks/useFetchData.js
import { useState, useEffect } from "react";

export const useFetchData = () => {
  const [fetcheddata, setFetchedData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_ENDPOINT)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => setError(error.toString()));
  }, []);

  return { fetchedData, error };
};
