import express from 'express';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js'

const app = express();
app.use(express.json());
const port = process.env.PORT;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

app.listen(port, () => {
  console.log(`Server running and connected to Supabase on port ${port}`);
});