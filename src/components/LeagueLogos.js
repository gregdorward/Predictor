import { useEffect, useState } from 'react';

const Ids = [
    { 15050: 17 }, // EPL
    { 14924: 7 },  // Champions League
    { 14956: 8 },  // La Liga
    { 14930: 18 }, // Championship
    { 14934: 24 }, //League 1
    { 14968: 35 }, // Bundesliga
    { 15068: 23 }, // Serie A
    { 16504: 242 }, // MLS
    { 14932: 34 }, //Ligue 1,
    { 15000: 36 }, //Scottish Prem
];

export default function LeagueLogos() {
    const [logos, setLogos] = useState([]);

    useEffect(() => {
        async function fetchLogos() {
            const logoPromises = Ids.map(async (obj) => {
                const value = Object.values(obj)[0];
                const logoUrl = `${process.env.REACT_APP_EXPRESS_SERVER}logo/${value}`;

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
