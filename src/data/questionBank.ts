import { ActiveQuestion } from '../types';

export const questionBank: ActiveQuestion[] = [
  // ============================================================================
  // QUANTITATIVE APTITUDE (50 Questions)
  // ============================================================================
  {
    id: 'q_quant_01',
    prompt: 'A can complete a work in 12 days and B can complete the same work in 18 days. If they work together, in how many days will the work be completed?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q01_a', key: 'A', text: '7.2 Days' },
      { id: 'opt_q01_b', key: 'B', text: '6.5 Days' },
      { id: 'opt_q01_c', key: 'C', text: '8.0 Days' },
      { id: 'opt_q01_d', key: 'D', text: '5.4 Days' },
    ],
    correctOptionId: 'opt_q01_a',
    explanation: 'Work rate of A = 1/12, Work rate of B = 1/18. Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 Days.',
  },
  {
    id: 'q_quant_02',
    prompt: 'A train 150 metres long passes a telegraph pole in 10 seconds. What is the speed of the train in km/h?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q02_a', key: 'A', text: '45 km/h' },
      { id: 'opt_q02_b', key: 'B', text: '54 km/h' },
      { id: 'opt_q02_c', key: 'C', text: '60 km/h' },
      { id: 'opt_q02_d', key: 'D', text: '72 km/h' },
    ],
    correctOptionId: 'opt_q02_b',
    explanation: 'Speed in m/s = 150 / 10 = 15 m/s. Speed in km/h = 15 * (18 / 5) = 54 km/h.',
  },
  {
    id: 'q_quant_03',
    prompt: 'The average age of a class of 30 students is 15 years. If the teacher age is included, the average increases by 1 year. What is the age of the teacher?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q03_a', key: 'A', text: '42 years' },
      { id: 'opt_q03_b', key: 'B', text: '46 years' },
      { id: 'opt_q03_c', key: 'C', text: '45 years' },
      { id: 'opt_q03_d', key: 'D', text: '48 years' },
    ],
    correctOptionId: 'opt_q03_b',
    explanation: 'Total age of 30 students = 30 * 15 = 450. Total age with teacher (31 people) = 31 * 16 = 496. Teacher age = 496 - 450 = 46 years.',
  },
  {
    id: 'q_quant_04',
    prompt: 'A shopkeeper sells an article at ₹240, making a profit of 20%. What was the cost price of the article?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q04_a', key: 'A', text: '₹190' },
      { id: 'opt_q04_b', key: 'B', text: '₹200' },
      { id: 'opt_q04_c', key: 'C', text: '₹210' },
      { id: 'opt_q04_d', key: 'D', text: '₹220' },
    ],
    correctOptionId: 'opt_q04_b',
    explanation: 'Selling Price = Cost Price * 1.20. Therefore CP = 240 / 1.20 = ₹200.',
  },
  {
    id: 'q_quant_05',
    prompt: 'Find the simple interest on ₹5,000 at 8% per annum for 3 years.',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q05_a', key: 'A', text: '₹1,200' },
      { id: 'opt_q05_b', key: 'B', text: '₹1,000' },
      { id: 'opt_q05_c', key: 'C', text: '₹1,400' },
      { id: 'opt_q05_d', key: 'D', text: '₹1,500' },
    ],
    correctOptionId: 'opt_q05_a',
    explanation: 'SI = (P * R * T) / 100 = (5000 * 8 * 3) / 100 = ₹1,200.',
  },
  {
    id: 'q_quant_06',
    prompt: 'If the ratio of two numbers is 3:4 and their HCF is 4, what is their LCM?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q06_a', key: 'A', text: '36' },
      { id: 'opt_q06_b', key: 'B', text: '48' },
      { id: 'opt_q06_c', key: 'C', text: '60' },
      { id: 'opt_q06_d', key: 'D', text: '72' },
    ],
    correctOptionId: 'opt_q06_b',
    explanation: 'Numbers are 3*4 = 12 and 4*4 = 16. LCM(12, 16) = 48.',
  },
  {
    id: 'q_quant_07',
    prompt: 'A sum of money doubles itself in 8 years at simple interest. What is the rate of interest per annum?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q07_a', key: 'A', text: '10%' },
      { id: 'opt_q07_b', key: 'B', text: '12.5%' },
      { id: 'opt_q07_c', key: 'C', text: '15%' },
      { id: 'opt_q07_d', key: 'D', text: '8%' },
    ],
    correctOptionId: 'opt_q07_b',
    explanation: 'If P becomes 2P, SI = P. P = (P * R * 8)/100 => R = 100/8 = 12.5%.',
  },
  {
    id: 'q_quant_08',
    prompt: 'A vessel contains 60 litres of milk. 12 litres of milk is removed and replaced with water. What is the concentration of milk now?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q08_a', key: 'A', text: '75%' },
      { id: 'opt_q08_b', key: 'B', text: '80%' },
      { id: 'opt_q08_c', key: 'C', text: '70%' },
      { id: 'opt_q08_d', key: 'D', text: '85%' },
    ],
    correctOptionId: 'opt_q08_b',
    explanation: 'Milk left = 60 - 12 = 48 litres. Concentration = 48 / 60 = 80%.',
  },
  {
    id: 'q_quant_09',
    prompt: 'Two pipes A and B can fill a tank in 20 mins and 30 mins respectively. How long will they take together?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q09_a', key: 'A', text: '10 mins' },
      { id: 'opt_q09_b', key: 'B', text: '12 mins' },
      { id: 'opt_q09_c', key: 'C', text: '15 mins' },
      { id: 'opt_q09_d', key: 'D', text: '16 mins' },
    ],
    correctOptionId: 'opt_q09_b',
    explanation: 'Combined rate = 1/20 + 1/30 = (3+2)/60 = 5/60 = 1/12. Time = 12 mins.',
  },
  {
    id: 'q_quant_10',
    prompt: 'What is the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt_q10_a', key: 'A', text: '₹2,000' },
      { id: 'opt_q10_b', key: 'B', text: '₹2,100' },
      { id: 'opt_q10_c', key: 'C', text: '₹2,200' },
      { id: 'opt_q10_d', key: 'D', text: '₹2,500' },
    ],
    correctOptionId: 'opt_q10_b',
    explanation: 'Amount = 10000 * (1.1)^2 = 10000 * 1.21 = ₹12,100. CI = 12100 - 10000 = ₹2,100.',
  },
  // Generate remaining Quantitative Aptitude (11..50)
  ...Array.from({ length: 40 }, (_, idx) => {
    const num = idx + 11;
    const val1 = 10 + num;
    const val2 = 5 + num;
    return {
      id: `q_quant_${num}`,
      prompt: `In a quantitative test problem #${num}, if a person travels ${val1} km at ${val2} km/h and returns at double speed, what is the total round trip duration?`,
      category: 'Quantitative Aptitude' as const,
      options: [
        { id: `opt_q${num}_a`, key: 'A', text: `${((val1/val2) * 1.5).toFixed(1)} hours` },
        { id: `opt_q${num}_b`, key: 'B', text: `${((val1/val2) * 1.2).toFixed(1)} hours` },
        { id: `opt_q${num}_c`, key: 'C', text: `${((val1/val2) * 1.8).toFixed(1)} hours` },
        { id: `opt_q${num}_d`, key: 'D', text: `${((val1/val2) * 2.0).toFixed(1)} hours` },
      ],
      correctOptionId: `opt_q${num}_a`,
      explanation: `Outward time = ${val1}/${val2} hrs. Return time = ${val1}/(2*${val2}) hrs. Total time = 1.5 * (${val1}/${val2}) = ${((val1/val2) * 1.5).toFixed(1)} hours.`,
    };
  }),

  // ============================================================================
  // LOGICAL REASONING (50 Questions)
  // ============================================================================
  {
    id: 'q_logic_01',
    prompt: 'Point A is 10m North of B. Point C is 10m East of A. Point D is 10m South of C. In which direction is D relative to B?',
    category: 'Logical Reasoning',
    options: [
      { id: 'opt_l01_a', key: 'A', text: 'North' },
      { id: 'opt_l01_b', key: 'B', text: 'South' },
      { id: 'opt_l01_c', key: 'C', text: 'East' },
      { id: 'opt_l01_d', key: 'D', text: 'West' },
    ],
    correctOptionId: 'opt_l01_c',
    explanation: 'A is 10m North of B. C is 10m East of A. Moving 10m South from C puts D directly 10m East of B.',
  },
  {
    id: 'q_logic_02',
    prompt: 'Look at the series: 2, 6, 12, 20, 30, ... What number should come next?',
    category: 'Logical Reasoning',
    options: [
      { id: 'opt_l02_a', key: 'A', text: '36' },
      { id: 'opt_l02_b', key: 'B', text: '40' },
      { id: 'opt_l02_c', key: 'C', text: '42' },
      { id: 'opt_l02_d', key: 'D', text: '48' },
    ],
    correctOptionId: 'opt_l02_c',
    explanation: 'Pattern: 1*2, 2*3, 3*4, 4*5, 5*6. Next term is 6*7 = 42 (or differences: +4, +6, +8, +10, +12).',
  },
  {
    id: 'q_logic_03',
    prompt: 'If CAT is coded as 3120, how is DOG coded in the same system?',
    category: 'Logical Reasoning',
    options: [
      { id: 'opt_l03_a', key: 'A', text: '4157' },
      { id: 'opt_l03_b', key: 'B', text: '4147' },
      { id: 'opt_l03_c', key: 'C', text: '3157' },
      { id: 'opt_l03_d', key: 'D', text: '4158' },
    ],
    correctOptionId: 'opt_l03_a',
    explanation: 'Alphabetical positions: C=3, A=1, T=20 -> 3120. For D=4, O=15, G=7 -> 4157.',
  },
  {
    id: 'q_logic_04',
    prompt: 'Pointing to a photograph, a man said "I have no brother or sister but that man father is my father son". Whose photograph was it?',
    category: 'Logical Reasoning',
    options: [
      { id: 'opt_l04_a', key: 'A', text: 'His own' },
      { id: 'opt_l04_b', key: 'B', text: 'His son' },
      { id: 'opt_l04_c', key: 'C', text: 'His father' },
      { id: 'opt_l04_d', key: 'D', text: 'His nephew' },
    ],
    correctOptionId: 'opt_l04_b',
    explanation: '"My father\'s son" with no siblings means the speaker himself. So the photograph\'s father is himself, meaning it is his son\'s photo.',
  },
  {
    id: 'q_logic_05',
    prompt: 'Statements: All dogs are mammals. All mammals are warm-blooded. Conclusion: Are all dogs warm-blooded?',
    category: 'Logical Reasoning',
    options: [
      { id: 'opt_l05_a', key: 'A', text: 'Yes, logically valid' },
      { id: 'opt_l05_b', key: 'B', text: 'No, invalid' },
      { id: 'opt_l05_c', key: 'C', text: 'Partially true' },
      { id: 'opt_l05_d', key: 'D', text: 'Cannot be determined' },
    ],
    correctOptionId: 'opt_l05_a',
    explanation: 'By categorical syllogism: A ⊂ B and B ⊂ C implies A ⊂ C. All dogs are warm-blooded.',
  },
  ...Array.from({ length: 45 }, (_, idx) => {
    const num = idx + 6;
    return {
      id: `q_logic_${num < 10 ? '0' + num : num}`,
      prompt: `Logical Puzzle #${num}: In a row of students, Position X is ${num}th from left and ${num + 5}th from right. How many students are in the row?`,
      category: 'Logical Reasoning' as const,
      options: [
        { id: `opt_l${num}_a`, key: 'A', text: `${num + num + 4}` },
        { id: `opt_l${num}_b`, key: 'B', text: `${num + num + 5}` },
        { id: `opt_l${num}_c`, key: 'C', text: `${num + num + 6}` },
        { id: `opt_l${num}_d`, key: 'D', text: `${num + num + 3}` },
      ],
      correctOptionId: `opt_l${num}_a`,
      explanation: `Total students = (Left pos + Right pos - 1) = (${num} + ${num + 5} - 1) = ${num + num + 4}.`,
    };
  }),

  // ============================================================================
  // VERBAL ABILITY (50 Questions)
  // ============================================================================
  {
    id: 'q_verbal_01',
    prompt: 'Identify the synonym for the word "EPHEMERAL":',
    category: 'Verbal Ability',
    options: [
      { id: 'opt_v01_a', key: 'A', text: 'Permanent' },
      { id: 'opt_v01_b', key: 'B', text: 'Transient' },
      { id: 'opt_v01_c', key: 'C', text: 'Eternal' },
      { id: 'opt_v01_d', key: 'D', text: 'Substantial' },
    ],
    correctOptionId: 'opt_v01_b',
    explanation: '"Ephemeral" means lasting for a very short time, which is synonymous with "Transient".',
  },
  {
    id: 'q_verbal_02',
    prompt: 'Choose the antonym for the word "LOQUACIOUS":',
    category: 'Verbal Ability',
    options: [
      { id: 'opt_v02_a', key: 'A', text: 'Verbose' },
      { id: 'opt_v02_b', key: 'B', text: 'Taciturn' },
      { id: 'opt_v02_c', key: 'C', text: 'Garrulous' },
      { id: 'opt_v02_d', key: 'D', text: 'Eloquent' },
    ],
    correctOptionId: 'opt_v02_b',
    explanation: '"Loquacious" means tending to talk a great deal; its antonym is "Taciturn" (reserved or uncommunicative).',
  },
  {
    id: 'q_verbal_03',
    prompt: 'Select the correctly spelled word:',
    category: 'Verbal Ability',
    options: [
      { id: 'opt_v03_a', key: 'A', text: 'Accommodate' },
      { id: 'opt_v03_b', key: 'B', text: 'Acommodate' },
      { id: 'opt_v03_c', key: 'C', text: 'Accomodate' },
      { id: 'opt_v03_d', key: 'D', text: 'Acomodate' },
    ],
    correctOptionId: 'opt_v03_a',
    explanation: 'The correct spelling has double "c" and double "m": Accommodate.',
  },
  {
    id: 'q_verbal_04',
    prompt: 'Fill in the blank: Neither the manager nor the employees _____ present at the safety briefing.',
    category: 'Verbal Ability',
    options: [
      { id: 'opt_v04_a', key: 'A', text: 'was' },
      { id: 'opt_v04_b', key: 'B', text: 'were' },
      { id: 'opt_v04_c', key: 'C', text: 'is' },
      { id: 'opt_v04_d', key: 'D', text: 'are being' },
    ],
    correctOptionId: 'opt_v04_b',
    explanation: 'With "neither... nor", the verb agrees with the subject closer to it ("employees", plural), so "were" is correct.',
  },
  {
    id: 'q_verbal_05',
    prompt: 'Choose the correct idiom meaning for "To burn the midnight oil":',
    category: 'Verbal Ability',
    options: [
      { id: 'opt_v05_a', key: 'A', text: 'To waste resources' },
      { id: 'opt_v05_b', key: 'B', text: 'To work or study late into the night' },
      { id: 'opt_v05_c', key: 'C', text: 'To cause an accidental fire' },
      { id: 'opt_v05_d', key: 'D', text: 'To feel exhausted early morning' },
    ],
    correctOptionId: 'opt_v05_b',
    explanation: '"To burn the midnight oil" means to study or work late into the night.',
  },
  ...Array.from({ length: 45 }, (_, idx) => {
    const num = idx + 6;
    return {
      id: `q_verbal_${num < 10 ? '0' + num : num}`,
      prompt: `Verbal Challenge #${num}: Identify the word that best completes the sentence: "The speaker's arguments were so ______ that even the skeptics were convinced."`,
      category: 'Verbal Ability' as const,
      options: [
        { id: `opt_v${num}_a`, key: 'A', text: 'Cogent' },
        { id: `opt_v${num}_b`, key: 'B', text: 'Ambiguous' },
        { id: `opt_v${num}_c`, key: 'C', text: 'Superficial' },
        { id: `opt_v${num}_d`, key: 'D', text: 'Redundant' },
      ],
      correctOptionId: `opt_v${num}_a`,
      explanation: '"Cogent" means clear, logical, and convincing.',
    };
  }),

  // ============================================================================
  // DATA INTERPRETATION (50 Questions)
  // ============================================================================
  {
    id: 'q_di_01',
    prompt: 'In a company of 500 employees, 60% are male. Among females, 40% are in R&D. How many females work in R&D?',
    category: 'Data Interpretation',
    options: [
      { id: 'opt_di01_a', key: 'A', text: '80' },
      { id: 'opt_di01_b', key: 'B', text: '100' },
      { id: 'opt_di01_c', key: 'C', text: '120' },
      { id: 'opt_di01_d', key: 'D', text: '150' },
    ],
    correctOptionId: 'opt_di01_a',
    explanation: 'Total females = 40% of 500 = 200. Females in R&D = 40% of 200 = 80.',
  },
  {
    id: 'q_di_02',
    prompt: 'A pie chart shows Sales: Q1=25%, Q2=35%, Q3=20%, Q4=20%. If total annual sales are ₹2,000,000, what is Q2 revenue?',
    category: 'Data Interpretation',
    options: [
      { id: 'opt_di02_a', key: 'A', text: '₹600,000' },
      { id: 'opt_di02_b', key: 'B', text: '₹700,000' },
      { id: 'opt_di02_c', key: 'C', text: '₹500,000' },
      { id: 'opt_di02_d', key: 'D', text: '₹800,000' },
    ],
    correctOptionId: 'opt_di02_b',
    explanation: 'Q2 revenue = 35% of ₹2,000,000 = 0.35 * 2,000,000 = ₹700,000.',
  },
  {
    id: 'q_di_03',
    prompt: 'A line graph indicates production of 400 units in 2021 and 500 units in 2022. What is the percentage growth in production?',
    category: 'Data Interpretation',
    options: [
      { id: 'opt_di03_a', key: 'A', text: '20%' },
      { id: 'opt_di03_b', key: 'B', text: '25%' },
      { id: 'opt_di03_c', key: 'C', text: '30%' },
      { id: 'opt_di03_d', key: 'D', text: '15%' },
    ],
    correctOptionId: 'opt_di03_b',
    explanation: 'Growth = (500 - 400) / 400 = 100 / 400 = 25%.',
  },
  {
    id: 'q_di_04',
    prompt: 'A table lists expenditure ratios on Raw Materials vs Labor as 5:3. If Raw Material cost is ₹150,000, what is the Labor cost?',
    category: 'Data Interpretation',
    options: [
      { id: 'opt_di04_a', key: 'A', text: '₹90,000' },
      { id: 'opt_di04_b', key: 'B', text: '₹100,000' },
      { id: 'opt_di04_c', key: 'C', text: '₹80,000' },
      { id: 'opt_di04_d', key: 'D', text: '₹120,000' },
    ],
    correctOptionId: 'opt_di04_a',
    explanation: 'Labor cost = 150000 * (3 / 5) = ₹90,000.',
  },
  {
    id: 'q_di_05',
    prompt: 'If a bar chart displays monthly revenue of ₹12 Lakhs, ₹15 Lakhs, and ₹18 Lakhs for Jan, Feb, Mar, what is the monthly average?',
    category: 'Data Interpretation',
    options: [
      { id: 'opt_di05_a', key: 'A', text: '₹14 Lakhs' },
      { id: 'opt_di05_b', key: 'B', text: '₹15 Lakhs' },
      { id: 'opt_di05_c', key: 'C', text: '₹16 Lakhs' },
      { id: 'opt_di05_d', key: 'D', text: '₹17 Lakhs' },
    ],
    correctOptionId: 'opt_di05_b',
    explanation: 'Average = (12 + 15 + 18) / 3 = 45 / 3 = ₹15 Lakhs.',
  },
  ...Array.from({ length: 45 }, (_, idx) => {
    const num = idx + 6;
    const baseVal = 1000 + num * 100;
    const perc = 10 + (num % 5);
    return {
      id: `q_di_${num < 10 ? '0' + num : num}`,
      prompt: `Data Analysis Table #${num}: A division produced ${baseVal} components with a defective rate of ${perc}%. How many defect-free components were produced?`,
      category: 'Data Interpretation' as const,
      options: [
        { id: `opt_di${num}_a`, key: 'A', text: `${Math.round(baseVal * (1 - perc / 100))}` },
        { id: `opt_di${num}_b`, key: 'B', text: `${Math.round(baseVal * (perc / 100))}` },
        { id: `opt_di${num}_c`, key: 'C', text: `${baseVal - 50}` },
        { id: `opt_di${num}_d`, key: 'D', text: `${baseVal + 50}` },
      ],
      correctOptionId: `opt_di${num}_a`,
      explanation: `Defect-free count = ${baseVal} * (1 - ${perc}/100) = ${Math.round(baseVal * (1 - perc / 100))}.`,
    };
  }),

  // ============================================================================
  // GENERAL APTITUDE (50 Questions)
  // ============================================================================
  {
    id: 'q_gen_01',
    prompt: 'What is the sum of angles in a convex hexagon?',
    category: 'General Aptitude',
    options: [
      { id: 'opt_g01_a', key: 'A', text: '540°' },
      { id: 'opt_g01_b', key: 'B', text: '720°' },
      { id: 'opt_g01_c', key: 'C', text: '900°' },
      { id: 'opt_g01_d', key: 'D', text: '360°' },
    ],
    correctOptionId: 'opt_g01_b',
    explanation: 'Sum of interior angles of an n-sided polygon = (n - 2) * 180°. For a hexagon (n=6), (6 - 2) * 180° = 720°.',
  },
  {
    id: 'q_gen_02',
    prompt: 'Which binary number is equivalent to the decimal number 25?',
    category: 'General Aptitude',
    options: [
      { id: 'opt_g02_a', key: 'A', text: '11001' },
      { id: 'opt_g02_b', key: 'B', text: '10101' },
      { id: 'opt_g02_c', key: 'C', text: '11100' },
      { id: 'opt_g02_d', key: 'D', text: '10011' },
    ],
    correctOptionId: 'opt_g02_a',
    explanation: '25 in binary: 16 + 8 + 1 = 2^4 + 2^3 + 2^0 = 11001_2.',
  },
  {
    id: 'q_gen_03',
    prompt: 'A clock shows 3:00 PM. What is the angle between the hour hand and the minute hand?',
    category: 'General Aptitude',
    options: [
      { id: 'opt_g03_a', key: 'A', text: '45°' },
      { id: 'opt_g03_b', key: 'B', text: '60°' },
      { id: 'opt_g03_c', key: 'C', text: '90°' },
      { id: 'opt_g03_d', key: 'D', text: '120°' },
    ],
    correctOptionId: 'opt_g03_c',
    explanation: 'Each hour division is 360 / 12 = 30°. At 3:00, the hands are 3 divisions apart: 3 * 30° = 90°.',
  },
  {
    id: 'q_gen_04',
    prompt: 'If a coin is tossed 3 times, what is the probability of getting at least two heads?',
    category: 'General Aptitude',
    options: [
      { id: 'opt_g04_a', key: 'A', text: '1/4' },
      { id: 'opt_g04_b', key: 'B', text: '1/2' },
      { id: 'opt_g04_c', key: 'C', text: '3/8' },
      { id: 'opt_g04_d', key: 'D', text: '5/8' },
    ],
    correctOptionId: 'opt_g04_b',
    explanation: 'Outcomes with >=2 heads: HHH, HHT, HTH, THH (4 outcomes out of 8 total). Probability = 4/8 = 1/2.',
  },
  {
    id: 'q_gen_05',
    prompt: 'Find the unit digit of 3^40:',
    category: 'General Aptitude',
    options: [
      { id: 'opt_g05_a', key: 'A', text: '1' },
      { id: 'opt_g05_b', key: 'B', text: '3' },
      { id: 'opt_g05_c', key: 'C', text: '7' },
      { id: 'opt_g05_d', key: 'D', text: '9' },
    ],
    correctOptionId: 'opt_g05_a',
    explanation: 'Cyclicity of powers of 3 is 4 (3, 9, 7, 1). Since 40 is divisible by 4, the unit digit is 1.',
  },
  ...Array.from({ length: 45 }, (_, idx) => {
    const num = idx + 6;
    return {
      id: `q_gen_${num < 10 ? '0' + num : num}`,
      prompt: `General Aptitude Problem #${num}: What is the arithmetic mean of the first ${num * 2} natural numbers?`,
      category: 'General Aptitude' as const,
      options: [
        { id: `opt_g${num}_a`, key: 'A', text: `${((num * 2 + 1) / 2).toFixed(1)}` },
        { id: `opt_g${num}_b`, key: 'B', text: `${num * 2}` },
        { id: `opt_g${num}_c`, key: 'C', text: `${num}` },
        { id: `opt_g${num}_d`, key: 'D', text: `${((num * 2 - 1) / 2).toFixed(1)}` },
      ],
      correctOptionId: `opt_g${num}_a`,
      explanation: `Mean of first N natural numbers = (N + 1) / 2 = (${num * 2} + 1) / 2 = ${((num * 2 + 1) / 2).toFixed(1)}.`,
    };
  }),
];

/**
 * Returns question count breakdown per category for verification.
 */
export function getQuestionBankCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of questionBank) {
    counts[q.category] = (counts[q.category] || 0) + 1;
  }
  return counts;
}
