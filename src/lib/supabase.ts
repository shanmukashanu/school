import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://pshnywsqblnckigmueep.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImU0Mjk3MmZhLTc3MTctNDkzNi1hNzA4LTUwODRkZDcxNDhiMSJ9.eyJwcm9qZWN0SWQiOiJwc2hueXdzcWJsbmNraWdtdWVlcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5OTU3MjYyLCJleHAiOjIwODUzMTcyNjIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.vevrAxWxA1sVuM5ftuWW78FeL0S95afflTVyyb9hkoY';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };