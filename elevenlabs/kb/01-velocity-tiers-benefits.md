# Velocity Frequent Flyer — tiers & disruption-relevant benefits
> ILLUSTRATIVE FOR DEMO ONLY. Not official Virgin Australia / Velocity policy. Figures are
> representative, used to demonstrate tier-aware service. Replace with Virgin's real entitlement
> matrix in production.

Velocity Frequent Flyer has **13 million+ members** (official total membership; "active" members
are a smaller subset). It is one of Australia's largest loyalty programs, ~28% EBIT margin, 80+
partners. It is the natural beachhead for a tier-aware voice experience.

## Tiers (lowest to highest)
- **Red** — entry tier. Standard service.
- **Silver** — priority queueing; occasional lounge invitations.
- **Gold** — lounge access; priority check-in, baggage and boarding; preferred seating.
- **Platinum** — top published tier. All Gold benefits plus complimentary upgrades (subject to
  availability), guaranteed seat availability, dedicated service line.

## Disruption entitlements used by the demo (representative)
These are the deterministic outputs the `check_entitlement` tool returns. The conversational agent
must NOT invent benefits — it calls the tool and reads back exactly what it returns.

| Tier | Delay (3hr+) | Cancellation |
|---|---|---|
| Red | Meal voucher; rebook on next available service | Automatic refund OR free rebook |
| Silver | Meal voucher; priority rebook | Refund/rebook + priority rebooking |
| **Gold** | Lounge access while waiting | **Lounge access + hotel night if overnight** |
| **Platinum** | Lounge access + rebooking concierge | **Complimentary cabin upgrade on rebooked flight** (subject to availability) + hotel night if overnight |

## The thesis
"Treat every guest like a Platinum member." Tier-aware proactive service lets Virgin extend a
genuinely personal gesture at the moment of disruption — at scale, on every contact, not just for
the few who reach a human agent.
