# Monitoring and operations

AnnLite is being designed for a transparent, low-risk public-interest deployment model. The monitoring layer is intentionally simple and privacy-aware at this stage.

## Objectives

- Confirm service health for public web and backend endpoints
- Detect provider integration drift or webhook failures early
- Preserve a trusted, auditable audit trail for admin actions
- Maintain privacy-first analytics and log retention policies

## Minimum viable operational controls

1. Health checks for the web app and the backend API
2. Structured logs for auth failures, donation state transitions, and webhook events
3. Alerting for repeated failures or anomalous rate limits
4. Administrative review of provider outages, security incidents, and fraud signals

## Recommended production stack

- Backend health checks via `/health` and `/api/v1/status`
- Log aggregation: OpenTelemetry or structured JSON logs shipped to a central collector
- Metrics: request volume, error rate, latency, and provider status
- Alerts: alerting pipeline integrated with issue triage and incident response
- Retention: explicit privacy policy and audit retention schedule

## Security note

Monitoring must never capture or expose secrets. Provider credentials, webhook secrets, and private signing keys remain server-side only.
