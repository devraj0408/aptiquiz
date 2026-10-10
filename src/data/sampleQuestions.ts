import { ActiveQuestion } from '../types';

export const sampleQuestions: ActiveQuestion[] = [
  {
    id: 'q1',
    prompt: 'A can complete a work in 12 days and B can complete the same work in 18 days. If they work together, in how many days will the work be completed?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt1_a', key: 'A', text: '7.2 Days' },
      { id: 'opt1_b', key: 'B', text: '6.5 Days' },
      { id: 'opt1_c', key: 'C', text: '8.0 Days' },
      { id: 'opt1_d', key: 'D', text: '5.4 Days' },
    ],
    correctOptionId: 'opt1_a',
    explanation: 'Work rate of A = 1/12, Work rate of B = 1/18. Combined rate = 1/12 + 1/18 = (3+2)/36 = 5/36. Total time = 36/5 = 7.2 Days.',
  },
  {
    id: 'q2',
    prompt: 'A train 150 metres long passes a telegraph pole in 10 seconds. What is the speed of the train in km/h?',
    category: 'Quantitative Aptitude',
    options: [
      { id: 'opt2_a', key: 'A', text: '45 km/h' },
      { id: 'opt2_b', key: 'B', text: '54 km/h' },
      { id: 'opt2_c', key: 'C', text: '60 km/h' },
      { id: 'opt2_d', key: 'D', text: '72 km/h' },
    ],
    correctOptionId: 'opt2_b',
    explanation: 'Speed in m/s = 150 / 10 = 15 m/s. Speed in km/h = 15 * (18 / 5) = 54 km/h.',
  },
  {
    id: 'q3',
    prompt: 'Point A is 10m North of B. Point C is 10m East of A. Point D is 10m South of C. In which direction is D relative to B?',
    category: 'Logical Reasoning',
    options: [
      { id: 'opt3_a', key: 'A', text: 'North' },
      { id: 'opt3_b', key: 'B', text: 'South' },
      { id: 'opt3_c', key: 'C', text: 'East' },
      { id: 'opt3_d', key: 'D', text: 'West' },
    ],
    correctOptionId: 'opt3_c',
    explanation: 'A is 10m North of B. C is 10m East of A. Moving 10m South from C puts D directly 10m East of B.',
  },
  {
    id: 'q4',
    prompt: 'Identify the synonym for the word "EPHEMERAL":',
    category: 'Verbal Ability',
    options: [
      { id: 'opt4_a', key: 'A', text: 'Permanent' },
      { id: 'opt4_b', key: 'B', text: 'Transient' },
      { id: 'opt4_c', key: 'C', text: 'Eternal' },
      { id: 'opt4_d', key: 'D', text: 'Substantial' },
    ],
    correctOptionId: 'opt4_b',
    explanation: '"Ephemeral" means lasting for a very short time, which is synonymous with "Transient".',
  },
];
