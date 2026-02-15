# Performance Monitoring Guide

> How to implement real-user and infrastructure monitoring for L'heure des comptes using **free, open-source tools** that can be self-hosted in the existing Docker Swarm.

---

## 1. Real User Monitoring (RUM) — Web Vitals

### Option A: Next.js built-in `reportWebVitals` + Umami

**Umami** is a free, open-source, privacy-focused web analytics tool (GDPR-compliant, no cookies). It can replace Google Analytics and also collect Web Vitals.

**Setup:**

1. Add Umami to Docker Swarm:

```yaml
# docker-compose.prod.yaml — add these services
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    environment:
      DATABASE_URL: postgresql://umami:umami@umami-db:5432/umami
      APP_SECRET: <generate-a-random-secret>
    deploy:
      replicas: 1
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.umami.rule=Host(`analytics.lheuredescomptes.org`)"
        - "traefik.http.routers.umami.entrypoints=websecure"
        - "traefik.http.routers.umami.tls.certresolver=letsencrypt"
        - "traefik.http.services.umami.loadbalancer.server.port=3000"
    networks:
      - traefik-public
      - umami-net

  umami-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    volumes:
      - umami-data:/var/lib/postgresql/data
    networks:
      - umami-net

volumes:
  umami-data:

networks:
  umami-net:
    driver: overlay
```

2. Add the Umami tracking script to `frontend/app/layout.tsx`:

```tsx
<script
  defer
  src="https://analytics.lheuredescomptes.org/script.js"
  data-website-id="<your-website-id>"
/>
```

3. Optionally forward Web Vitals from Next.js:

```tsx
// frontend/app/web-vitals.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to Umami as custom events
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track(metric.name, {
        value: Math.round(metric.value),
        rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
      });
    }
  });
  return null;
}
```

**Resources:**
- Umami: https://umami.is (MIT license)
- Requires: ~256 MB RAM, PostgreSQL

---

### Option B: Plausible Analytics (self-hosted)

Similar to Umami but with a slightly different UI. Also GDPR-compliant and cookieless.

```yaml
# Uses Plausible Community Edition
services:
  plausible:
    image: ghcr.io/plausible/community-edition:v2.1
    environment:
      BASE_URL: https://analytics.lheuredescomptes.org
      SECRET_KEY_BASE: <generate-64-char-secret>
      DATABASE_URL: postgres://plausible:plausible@plausible-db:5432/plausible
      CLICKHOUSE_DATABASE_URL: http://plausible-events-db:8123/plausible_events_db
```

**Resources:**
- Plausible CE: https://github.com/plausible/community-edition (AGPL)
- Requires: ~512 MB RAM, PostgreSQL + ClickHouse (heavier than Umami)

---

## 2. Application Performance Monitoring (APM) — Error Tracking

### Option A: GlitchTip (Sentry-compatible, self-hosted)

**GlitchTip** is a free, open-source error tracking tool compatible with the Sentry SDK. It captures errors, performance traces, and uptime monitoring.

**Setup:**

1. Add GlitchTip to Docker Swarm:

```yaml
services:
  glitchtip:
    image: glitchtip/glitchtip:latest
    environment:
      DATABASE_URL: postgresql://glitchtip:glitchtip@glitchtip-db:5432/glitchtip
      SECRET_KEY: <generate-a-random-secret>
      PORT: 8000
      EMAIL_URL: consolemail://
      GLITCHTIP_DOMAIN: https://errors.lheuredescomptes.org
      DEFAULT_FROM_EMAIL: errors@lheuredescomptes.org
      CELERY_WORKER_AUTOSCALE: "1,3"
      CELERY_WORKER_MAX_TASKS_PER_CHILD: "10000"
    deploy:
      replicas: 1
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.glitchtip.rule=Host(`errors.lheuredescomptes.org`)"
        - "traefik.http.routers.glitchtip.entrypoints=websecure"
        - "traefik.http.routers.glitchtip.tls.certresolver=letsencrypt"
        - "traefik.http.services.glitchtip.loadbalancer.server.port=8000"
    networks:
      - traefik-public
      - glitchtip-net

  glitchtip-worker:
    image: glitchtip/glitchtip:latest
    command: ./bin/run-celery-with-beat.sh
    environment:
      DATABASE_URL: postgresql://glitchtip:glitchtip@glitchtip-db:5432/glitchtip
      SECRET_KEY: <same-secret-as-above>
      PORT: 8000
      CELERY_WORKER_AUTOSCALE: "1,3"
    networks:
      - glitchtip-net

  glitchtip-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: glitchtip
      POSTGRES_USER: glitchtip
      POSTGRES_PASSWORD: glitchtip
    volumes:
      - glitchtip-data:/var/lib/postgresql/data
    networks:
      - glitchtip-net

  glitchtip-redis:
    image: redis:7-alpine
    networks:
      - glitchtip-net

volumes:
  glitchtip-data:

networks:
  glitchtip-net:
    driver: overlay
```

2. Install Sentry SDK in the frontend:

```bash
cd frontend && npm install @sentry/nextjs
```

3. Configure in `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://<key>@errors.lheuredescomptes.org/1',
  tracesSampleRate: 0.1, // 10% of requests for performance
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.1,
});
```

**Resources:**
- GlitchTip: https://glitchtip.com (MIT license)
- Requires: ~512 MB RAM, PostgreSQL + Redis

---

## 3. Infrastructure Monitoring — Server & Containers

### Recommended: Prometheus + Grafana

This is the industry standard for free, self-hosted infrastructure monitoring.

**Setup:**

1. Add to Docker Swarm:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: <your-password>
      GF_SERVER_ROOT_URL: https://monitoring.lheuredescomptes.org
    volumes:
      - grafana-data:/var/lib/grafana
    deploy:
      replicas: 1
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.grafana.rule=Host(`monitoring.lheuredescomptes.org`)"
        - "traefik.http.routers.grafana.entrypoints=websecure"
        - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
        - "traefik.http.services.grafana.loadbalancer.server.port=3000"
    networks:
      - traefik-public
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
    deploy:
      mode: global
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    deploy:
      mode: global
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring:
    driver: overlay
```

2. Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8080']
```

**What you get:**
- **Node Exporter**: CPU, memory, disk, network usage per server
- **cAdvisor**: Per-container CPU, memory, network metrics
- **Traefik metrics**: Request rate, latency percentiles, error rates
- **Grafana dashboards**: Beautiful pre-built dashboards (IDs: 1860, 893, 17346)

**Resources:**
- Prometheus: https://prometheus.io (Apache 2.0)
- Grafana: https://grafana.com/oss (AGPL)
- Requires: ~512 MB RAM total for the stack

---

## 4. Uptime Monitoring

You already have a GitHub Actions-based uptime checker running every 5 minutes. To complement this with a self-hosted solution:

### Uptime Kuma

```yaml
services:
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    volumes:
      - uptime-data:/app/data
    deploy:
      replicas: 1
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.uptime.rule=Host(`status.lheuredescomptes.org`)"
        - "traefik.http.routers.uptime.entrypoints=websecure"
        - "traefik.http.routers.uptime.tls.certresolver=letsencrypt"
        - "traefik.http.services.uptime.loadbalancer.server.port=3001"
    networks:
      - traefik-public

volumes:
  uptime-data:
```

**Features:** HTTP/HTTPS/TCP/Ping monitoring, status pages, notifications (Slack, Discord, email), certificate expiry alerts.

**Resources:**
- Uptime Kuma: https://github.com/louislam/uptime-kuma (MIT license)
- Requires: ~128 MB RAM

---

## 5. Caching Headers (Already Implemented)

Caching headers are configured in `frontend/next.config.js` under `async headers()`. Here is what is in place and why.

### Static assets — 1 year, immutable

**Applies to:** `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.avif`, `.gif`, `.ico`, `.woff`, `.woff2`, `.ttf`, `.eot`

```
Cache-Control: public, max-age=31536000, immutable
```

| Directive | Meaning |
|---|---|
| `public` | Both browsers and CDNs/proxies can cache the response |
| `max-age=31536000` | Keep in cache for 365 days (standard max convention) |
| `immutable` | Don't even try to revalidate — the content will never change at this URL |

**Why it's safe:** Next.js hashed assets (under `/_next/static/`) get a new URL on every build automatically. For files in `public/`, images and fonts rarely change. If one does change, rename the file or add a query string to bust the cache.

**Before this change:** Every repeat visitor re-downloaded every image from the server. With 18 MB of images, that's a huge waste of bandwidth under load.

### PDFs — 1 week with background revalidation

**Applies to:** `.pdf` files (e.g. the press kit)

```
Cache-Control: public, max-age=604800, stale-while-revalidate=86400
```

| Directive | Meaning |
|---|---|
| `max-age=604800` | Fresh for 7 days |
| `stale-while-revalidate=86400` | After 7 days, serve the stale version instantly to the user while fetching a fresh copy in the background (for 1 extra day) |

**Why shorter than images:** PDFs like the press kit may be updated occasionally, so a 1-week TTL balances caching with freshness.

### Security headers (added alongside caching)

These are set on all routes (`/:path*`):

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents browsers from MIME-sniffing a response, blocking some XSS vectors |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Only sends the origin (not full URL path) when navigating to external sites, protecting user privacy |

These complement the existing `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-ancestors 'self'` headers.

### How to verify after deployment

```bash
# Check static asset caching
curl -sI https://lheuredescomptes.org/og-image.png | grep -i cache-control
# Expected: Cache-Control: public, max-age=31536000, immutable

# Check security headers
curl -sI https://lheuredescomptes.org/ | grep -iE 'x-content-type|referrer-policy|x-frame'
# Expected: X-Content-Type-Options: nosniff
#           Referrer-Policy: strict-origin-when-cross-origin
#           X-Frame-Options: SAMEORIGIN
```

### Future improvement: CDN

These caching headers are designed to work with or without a CDN. When a CDN (e.g. Cloudflare free tier) is eventually added in front of the app, it will automatically respect these `Cache-Control` headers and serve cached assets from edge nodes worldwide — offloading 80%+ of static traffic from the origin server.

---

## 6. Recommended Stack (Minimal)

For your single-server Docker Swarm, the most practical combination is:

| Tool | Purpose | RAM | Priority |
|---|---|---|---|
| **Umami** | Web analytics + Web Vitals | ~256 MB | High |
| **Uptime Kuma** | Uptime monitoring + status page | ~128 MB | High |
| **GlitchTip** | Error tracking (Sentry-compatible) | ~512 MB | Medium |
| **Prometheus + Grafana** | Infrastructure metrics | ~512 MB | Medium |

**Total additional RAM needed:** ~1.4 GB for the full stack, or ~384 MB for just Umami + Uptime Kuma.

### Implementation Order:
1. **Umami** — Get visibility into real users immediately (1-2 hours to set up)
2. **Uptime Kuma** — Replace or complement the GitHub Actions uptime check (30 min)
3. **GlitchTip** — Add error tracking before scaling (2-3 hours)
4. **Prometheus + Grafana** — Full infrastructure visibility (half day)

---

## 6. Quick Win: Lighthouse CI (Free, no hosting needed)

Add automated Lighthouse audits to your CI pipeline without any self-hosting:

```yaml
# .github/workflows/lighthouse.yaml
name: Lighthouse CI
on:
  pull_request:
    paths: ['frontend/**']

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            https://lheuredescomptes.org
            https://lheuredescomptes.org/numbers
            https://lheuredescomptes.org/methodology
          budgetPath: ./frontend/lighthouse-budget.json
          uploadArtifacts: true
```

Create `frontend/lighthouse-budget.json`:
```json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "first-contentful-paint", "budget": 2000 },
      { "metric": "largest-contentful-paint", "budget": 3000 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 },
      { "metric": "total-blocking-time", "budget": 300 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "image", "budget": 500 },
      { "resourceType": "total", "budget": 1000 }
    ]
  }
]
```

This runs on every PR and catches performance regressions before they reach production.
