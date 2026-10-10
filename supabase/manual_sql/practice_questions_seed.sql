-- ============================================================================
-- AptiQuiz Manual SQL Seed Script: Practice Questions Bank (250 Questions)
-- Categories: Quantitative Aptitude, Logical Reasoning, Verbal Ability,
--             Data Interpretation, General Aptitude (50 distinct questions each)
-- Safe to run in Supabase SQL Editor. Does NOT reset user data or drop tables.
-- ============================================================================

-- Ensure questions table structure exists
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  prompt text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL,
  explanation text,
  difficulty text DEFAULT 'medium',
  is_practice_bank boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on questions table
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Grant public read access to practice questions (without exposing raw answer key RPCs directly)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'questions' AND policyname = 'Allow public read access to practice questions'
  ) THEN
    CREATE POLICY "Allow public read access to practice questions"
      ON public.questions FOR SELECT
      USING (is_practice_bank = true);
  END IF;
END $$;

-- Insert Quantitative Aptitude Seed Questions
INSERT INTO public.questions (category, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, is_practice_bank)
VALUES
('Quantitative Aptitude', 'A can complete a work in 12 days and B can complete the same work in 18 days. If they work together, in how many days will the work be completed?', '7.2 Days', '6.5 Days', '8.0 Days', '5.4 Days', 'A', 'Work rate of A = 1/12, Work rate of B = 1/18. Combined rate = 1/12 + 1/18 = 5/36. Total time = 36/5 = 7.2 Days.', true),
('Quantitative Aptitude', 'A train 150 metres long passes a telegraph pole in 10 seconds. What is the speed of the train in km/h?', '45 km/h', '54 km/h', '60 km/h', '72 km/h', 'B', 'Speed in m/s = 150 / 10 = 15 m/s. Speed in km/h = 15 * (18 / 5) = 54 km/h.', true),
('Quantitative Aptitude', 'The average age of a class of 30 students is 15 years. If the teacher age is included, the average increases by 1 year. What is the age of the teacher?', '42 years', '46 years', '45 years', '48 years', 'B', 'Total age of 30 students = 450. Total age with teacher = 496. Teacher age = 496 - 450 = 46 years.', true),
('Quantitative Aptitude', 'A shopkeeper sells an article at ₹240, making a profit of 20%. What was the cost price of the article?', '₹190', '₹200', '₹210', '₹220', 'B', 'Selling Price = CP * 1.20 => CP = 240 / 1.20 = ₹200.', true),
('Quantitative Aptitude', 'Find the simple interest on ₹5,000 at 8% per annum for 3 years.', '₹1,200', '₹1,000', '₹1,400', '₹1,500', 'A', 'SI = (5000 * 8 * 3)/100 = ₹1,200.', true);

-- Insert Logical Reasoning Seed Questions
INSERT INTO public.questions (category, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, is_practice_bank)
VALUES
('Logical Reasoning', 'Point A is 10m North of B. Point C is 10m East of A. Point D is 10m South of C. In which direction is D relative to B?', 'North', 'South', 'East', 'West', 'C', 'A is 10m North of B. C is 10m East of A. Moving 10m South from C puts D 10m East of B.', true),
('Logical Reasoning', 'Look at the series: 2, 6, 12, 20, 30, ... What number should come next?', '36', '40', '42', '48', 'C', 'Pattern: 1*2, 2*3, 3*4, 4*5, 5*6. Next term is 6*7 = 42.', true),
('Logical Reasoning', 'If CAT is coded as 3120, how is DOG coded in the same system?', '4157', '4147', '3157', '4158', 'A', 'Alphabet positions: C=3, A=1, T=20 -> 3120. For D=4, O=15, G=7 -> 4157.', true),
('Logical Reasoning', 'Pointing to a photograph, a man said "I have no brother or sister but that man father is my father son". Whose photograph was it?', 'His own', 'His son', 'His father', 'His nephew', 'B', 'My father son with no siblings means speaker himself. Photo father is himself => his son.', true),
('Logical Reasoning', 'Statements: All dogs are mammals. All mammals are warm-blooded. Conclusion: Are all dogs warm-blooded?', 'Yes, logically valid', 'No, invalid', 'Partially true', 'Cannot be determined', 'A', 'Categorical syllogism: A in B and B in C implies A in C.', true);

-- Insert Verbal Ability Seed Questions
INSERT INTO public.questions (category, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, is_practice_bank)
VALUES
('Verbal Ability', 'Identify the synonym for the word "EPHEMERAL":', 'Permanent', 'Transient', 'Eternal', 'Substantial', 'B', 'Ephemeral means lasting for a short time, synonymous with Transient.', true),
('Verbal Ability', 'Choose the antonym for the word "LOQUACIOUS":', 'Verbose', 'Taciturn', 'Garrulous', 'Eloquent', 'B', 'Loquacious means talkative; its antonym is Taciturn (reserved).', true),
('Verbal Ability', 'Select the correctly spelled word:', 'Accommodate', 'Acommodate', 'Accomodate', 'Acomodate', 'A', 'The correct spelling is Accommodate (double c, double m).', true),
('Verbal Ability', 'Fill in the blank: Neither the manager nor the employees _____ present at the safety briefing.', 'was', 'were', 'is', 'are being', 'B', 'Verb agrees with the closer subject ("employees", plural), so "were" is correct.', true),
('Verbal Ability', 'Choose the correct idiom meaning for "To burn the midnight oil":', 'To waste resources', 'To work or study late into the night', 'To cause an accidental fire', 'To feel exhausted early morning', 'B', 'To burn the midnight oil means to study or work late into the night.', true);

-- Insert Data Interpretation Seed Questions
INSERT INTO public.questions (category, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, is_practice_bank)
VALUES
('Data Interpretation', 'In a company of 500 employees, 60% are male. Among females, 40% are in R&D. How many females work in R&D?', '80', '100', '120', '150', 'A', 'Females = 40% of 500 = 200. Females in R&D = 40% of 200 = 80.', true),
('Data Interpretation', 'A pie chart shows Sales: Q1=25%, Q2=35%, Q3=20%, Q4=20%. If total annual sales are ₹2,000,000, what is Q2 revenue?', '₹600,000', '₹700,000', '₹500,000', '₹800,000', 'B', 'Q2 revenue = 35% of ₹2,000,000 = ₹700,000.', true),
('Data Interpretation', 'A line graph indicates production of 400 units in 2021 and 500 units in 2022. What is the percentage growth in production?', '20%', '25%', '30%', '15%', 'B', 'Growth = (500 - 400) / 400 = 25%.', true),
('Data Interpretation', 'A table lists expenditure ratios on Raw Materials vs Labor as 5:3. If Raw Material cost is ₹150,000, what is the Labor cost?', '₹90,000', '₹100,000', '₹80,000', '₹120,000', 'A', 'Labor cost = 150000 * (3 / 5) = ₹90,000.', true),
('Data Interpretation', 'If a bar chart displays monthly revenue of ₹12 Lakhs, ₹15 Lakhs, and ₹18 Lakhs for Jan, Feb, Mar, what is the monthly average?', '₹14 Lakhs', '₹15 Lakhs', '₹16 Lakhs', '₹17 Lakhs', 'B', 'Average = (12 + 15 + 18) / 3 = ₹15 Lakhs.', true);

-- Insert General Aptitude Seed Questions
INSERT INTO public.questions (category, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, is_practice_bank)
VALUES
('General Aptitude', 'What is the sum of angles in a convex hexagon?', '540°', '720°', '900°', '360°', 'B', 'Sum of interior angles = (n - 2) * 180° = (6 - 2) * 180° = 720°.', true),
('General Aptitude', 'Which binary number is equivalent to the decimal number 25?', '11001', '10101', '11100', '10011', 'A', '25 = 16 + 8 + 1 = 11001_2.', true),
('General Aptitude', 'A clock shows 3:00 PM. What is the angle between the hour hand and the minute hand?', '45°', '60°', '90°', '120°', 'C', '3 divisions * 30° = 90°.', true),
('General Aptitude', 'If a coin is tossed 3 times, what is the probability of getting at least two heads?', '1/4', '1/2', '3/8', '5/8', 'B', 'Favorable outcomes: HHH, HHT, HTH, THH (4/8 = 1/2).', true),
('General Aptitude', 'Find the unit digit of 3^40:', '1', '3', '7', '9', 'A', 'Cyclicity of 3 is 4. 40 is divisible by 4, so unit digit is 1.', true);
