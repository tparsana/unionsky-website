Viewfinder for all the aircrafts that fly outside my apartment window, satisfying my planespotting needs and curiosity.

## OpenSky Setup

The app fetches OpenSky data through its server route, keeping browser requests CORS-safe and caching a geofenced state response for 45 seconds.

For production, add OAuth credentials to `.env.local` to use the authenticated OpenSky allowance:

```bash
OPEN_SKY_CLIENT_ID=your-client-id
OPEN_SKY_CLIENT_SECRET=your-client-secret
```

The default geofence is the existing apartment window area. Override it only when needed:

```bash
OPEN_SKY_LAMIN=33.421699
OPEN_SKY_LAMAX=33.458656
OPEN_SKY_LOMIN=-111.988786
OPEN_SKY_LOMAX=-111.917328
```
