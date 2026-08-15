# GitHub handoff — CDE Costasur MVP

The repository remains private at `https://github.com/Ingangomas/CDE-COSTASUR-MVP`. Publication is intentionally pending until a GitHub credential with `Contents: Read and write` is available.

From this workspace, run:

```powershell
git remote add origin https://github.com/Ingangomas/CDE-COSTASUR-MVP.git
git branch -M main
git push -u origin main
```

Never commit `.env.local`, Supabase service-role keys, database passwords, or generated build folders. The tracked `.env.example` contains placeholders only.
