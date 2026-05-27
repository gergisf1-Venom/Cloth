# Firebase Security Specifications

This document outlines the security architecture and rules for the user-isolated SewnERP system. All rules respect a strict Zero-Trust approach.

## 1. Data Invariants
- Each user can only read, write, update, or delete their own data under `/users/$(request.auth.uid)`.
- No user can touch or access other users' products, resellers, transactions, or preferences.
- Product costPrice and sellingPrice must be positive numbers.
- Transaction quantities must be positive integers.
- Transactions types must be strictly bounded to `STOCK_IN`, `STOCK_OUT`, or `PAYMENT`.

## 2. The Dirty Dozen Payloads
Here are 12 specific payloads attempting to violate user boundaries and how the rule validates them:

1. **Spoofed User Profiling**: User `attacker123` attempts to write to `/users/victim456`. (PERMISSION_DENIED)
2. **Untracked Stock Injection**: Write `/users/user123/products/prod1` without required fields. (PERMISSION_DENIED)
3. **Price Forgery**: Product created with negative costPrice. (PERMISSION_DENIED)
4. **Reseller Hijack**: User `attacker123` attempts to write to `/users/victim456/resellers/partner1`. (PERMISSION_DENIED)
5. **Ledger Forgery**: Creating a transaction with negative values for `quantity`. (PERMISSION_DENIED)
6. **Unknown Transaction Type**: Transaction with type `FREE_GIVEAWAY` instead of valid enums. (PERMISSION_DENIED)
7. **Malicious ID Lengths**: Inserting a 2KB string as a product ID. (PERMISSION_DENIED)
8. **Invalid Color Data Types**: Specifying an object as clothing colors instead of an array. (PERMISSION_DENIED)
9. **Tampering with Immortals**: Modifying the `createdAt` timestamp of a product during update. (PERMISSION_DENIED)
10. **Client-Manipulated Server Dates**: Submitting manual timestamps instead of `request.time`. (PERMISSION_DENIED)
11. **Payment Manipulation**: Payment transaction created with flat 0 or negative values. (PERMISSION_DENIED)
12. **Cross-Tenant List Scraping**: Attacker requests a broad list of all products in other tenants. (PERMISSION_DENIED)

## 3. The Test Rules Mock-up

These scenarios are encoded inside our firestore rules, verified before compile.
