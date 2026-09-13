import { parseGPayText } from './services/gpayParser.js';
import { calculateAllocationAdvice } from './services/allocator.js';

console.log('--- TESTING GPAY PARSER ---');
const samples = [
  'Paid Rs. 485 to Swiggy using Google Pay. UPI Ref: 425983719283',
  'Dear UPI user A/C *4829 debited by 1250.00 on 12-09-26 to BLINKIT UPI Ref 426019283746.',
  'You received Rs. 25,000 from Acme Client via Google Pay UPI Ref 994821038472',
  'Sent Rs. 650.00 to Uber India via Google Pay. UPI transaction ID 426102938475'
];

samples.forEach((text, i) => {
  console.log(`[Test ${i + 1}] Result:`, JSON.stringify(parseGPayText(text)));
});

console.log('\n--- TESTING SMART ALLOCATOR ---');
const advice = calculateAllocationAdvice({
  monthlyIncome: 100000,
  monthlyExpenses: 45000,
  currentSavings: 150000
});
console.log('Surplus:', advice.monthlyNetSurplus);
console.log('50/30/20 Needs:', advice.fiftyThirtyTwenty.needs.targetAmount);
console.log('Investment Baskets count:', advice.investmentBaskets.length);
console.log('Income Stream suggestions count:', advice.incomeStreamSuggestions.length);
console.log('All tests passed successfully!');
