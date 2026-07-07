import { useEffect, useState } from 'react';

// Ids to be updated for the latest season
const Ids = [
    { 17146: 17 }, // EPL 26/27
    { 16494: 16 }, // World Cup 2026
    { 17128: 7 },  // Champions League 26/27
    { 17199: 8 },  // La Liga 26/27
    { 17184: 18 }, // Championship 26/27
    { 17180: 24 }, // League One 26/27
    { 17210: 35 }, // Bundesliga 26/27
    { 17084: 23 }, // Serie A 26/27
    { 16504: 242 }, // MLS 26
    { 17102: 34 }, // Ligue 1 26/27
    { 17148: 36 }, // Scottish Prem 26/27
];

export default function LeagueLogos() {
    const [logos, setLogos] = useState([]);

    useEffect(() => {
        async function fetchLogos() {
            const logoPromises = Ids.map(async (obj) => {
                const value = Object.values(obj)[0];
                const logoUrl = `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}logo/${value}`;

                try {
                    const response = await fetch(logoUrl);
                    if (!response.ok) throw new Error(`Failed to fetch ${logoUrl}`);
                    return logoUrl; // You can also return response.url if server redirects
                } catch (err) {
                    console.error(err);
                    return null;
                }
            });

            // Wait for all logos to resolve
            const results = await Promise.all(logoPromises);
            setLogos(results.filter(Boolean)); // remove nulls
        }

        fetchLogos();
    }, []);

    return (
        <div className='LeagueLogos'>
            {logos.map((url, i) => (
                <img
                    key={i}
                    src={url}
                    alt={`League ${i}`}
                    style={{
                        width: 60,
                        height: 60,
                        objectFit: 'contain',
                    }}
                />
            ))}
        </div>
    );
}
