# getstore-cloudflare-api-cached

## Documentation

This file explains how to activate the Cloudflare Worker for the project **`getstore-cloudflare-api-cached`**.

---

## ✅ How to enable the Worker

1. Go to your [Cloudflare dashboard](https://dash.cloudflare.com).
2. Navigate to **"Workers & Pages"** > **"Settings"**.
3. Click on **"Domains and Routes"**.
3. Add a new route for the zone: `screenshotmax.com`.
4. Set the route to: `api.screenshotmax.com/*`

Once the route is configured, all matching requests will be intercepted by the Worker and processed accordingly.

### Note
  • To disable the Worker temporarily, you can delete the route directly from the Cloudflare Dashboard.
