// netlify/functions/timelines.js
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  try {
    // Parse input
    let params = {};
    if (event.httpMethod === 'GET') {
      params = event.queryStringParameters || {};
    } else if (event.httpMethod === 'POST') {
      params = JSON.parse(event.body || '{}');
    }

    const lat = Number(params.lat);
    const lon = Number(params.lon);
    const hours = Math.min(Number(params.hours || 24), 120); // cap to 120h

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', ...cors },
        body: JSON.stringify({ error: 'Missing lat/lon' })
      };
    }

    // Tomorrow.io Timelines payload
    const payload = {
      location: [lat, lon],                 // << required by Tomorrow.io
      fields: ['temperature', 'humidity', 'windSpeed', 'weatherCode'],
      timesteps: ['1h'],
      units: 'metric',
      startTime: 'now',
      endTime: `nowPlus${hours}h`
    };

    const r = await fetch('https://api.tomorrow.io/v4/timelines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.TIO_KEY      // << make sure this env var is set
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text(); // pass through raw (JSON or error)
    return {
      statusCode: r.status,
      headers: { 'Content-Type': 'application/json', ...cors },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
      body: JSON.stringify({ error: err.message })
    };
  }
};
