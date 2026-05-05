# Invoice Pay Dropdown Implementation (Approved Plan)

## Plan Summary
Replace direct full-pay buttons (`markInvoiceAsPaid`) in invoice table and viewing modal with toggleable dropdowns for **partial payments** (amount + date + method) using `recordPartialPayment`. Full pay can still use prefilled `dueAmount`.

**Key Features**:
- Toggle dropdown on pay button click
- Inputs: Amount (prefill remaining), Date (today), Method (dropdown from saved)
- Record button calls `recordPartialPayment`
- Animations with Motion
- Table & Modal UI

## Steps (1/8 → Breakdown)

- [x] 1. Create TODO.md ✅
- [ ] 2. Add `closePayDropdown()` function (reset states)
- [ ] 3. Update invoices table: replace pay button → toggle dropdown
- [ ] 4. Add table dropdown UI (inputs + record)
- [ ] 5. Update viewing modal pay button → toggle
- [ ] 6. Add modal dropdown UI (remaining amount hint)
- [ ] 7. Test partial/full payments, edge cases (overpay, close)
- [ ] 8. Update TODO.md complete → `attempt_completion`

**Progress**: Following approved plan iteratively in src/App.tsx
