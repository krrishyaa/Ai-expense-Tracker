Full frontend swap helper

This repository includes a helper PowerShell script to perform a controlled "full swap" of the current `frontend/` with the downloaded UI located at `C:\Users\ktkrr\Downloads\chrome downloads`.

What the script does:
- Creates a timestamped backup of the existing `frontend/` to `frontend-backup-YYYYMMDD-HHMMSS/`.
- Copies all files from the source downloaded folder into `frontend/`, overwriting files.
- Leaves node_modules untouched. You should run `npm install` or `pnpm install` after the swap.

How to run (PowerShell):

```powershell
# from workspace root
cd "C:\Users\ktkrr\Desktop\ai expense tracker"
powershell -ExecutionPolicy Bypass -File .\frontend\sync_new_frontend.ps1
```

After running, inspect the changes, merge package.json if needed, then run:

```bash
cd frontend
npm install
npm run dev
```

If you want me to run the swap automatically, confirm and I'll run the script for you (I will still create a backup first).
