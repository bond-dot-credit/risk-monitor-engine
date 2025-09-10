// Load environment variables from .env.local file
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { nearIntentsConfig } from './src/lib/near-intents/config';

console.log('Testing bulk operations configuration...');

// Reload the config after loading environment variables
nearIntentsConfig.reloadConfig();

const config = nearIntentsConfig.getConfig();
console.log('Configuration:', config);

const validation = nearIntentsConfig.validateConfig();
console.log('Validation result:', validation);