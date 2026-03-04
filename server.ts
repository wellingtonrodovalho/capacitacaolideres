import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // Google Sheets Integration
  app.post("/api/register", async (req, res) => {
    try {
      const { name, phone, email, discipler } = req.body;

      if (!name || !phone || !email || !discipler) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
      }

      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const sheetId = process.env.GOOGLE_SHEET_ID;

      if (!serviceAccountEmail || !privateKey || !sheetId) {
        console.error("Missing Google Sheets configuration");
        return res.status(500).json({ error: "Configuração do servidor incompleta (Google Sheets)." });
      }

      const serviceAccountAuth = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
      await doc.loadInfo();
      
      const sheet = doc.sheetsByIndex[0]; // Assumes the first sheet is the target
      
      await sheet.addRow({
        "Data/Hora": new Date().toLocaleString("pt-BR"),
        "Nome": name,
        "Telefone": phone,
        "Email": email,
        "Discipulador": discipler
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving to Google Sheets:", error);
      res.status(500).json({ error: "Erro ao salvar inscrição. Verifique os logs do servidor." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
