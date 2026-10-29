const fs = require('fs');
const lines = fs.readFileSync('src/modules/orders/order.service.ts', 'utf8').split('\n');
const line = lines[86];
console.log('Line 87:', JSON.stringify(line));
console.log('Length:', line.length);
console.log('First 5 chars:', JSON.stringify(line.substring(0, 5)));
console.log('First char code:', line.charCodeAt(0));
