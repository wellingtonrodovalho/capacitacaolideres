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

  console.log("Servidor iniciando...");

  app.use(cors());
  app.use(bodyParser.json());

  // ROTA ÚNICA E DIRETA (Sem prefixo /api para evitar bloqueios)
  app.post("/gravar-inscricao-videira", async (req: any, res: any) => {
    console.log(">>> TENTATIVA DE GRAVAÇÃO:", req.body.name);
    try {
      const { name, phone, email, discipler } = req.body;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const sheetId = process.env.GOOGLE_SHEET_ID;

      if (!serviceAccountEmail || !privateKey || !sheetId) {
        return res.status(500).json({ error: "Configuração ausente nos Secrets." });
      }

      const serviceAccountAuth = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      
      await sheet.addRow({
        "Data/Hora": new Date().toLocaleString("pt-BR"),
        "Nome": name,
        "Telefone": phone,
        "Email": email,
        "Discipulador": discipler
      });

      console.log(">>> INSCRIÇÃO SALVA COM SUCESSO!");
      res.json({ success: true });
    } catch (error: any) {
      console.error(">>> ERRO NO GOOGLE:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Rota de teste simples
  app.get("/ping-teste", (req, res) => {
    res.send("OK");
  });

  // Middleware do Vite ou Arquivos Estáticos
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
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();
