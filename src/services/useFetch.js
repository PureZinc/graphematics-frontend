import { useState, useEffect } from 'react';

const BASE_URL = "https://graphematics-26e0b7201e5f.herokuapp.com/api";

const useFetch = (url, method = 'GET', body = null, token = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                ...(body ? { body: JSON.stringify(body) } : {}),
            };

            try {
                const response = await fetch(BASE_URL + url, options);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, body, token]);

    return { data, loading, error };
};

export default useFetch;