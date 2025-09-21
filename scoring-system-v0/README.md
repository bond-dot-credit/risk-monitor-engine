# Bond.Credit v0 Scoring System

Simple 3-metric trust scoring for yield opportunities.

## Scoring Metrics

### Performance (0-40 pts)
- Based on actual APY performance (7d/30d)
- Higher APY = higher score

### Reliability (0-40 pts)  
- Success rate of intents (25 pts)
- Gas efficiency bonus (10 pts)
- Latency efficiency bonus (5 pts)

### Safety (0-20 pts)
- Audit status (15 pts)
- Recent audit bonus (3 pts)
- Incident penalties (-5 to -8 pts)

## Risk Levels

- **🚨 Caution**: 0-49 points (High risk)
- **✅ Moderate**: 50-79 points (Medium risk)  
- **⭐ Preferred**: 80-100 points (Low risk)

## Usage

```bash
npm install
npm start
```

## Example Output

```
NEAR Staking Pool:
  Total Score: 87/100 ⭐
  Risk Level: Preferred (Low risk - recommended opportunity)
  Performance: 35/40
  Reliability: 32/40  
  Safety: 20/20
```
