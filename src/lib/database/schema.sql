-- Credit Vault Management System Database Schema
-- Supports both PostgreSQL and MongoDB (via JSON fields)

-- Create database if not exists (PostgreSQL)
-- CREATE DATABASE risk_monitor;

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    operator VARCHAR(255) NOT NULL,
    
    -- Metadata fields
    metadata_description TEXT,
    metadata_category VARCHAR(100),
    metadata_version VARCHAR(50),
    metadata_tags JSONB,
    
    -- Provenance fields
    provenance_source_code TEXT,
    provenance_verification_hash VARCHAR(255),
    provenance_deployment_chain VARCHAR(100),
    provenance_last_audit TIMESTAMP,
    provenance_audit_score INTEGER,
    provenance_audit_report TEXT,
    
    -- Verification methods (stored as JSON for flexibility)
    verification_methods JSONB,
    
    -- Scoring data (stored as JSON for flexibility)
    score JSONB,
    
    -- Status and tier
    credibility_tier VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    verification VARCHAR(50) DEFAULT 'PENDING',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Vaults table
CREATE TABLE IF NOT EXISTS credit_vaults (
    id VARCHAR(255) PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    chain_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Collateral information
    collateral_token VARCHAR(50) NOT NULL,
    collateral_amount DECIMAL(20, 8) NOT NULL,
    collateral_value_usd DECIMAL(20, 2) NOT NULL,
    collateral_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Debt information
    debt_token VARCHAR(50) NOT NULL,
    debt_amount DECIMAL(20, 8) NOT NULL,
    debt_value_usd DECIMAL(20, 2) NOT NULL,
    debt_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Risk metrics
    ltv DECIMAL(5, 2) NOT NULL,
    health_factor DECIMAL(10, 4) NOT NULL,
    max_ltv DECIMAL(5, 2) NOT NULL,
    
    -- Liquidation protection
    liquidation_protection_enabled BOOLEAN DEFAULT true,
    liquidation_protection_threshold DECIMAL(5, 2),
    liquidation_protection_cooldown INTEGER DEFAULT 3600,
    liquidation_protection_last_triggered TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_risk_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk Alerts table
CREATE TABLE IF NOT EXISTS risk_alerts (
    id VARCHAR(255) PRIMARY KEY,
    vault_id VARCHAR(255) NOT NULL REFERENCES credit_vaults(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    risk_score DECIMAL(5, 2),
    
    -- Alert status
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Liquidation Events table
CREATE TABLE IF NOT EXISTS liquidation_events (
    id VARCHAR(255) PRIMARY KEY,
    vault_id VARCHAR(255) NOT NULL REFERENCES credit_vaults(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL,
    
    -- Pre-liquidation state
    pre_ltv DECIMAL(5, 2) NOT NULL,
    pre_health_factor DECIMAL(10, 4) NOT NULL,
    
    -- Liquidation details
    liquidated_amount DECIMAL(20, 8),
    penalty_amount DECIMAL(20, 8),
    
    -- Execution details
    executed_by VARCHAR(255),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional metadata
    metadata JSONB
);

-- Protection Rules table
CREATE TABLE IF NOT EXISTS protection_rules (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule conditions (stored as JSON for flexibility)
    conditions JSONB NOT NULL,
    
    -- Rule actions
    actions JSONB NOT NULL,
    
    -- Rule status
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Data table
CREATE TABLE IF NOT EXISTS market_data (
    id VARCHAR(255) PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    token_symbol VARCHAR(50) NOT NULL,
    
    -- Price and volatility data
    price_usd DECIMAL(20, 8) NOT NULL,
    volatility DECIMAL(10, 4),
    market_cap DECIMAL(20, 2),
    
    -- Gas and network data
    gas_price_gwei DECIMAL(10, 2),
    block_number BIGINT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_credibility_tier ON agents(credibility_tier);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_operator ON agents(operator);

CREATE INDEX IF NOT EXISTS idx_credit_vaults_agent_id ON credit_vaults(agent_id);
CREATE INDEX IF NOT EXISTS idx_credit_vaults_chain_id ON credit_vaults(chain_id);
CREATE INDEX IF NOT EXISTS idx_credit_vaults_status ON credit_vaults(status);
CREATE INDEX IF NOT EXISTS idx_credit_vaults_ltv ON credit_vaults(ltv);
CREATE INDEX IF NOT EXISTS idx_credit_vaults_health_factor ON credit_vaults(health_factor);

CREATE INDEX IF NOT EXISTS idx_risk_alerts_vault_id ON risk_alerts(vault_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_type ON risk_alerts(type);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_acknowledged ON risk_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_created_at ON risk_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_liquidation_events_vault_id ON liquidation_events(vault_id);
CREATE INDEX IF NOT EXISTS idx_liquidation_events_trigger_type ON liquidation_events(trigger_type);
CREATE INDEX IF NOT EXISTS idx_liquidation_events_executed_at ON liquidation_events(executed_at);

CREATE INDEX IF NOT EXISTS idx_market_data_chain_token ON market_data(chain_id, token_symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_updated_at ON market_data(updated_at);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_vaults_chain_status ON credit_vaults(chain_id, status);
CREATE INDEX IF NOT EXISTS idx_vaults_agent_status ON credit_vaults(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_vault_type ON risk_alerts(vault_id, type);

-- Add constraints
ALTER TABLE credit_vaults ADD CONSTRAINT chk_ltv_range CHECK (ltv >= 0 AND ltv <= 100);
ALTER TABLE credit_vaults ADD CONSTRAINT chk_health_factor_positive CHECK (health_factor > 0);
ALTER TABLE credit_vaults ADD CONSTRAINT chk_collateral_positive CHECK (collateral_amount > 0 AND collateral_value_usd > 0);
ALTER TABLE credit_vaults ADD CONSTRAINT chk_debt_positive CHECK (debt_amount > 0 AND debt_value_usd > 0);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_vaults_updated_at BEFORE UPDATE ON credit_vaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_alerts_updated_at BEFORE UPDATE ON risk_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protection_rules_updated_at BEFORE UPDATE ON protection_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_data_updated_at BEFORE UPDATE ON market_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO agents (id, name, operator, metadata_description, metadata_category, metadata_version, credibility_tier, status, verification)
VALUES 
    ('agent_sample_1', 'Sample Agent 1', '0x1234567890abcdef', 'A sample agent for testing', 'Trading', '1.0.0', 'GOLD', 'ACTIVE', 'PASSED'),
    ('agent_sample_2', 'Sample Agent 2', '0xabcdef1234567890', 'Another sample agent for testing', 'Lending', '1.0.0', 'SILVER', 'ACTIVE', 'PASSED')
ON CONFLICT (id) DO NOTHING;

-- Insert sample credit vault
INSERT INTO credit_vaults (id, agent_id, chain_id, collateral_token, collateral_amount, collateral_value_usd, debt_token, debt_amount, debt_value_usd, ltv, health_factor, max_ltv)
VALUES 
    ('vault_sample_1', 'agent_sample_1', 1, 'ETH', 10.0, 20000.00, 'USDC', 10000.00, 10000.00, 50.00, 2.0, 70.00)
ON CONFLICT (id) DO NOTHING;
