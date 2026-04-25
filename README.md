# Selah

Selah is a WhatsApp-first order and debt tracking system for distributors.

It converts everyday WhatsApp conversations into structured business data:
- Orders
- Customers
- Payments
- Outstanding debt

---

## Problem

Distributors currently:
- take orders on WhatsApp
- track payments manually
- forget who owes them
- lose money due to poor follow-up

There is no simple system that fits how they actually work.

---

## Solution

Selah turns WhatsApp into a structured sales system.

It:
- captures incoming messages
- creates orders automatically
- tracks payment status
- shows total outstanding debt
- provides a simple dashboard for control

---

## Core Idea

Distributors already use WhatsApp.

Selah does not replace it.

It adds:
- structure
- visibility
- control

---

## MVP Features

- receive WhatsApp messages via webhook
- auto-create customers from phone numbers
- store messages
- create pending orders
- edit order details (quantity and price)
- mark orders as paid or unpaid
- view total outstanding debt
- view customers and order history

---

## Tech Stack

- Backend: Node.js + Express
- Frontend: Next.js
- Database: Supabase (PostgreSQL)
- Messaging: WhatsApp Cloud API

---

## System Flow

1. Customer sends WhatsApp message  
2. Backend receives message via webhook  
3. Customer is created if new  
4. Message is stored  
5. Order is created (pending)  
6. Distributor updates order details  
7. Distributor marks paid or unpaid  
8. Dashboard reflects real-time state  

---

## Project Structure

- backend → API and business logic
- frontend → dashboard UI
- database → schema and seed data
- markdown → product and technical documentation

---

## Status

MVP in development.

---

## Goal

Build a system that allows distributors to:
- track orders without stress
- see who owes them instantly
- reduce money loss from poor tracking

---

## Vision (Future)

Selah can expand into:
- inventory tracking
- delivery tracking
- customer credit scoring
- sales forecasting
- distributor network systems

---

## Summary

Selah is a lightweight operational system that:
- keeps WhatsApp as the workflow
- adds structure through a backend
- provides clarity through a dashboard

It focuses on one thing:

Helping distributors stop losing money.
