import { createClient } from "@supabase/supabase-js";

const DEMO_ACCOUNTS: Record<string, string> = {
  propietario: "owner.demo@costasur.com",
  legal: "legal.demo@costasur.com",
  arquitectura: "review.demo@costasur.com",
  arquitecto: "architect.demo@costasur.com",
  contratista: "contractor.demo@costasur.com",
  obras: "control.demo@costasur.com",
  electrica: "electrica.demo@costasur.com",
  hidrosanitaria: "hidrosanitaria.demo@costasur.com",
  paisajismo: "paisajismo.demo@costasur.com",
  mensura: "mensura.demo@costasur.com",
  seguridad: "seguridad.demo@costasur.com",
  admin: "admin.demo@costasur.com",
  gobernanza: "gobernanza@costasur.com",
};

type DemoRequest = {
  method?: string;
  body?: { profile?: unknown };
};

type DemoResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => DemoResponse;
  json: (body: unknown) => void;
};

export default async function handler(req: DemoRequest, res: DemoResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido." });
  }

  const profile = typeof req.body?.profile === "string" ? req.body.profile : "";
  const email = DEMO_ACCOUNTS[profile];
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  const demoPassword = process.env.SUPABASE_DEMO_PASSWORD;

  if (!email || !supabaseUrl || !supabaseAnonKey || !demoPassword) {
    return res.status(500).json({ error: "El acceso demo no está configurado en este entorno." });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: demoPassword });

  if (error || !data.session) {
    return res.status(401).json({ error: "No fue posible iniciar el perfil demo seleccionado." });
  }

  return res.status(200).json({ session: data.session });
}
