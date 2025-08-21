# Database Integration Layer

This module provides a clean abstraction layer for database operations in the Credit Vault Management system, supporting both PostgreSQL and MongoDB.

## 🏗️ Architecture

### Separation of Concerns
- **Connection Layer**: Handles database connections and pooling
- **Repository Pattern**: Provides clean data access interfaces
- **Model Mapping**: Converts between database rows and TypeScript entities
- **Factory Pattern**: Centralized repository creation and management

### Design Principles
- **DRY (Don't Repeat Yourself)**: Common operations abstracted in base classes
- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Easy to extend without modifying existing code
- **Dependency Inversion**: High-level modules don't depend on low-level modules

## 📁 File Structure

```
src/lib/database/
├── connection.ts      # Database connection management
├── models.ts         # Repository implementations
├── schema.sql        # Database schema and migrations
└── README.md         # This file
```

## 🔌 Database Support

### PostgreSQL
- **Connection Pooling**: Efficient connection management
- **Prepared Statements**: SQL injection protection
- **Transactions**: ACID compliance
- **JSONB Support**: Flexible schema for complex data

### MongoDB
- **Document Storage**: Schema-flexible data storage
- **Aggregation Pipeline**: Complex query support
- **Indexing**: Performance optimization
- **GridFS**: Large file storage support

## 🚀 Usage

### Basic Setup

```typescript
import { DatabaseManager, getDatabaseConfig, RepositoryFactory } from '@/lib/database';

// Initialize database connection
const config = getDatabaseConfig();
const dbManager = DatabaseManager.getInstance(config);
const connection = await dbManager.connect();

// Setup repository factory
const repoFactory = RepositoryFactory.getInstance();
repoFactory.setConnection(connection);

// Get repositories
const vaultRepo = repoFactory.getCreditVaultRepository();
const agentRepo = repoFactory.getAgentRepository();
```

### Repository Operations

```typescript
// Create a new credit vault
const vault = await vaultRepo.create({
  agentId: 'agent_123',
  chainId: ChainId.ETHEREUM,
  collateral: { token: 'ETH', amount: 10, valueUSD: 20000 },
  debt: { token: 'USDC', amount: 10000, valueUSD: 10000 },
  ltv: 50,
  healthFactor: 2.0,
  maxLTV: 70,
  liquidationProtection: { enabled: true, threshold: 59.5, cooldown: 3600 }
});

// Find vaults by criteria
const highRiskVaults = await vaultRepo.findHighRiskVaults(80);
const ethereumVaults = await vaultRepo.findByChainId(ChainId.ETHEREUM);

// Update vault metrics
await vaultRepo.updateVaultMetrics(vault.id, 55, 1.8);
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Type
DATABASE_TYPE=postgresql  # or mongodb

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=risk_monitor
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_SSL=false

# MongoDB Configuration
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=risk_monitor
MONGO_USER=your_username
MONGO_PASSWORD=your_password
MONGO_URI=mongodb://localhost:27017/risk_monitor
```

### Database Schema

The system includes a comprehensive SQL schema (`schema.sql`) with:

- **Agents Table**: Agent information and credibility scoring
- **Credit Vaults Table**: Vault data and risk metrics
- **Risk Alerts Table**: Alert management and tracking
- **Liquidation Events Table**: Liquidation history
- **Protection Rules Table**: Automated protection configuration
- **Market Data Table**: Real-time market information

## 📊 Performance Features

### Indexing Strategy
- **Primary Keys**: Efficient record lookup
- **Composite Indexes**: Optimized multi-column queries
- **JSONB Indexes**: Fast JSON field searches
- **Timestamp Indexes**: Efficient time-based queries

### Connection Pooling
- **Max Connections**: Configurable pool size
- **Idle Timeout**: Automatic connection cleanup
- **Connection Timeout**: Fast failure detection
- **Error Handling**: Graceful connection recovery

## 🧪 Testing

### Mock Support
The database layer includes mock implementations for testing:

```typescript
// In tests, you can mock the database connection
const mockConnection = {
  query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  close: vi.fn().mockResolvedValue(undefined),
  isConnected: vi.fn().mockReturnValue(true)
};

const repoFactory = RepositoryFactory.getInstance();
repoFactory.setConnection(mockConnection);
```

### Test Data
The schema includes sample data for testing:
- Sample agents with different credibility tiers
- Sample credit vault with realistic metrics
- Proper foreign key relationships

## 🔒 Security Features

### SQL Injection Protection
- **Parameterized Queries**: All user input is properly escaped
- **Type Validation**: Input validation at the application layer
- **Connection Isolation**: Separate connections for different operations

### Data Validation
- **Constraint Checks**: Database-level validation
- **Type Safety**: TypeScript interfaces for all data
- **Business Rules**: Application-level validation logic

## 🚀 Future Enhancements

### Planned Features
- **Migration System**: Automated schema updates
- **Connection Monitoring**: Health checks and metrics
- **Read Replicas**: Load balancing for read operations
- **Caching Layer**: Redis integration for performance
- **Audit Logging**: Complete operation history

### Extensibility
- **Custom Repositories**: Easy to add new entity types
- **Plugin System**: Database-specific optimizations
- **Multi-tenant Support**: Isolated data access
- **Sharding Support**: Horizontal scaling capabilities

## 📚 Best Practices

### Code Organization
1. **Use Repository Pattern**: Never access database directly from business logic
2. **Implement Interfaces**: Define contracts for all data access
3. **Handle Errors Gracefully**: Proper error handling and logging
4. **Use Transactions**: For operations that modify multiple records
5. **Optimize Queries**: Use indexes and efficient SQL patterns

### Performance
1. **Connection Pooling**: Reuse connections efficiently
2. **Batch Operations**: Group multiple operations when possible
3. **Lazy Loading**: Load related data only when needed
4. **Caching**: Cache frequently accessed data
5. **Monitoring**: Track query performance and optimize slow queries

## 🤝 Contributing

When adding new database features:

1. **Follow the Pattern**: Use existing repository structure
2. **Add Tests**: Include comprehensive test coverage
3. **Update Schema**: Modify schema.sql for new tables/fields
4. **Document Changes**: Update this README with new features
5. **Performance Review**: Ensure new queries are optimized

## 📞 Support

For database-related issues:

1. Check the connection configuration
2. Verify database server is running
3. Review error logs for specific issues
4. Test with sample data from schema
5. Consult database-specific documentation
