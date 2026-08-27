import express from 'express';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js'

const app = express();
app.use(express.json());
const port = process.env.PORT;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data.user;
  next();
}

app.post('/auth/signup', async (req, res) => {
    const {email, password} = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp({ 
        email: email, 
        password: password 
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data.user);
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error && error.status === 401) {
        return res.status(401).json({ error: "Invalid login credentials" });
    } else if (error) {
        return res.status(error.status).json({ error: error.message });
    }

    res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
    });
});

app.get('/public/info', (req, res) => {
    res.status(200).json({ "message": "Welcome stranger! This info is public." })
});

app.get('/protected/profile', requireAuth , async (req, res) => {
    const user = req.user
    res.status(200).json({ "id": user.id, "email": user.email, "account-created date": user.created_at })
});

app.post('/auth/logout', requireAuth, async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server running and connected to Supabase on port ${port}`);
});