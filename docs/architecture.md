# KABADIWALA CONNECT — SYSTEM ARCHITECTURE
## Digital Scrap Passport & Collector Empowerment Network

### 1. Architectural Overview
Kabadiwala Connect connects informal scrap collectors, verified recyclers, and platform administrators through a transparent, technology-enabled recycling network.

```text
┌─────────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
│ Collector Mobile App    │   │ Recycler Web Dashboard │   │ Admin Web Dashboard    │
│ React Native / Expo Go  │   │ React / Vite / Tailwind│   │ React / Vite / Tailwind│
└────────────┬────────────┘   └───────────┬────────────┘   └───────────┬────────────┘
             │                            │                            │
             ▼                            ▼                            ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│ FastAPI Central Business Logic & REST Gateway (/api/v1)                          │
│ JWT Signature Validation & Role-Based Access Control (RBAC)                      │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Supabase PostgreSQL (19 Relational Tables + Row Level Security + Storage Buckets) │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Core Entities & Lifecycle
1. **Collector Registration & Onboarding**: Collector registers with phone or email, selects preferred language (Marathi / Hindi / English), and accesses price ticker.
2. **Scrap Listing**: Collector uploads scrap photo, selects material category (12 benchmark materials), and inputs weight. System calculates indicative baseline value ($W \times P$).
3. **Offer Bidding**: Verified recyclers in the district review lot and submit offers with pickup proposals.
4. **Order Commitment**: Collector accepts offer; conflicting bids expire, and an Order is created.
5. **Weigh-in & Handover**: Recycler arrives with certified scale, records final calibrated weight, and issues digital payout (UPI / Cash / Bank).
6. **Digital Scrap Passport**: Verifiable QR passport is generated with immutable event trail: Minted → Offer Accepted → Scale Verified → Payment Settled → Certified Recycled.
7. **Administrative Oversight**: Admin verifies recycler credentials (GST, Pollution Board NOC), adjusts baseline pricing, reviews audit logs, and resolves disputes.
