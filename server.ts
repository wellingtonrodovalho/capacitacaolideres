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

  // Log de todas as requisições para diagnóstico
  app.use((req, res, next) => {
    console.log(`[LOG] ${req.method} ${req.url}`);
    next();
  });

  // Rota de teste direta
  app.get("/api/ping", (req, res) => {
    res.json({ status: "online", message: "Servidor respondendo corretamente!" });
  });

  // Rota de Registro direta
  app.post("/api/register", async (req, res) => {
    console.log("Requisição de registro recebida!");
    try {
      const { name, phone, email, discipler } = req.body;

      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const sheetId = process.env.GOOGLE_SHEET_ID;

      if (!serviceAccountEmail || !privateKey || !sheetId) {
        return res.status(500).json({ 
          error: "Configuração incompleta nos Secrets do AI Studio (Faltam chaves do Google)." 
        });
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

      res.json({ success: true });
    } catch (error: any) {
      console.error("Erro Google Sheets:", error.message);
      let msg = "Erro ao salvar na planilha.";
      if (error.message.includes("403")) msg = "Erro 403: Compartilhe a planilha com o e-mail da Conta de Serviço!";
      if (error.message.includes("404")) msg = "Erro 404: ID da Planilha incorreto!";
      res.status(500).json({ error: msg });
    }
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
