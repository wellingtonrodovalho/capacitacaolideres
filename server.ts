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
    console.log("Recebendo nova inscrição:", req.body.name);
    try {
      const { name, phone, email, discipler } = req.body;

      if (!name || !phone || !email || !discipler) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
      }

      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const sheetId = process.env.GOOGLE_SHEET_ID;

      if (!serviceAccountEmail || !privateKey || !sheetId) {
        console.error("Configuração ausente:", { serviceAccountEmail: !!serviceAccountEmail, privateKey: !!privateKey, sheetId: !!sheetId });
        return res.status(500).json({ 
          error: "Configuração do Google Sheets incompleta. Verifique se você adicionou as chaves (GOOGLE_SHEET_ID, etc.) no painel de Secrets do AI Studio." 
        });
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
      console.error("Erro detalhado do Google Sheets:", error);
      
      let userFriendlyError = "Erro ao salvar inscrição.";
      
      if (error.message?.includes("403")) {
        userFriendlyError = "Erro de Permissão (403): Você esqueceu de COMPARTILHAR a planilha com o e-mail da Conta de Serviço como 'Editor'.";
      } else if (error.message?.includes("401")) {
        userFriendlyError = "Erro de Autenticação (401): A Chave Privada ou o E-mail da Conta de Serviço nos 'Secrets' estão incorretos.";
      } else if (error.message?.includes("404")) {
        userFriendlyError = "Planilha não encontrada (404): Verifique se o GOOGLE_SHEET_ID nos 'Secrets' está correto.";
      } else if (error.message?.includes("header")) {
        userFriendlyError = "Erro de Cabeçalho: Verifique se a primeira linha da planilha contém os nomes: Data/Hora, Nome, Telefone, Email, Discipulador.";
      }

      res.status(500).json({ error: userFriendlyError });
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
