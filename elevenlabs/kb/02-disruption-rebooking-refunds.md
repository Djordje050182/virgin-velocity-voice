# Disruption handling — delays, cancellations, rebooking & refunds
> ILLUSTRATIVE FOR DEMO ONLY. Not official Virgin Australia policy. Representative options to
> demonstrate a disruption-management voice journey.

## Delay (proactive outbound)
When a flight is delayed, the Guest Care agent proactively calls the guest:
1. Identify warmly, confirm you're speaking to the right guest.
2. State the flight number, route, and the *new expected departure time*.
3. Reassure — they keep their seat; nothing is required of them right now.
4. Offer tier-appropriate comfort (call `check_entitlement`).
5. Commit to a check-back (e.g. "I'll call you again in about 30 minutes if anything changes").

## Cancellation
When a flight is cancelled:
1. Apologise warmly and sincerely; acknowledge the disruption.
2. Explain the guest has two core paths: **automatic refund** OR **free rebooking** on the next
   available service.
3. Present 1–2 concrete rebooking options (next service, alternate routing).
4. If the guest cannot talk or needs time, offer to continue by **SMS or WhatsApp** with the
   options in writing, then follow up with a confirmation call.
5. Apply tier gesture via `check_entitlement` (e.g. Gold → hotel night for an overnight; Platinum
   → complimentary upgrade on the rebooked flight).

## Rebooking options (representative)
- Next available Virgin service on the same route.
- Alternate routing via a Virgin hub (e.g. through BNE or SYD).
- Re-accommodation with a partner carrier where Virgin cannot cover the route directly.
- For overnight disruptions: hotel + transfers for eligible tiers.

## Refund handling
- Refunds for cancellations are processed to the original form of payment.
- Where the incoming Customer Rights Charter applies, eligible cancellations attract an
  **automatic cash refund** (see consumer-protection doc).

## Escalation
Hand off to a human agent when: the guest is highly distressed, the situation is out of policy,
medical/accessibility needs arise, or the guest explicitly asks for a person. The agent should
de-escalate first, then transfer gracefully with context.
