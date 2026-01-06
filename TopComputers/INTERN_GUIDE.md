# Development Guide - Client Management System

Hey! Welcome to the team. This guide will help you build the client management system step by step. Don't worry about user roles yet - we'll build everything for admin users first, then add role restrictions later.

## Getting Started

### Setup (Day 1)

1. **Clone the repo**

   - Use GitHub Desktop
   - Make sure you're on the `staging` branch (important!)
   - Clone to your local machine

2. **Install stuff**
   ```bash
   npm install
   npm run dev
   ```
3. **Test it works**

   - App should open on localhost:5173
   - Try registering a new account (you'll be the admin)
   - Look around at what's already there

4. **Firebase setup**
   - I'll give you the config file to replace in `src/config/firebase.ts`
   - Just copy/paste what I give you

## What We're Building

Think of it as a system for managing internet service clients:

- **Clients**: People who pay monthly for internet packages
- **Bundles**: Different internet packages (Basic, Premium, etc.)
- **Cities**: Where clients live
- **Resellers**: Partners who bring in clients and get paid monthly
- **Dashboard**: Overview of everything (income, who paid today, etc.)
- **Invoices**: Printable bills for clients

## Development Plan

### Week 1: Core Data Management

**Day 1-2: Bundles & Cities**

- These are the simplest parts, good for getting familiar with the code
- Bundles = internet packages (name + price)
- Cities = just a list of city names
- Build basic add/edit/delete pages for both
- Look at the existing transaction pages for examples

**Day 3-5: Client Management**

- This is the main feature - take your time
- Each client needs: name, account name, phone, address, city, bundle, private status
- Build the client list page with search and filters
- Add forms for creating/editing clients
- Payment tracking system (mark clients as paid each month)

### Week 2: Financial Stuff

**Day 1-2: Dashboard**

- Summary cards showing totals
- "Who paid today" section
- Basic charts (the recharts library is already installed)
- Don't overthink it - simple is better

**Day 3-4: Reseller Management**

- Similar to clients but simpler
- Resellers have monthly amounts they need to pay
- When they pay, it goes into the income automatically

**Day 5: Income/Expense Tracking**

- Manual income and expense entries
- Auto-generated income from client/reseller payments
- Export functionality

### Week 3: Polish & Features

**Day 1-2: Invoice System**

- Printable invoices for clients
- Keep the design simple and professional
- Print button that opens browser print dialog

**Day 3-4: Search & Filters**

- Global search across all client data
- Filter by payment status, city, date ranges
- Make sure everything is fast and responsive

**Day 5: Testing & Bug Fixes**

- Test everything thoroughly
- Fix any issues you find
- Make sure it works on mobile

### Week 4: Final Polish

**Day 1-3: User Roles & Permissions**

- Now we add the role system (admin/manager/user)
- Hide features based on user role
- Private client restrictions for managers

**Day 4-5: Final Testing**

- Complete testing with different user roles
- Fix any remaining issues

## How to Approach Each Feature

### Start Simple

- Get basic CRUD (create, read, update, delete) working first
- Don't worry about fancy features initially
- Use the existing code patterns as examples

### Follow These Patterns

- Look at how Clients are currently implemented
- Copy the context pattern for new features
- Use the same form styles and components
- Keep the same navigation structure

### When You Get Stuck

- Check how similar features are implemented
- Ask me questions - don't spend hours stuck on something
- Break big problems into smaller pieces
- Test frequently as you build

## Technical Notes

### File Structure

```
src/
├── contexts/     # Data management (like ClientContext.tsx)
├── pages/        # Full page components
├── components/   # Reusable UI pieces
├── hooks/        # Custom functionality
```

### Database Collections You'll Create

- bundles
- cities
- resellers
- transactions (already exists, you'll modify it)
- clients (already exists, you'll expand it)

### Git Workflow

- Create a new branch for each major feature
- Commit often with clear messages
- Push to staging branch when features are complete
- I'll review before merging

## Pro Tips

1. **Don't overthink the design** - the current style is fine, just follow it
2. **Test with real data** - add some dummy clients/bundles to see how it feels
3. **Mobile matters** - check how things look on small screens
4. **Ask questions early** - better to clarify requirements than build the wrong thing
5. **Take breaks** - if you're stuck, step away for a bit

## Success Checklist

By the end, you should have:

- [ ] Working client management with payment tracking
- [ ] Bundle and city management
- [ ] Reseller system with payment tracking
- [ ] Dashboard with key metrics
- [ ] Invoice generation and printing
- [ ] Search and filtering across all data
- [ ] Role-based access control
- [ ] Everything working smoothly on mobile

## Questions?

Just message me! I'd rather answer 100 small questions than have you struggle with something big.

Good luck - you've got this! 🚀
