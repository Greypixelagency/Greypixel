-- Supabase Schema for Greypixel Dashboard
-- Run this in Supabase SQL Editor
-- This will create missing tables without errors if they already exist

-- =============================================
-- FIX EXISTING TABLES - Safe to run multiple times
-- =============================================

-- Check if days table exists and fix its structure
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'days') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days' AND column_name = 'tasks') THEN
            ALTER TABLE days ADD COLUMN tasks JSONB DEFAULT '[]';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'days' AND column_name = 'isExpanded') THEN
            ALTER TABLE days ADD COLUMN isExpanded BOOLEAN DEFAULT true;
        END IF;
        RAISE NOTICE 'days table exists - verified/altered columns';
    ELSE
        CREATE TABLE days (
            id TEXT PRIMARY KEY,
            day TEXT NOT NULL,
            tasks JSONB DEFAULT '[]',
            isExpanded BOOLEAN DEFAULT true
        );
        RAISE NOTICE 'days table created';
    END IF;
END $$;

-- Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS months (id TEXT PRIMARY KEY, month TEXT NOT NULL, projects JSONB DEFAULT '[]', isExpanded BOOLEAN DEFAULT true);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, password TEXT, role TEXT DEFAULT 'Tasks', avatar TEXT);
CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, invoiceNumber TEXT NOT NULL, dueDate TEXT, clientName TEXT, clientBusinessName TEXT, clientAddress TEXT, companyName TEXT, companyAddress TEXT, services JSONB DEFAULT '[]', subTotal NUMERIC DEFAULT 0, upfrontPercentage NUMERIC DEFAULT 0, upfrontAmount NUMERIC DEFAULT 0, dueAmount NUMERIC DEFAULT 0, paymentMethod TEXT, notes TEXT, currency TEXT DEFAULT 'PKR', createdAt TEXT, status TEXT, payments JSONB DEFAULT '[]');
CREATE TABLE IF NOT EXISTS quotations (id TEXT PRIMARY KEY, clientName TEXT NOT NULL, clientBusinessName TEXT, clientAddress TEXT, companyName TEXT, companyAddress TEXT, items JSONB DEFAULT '[]', totalCost NUMERIC DEFAULT 0, upfrontPercentage NUMERIC DEFAULT 50, upfrontAmount NUMERIC DEFAULT 0, currency TEXT DEFAULT 'PKR', notes TEXT, paymentMethod TEXT, date TEXT);
CREATE TABLE IF NOT EXISTS pipeline_clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, scope TEXT, status TEXT DEFAULT 'Pending', followUpPeriod INTEGER DEFAULT 1, followUpStatus TEXT DEFAULT 'Pending', createdAt TEXT, reminderSent BOOLEAN DEFAULT false);
CREATE TABLE IF NOT EXISTS hosting (id TEXT PRIMARY KEY, domain TEXT NOT NULL, amount NUMERIC DEFAULT 0, createdDate TEXT, dueDate TEXT, period TEXT, paymentStatus TEXT DEFAULT 'Pending', invoiceStatus TEXT DEFAULT 'Pending');
CREATE TABLE IF NOT EXISTS contracts (id TEXT PRIMARY KEY, clientName TEXT NOT NULL, clientEmail TEXT, clientAddress TEXT, companyName TEXT, companyAddress TEXT, contactPerson TEXT, contactRole TEXT, contactEmail TEXT, contractDate TEXT, amount NUMERIC DEFAULT 0, currency TEXT, howWeWork TEXT, terms TEXT, note TEXT, version INTEGER DEFAULT 1, status TEXT DEFAULT 'Draft', companySignature TEXT, clientSignature TEXT, template TEXT);
CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT DEFAULT 'Active', scope TEXT, amount NUMERIC DEFAULT 0, currency TEXT, date TEXT, dueDate TEXT, isAutoCycle BOOLEAN DEFAULT true, websiteLink TEXT);
CREATE TABLE IF NOT EXISTS expense_groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, expenses JSONB DEFAULT '[]', isClosed BOOLEAN DEFAULT false);
CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, text TEXT NOT NULL, sender TEXT NOT NULL, timestamp TEXT, category TEXT);
CREATE TABLE IF NOT EXISTS payment_methods (id TEXT PRIMARY KEY, method TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS website_clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, websiteLink TEXT, createdAt TEXT);

-- Disable Row Level Security for development
ALTER TABLE days DISABLE ROW LEVEL SECURITY;
ALTER TABLE months DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE expense_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE hosting DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE website_clients DISABLE ROW LEVEL SECURITY;

-- Check table structure
SELECT 'Tables created/verified' as status;