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
  app.get("/status", (req, res) => {
    res.send("<h1>Servidor Express: ONLINE</h1><p>Se voce ve esta mensagem, a rota esta funcionando.</p>");
  });

  app.get("/api/ping", (req, res) => {
    res.json({ status: "online", message: "Servidor respondendo corretamente!" });
  });

  // ROTA UNIVERSAL DE REGISTRO (Aceita vários caminhos para evitar 404)
  const handleRegister = async (req: any, res: any) => {
    console.log(">>> RECEBIDA TENTATIVA DE INSCRIÇÃO:", req.body.name);
    try {
      const { name, phone, email, discipler } = req.body;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const sheetId = process.env.GOOGLE_SHEET_ID;

      if (!serviceAccountEmail || !privateKey || !sheetId) {
        return res.status(500).json({ error: "Configuração incompleta nos Secrets." });
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
      console.error(">>> ERRO NO GOOGLE SHEETS:", error.message);
      res.status(500).json({ error: error.message });
    }
  };

  app.post("/register", handleRegister);
  app.post("/api/register", handleRegister);
  app.post("/submit-registration", handleRegister);

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
