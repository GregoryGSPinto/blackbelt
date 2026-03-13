# Event Flow

## High-Level Flow

1. User interaction enters through an `app/` route or API route.
2. Route code calls shared service and infrastructure helpers.
3. Domain/application code processes state transitions.
4. Persistence and external integration layers write to Supabase, Stripe, notifications, or other adapters.
5. Read models and UI-specific DTOs return data back to routes and components.

## Current Constraints

- Event and projector logic exists, but the repository still mixes route-local data mapping with domain orchestration.
- A full event-driven separation would require staged refactors to avoid changing business behavior.
