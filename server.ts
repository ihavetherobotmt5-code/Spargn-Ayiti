import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Server-side Gemini AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      const apiKey = (req.headers['x-api-key'] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "GEMINI_API_KEY is not configured. Please add it via the Settings / Secrets tab in AI Studio, or paste your custom key directly inside the chatbot settings." 
        });
      }

      // Initialize the Google Gen AI client with the server-side key and build agent telemetry
      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Create a helpful system instruction referencing Haitian saving terms like "Sòl" and "Kòb Sekou"
      const systemInstruction = `
Vous êtes Pyas AI, un assistant de budgétisation et d'épargne chaleureux, extrêmement encourageant et culturellement authentique, intégré directement dans Spargn, une application de micro-épargne et de finances personnelles.

Votre objectif absolu :
1. Répondez TOUJOURS en Français de manière claire, motivante et soignée.
2. Expliquez le fonctionnement du "Sòl" (tontine rotative traditionnelle haïtienne) avec des mots simples aux utilisateurs :
   - Expliquez la "Main Sòl" (la contribution hebdomadaire versée).
   - Expliquez le "Tirage/Tour" (la semaine où l'on touche l'argent).
   - Expliquez le "Gwo Lòt" (le pot final reçu).
3. Guidez l'utilisateur pour optimiser son épargne, suivre ses objectifs actifs et alimenter son fonds d'urgence "Kòb Sekou".
4. Offrez des conseils pratiques et concrets pour économiser "gourde par gourde" dans la vie quotidienne.
5. Utilisez les données fournies pour analyser son budget s'il le demande et lui proposer une répartition équilibrée de ses revenus.
6. Analyse du rythme d'épargne et calculs d'accélération (CRITIQUE) :
   Comparez systématiquement le rythme actuel de l'utilisateur avec des scénarios d'épargne accélérés.
   Calculez mathématiquement et proposez des formulations très précises telles que :
   - "Si vous épargnez 100 Gouds/USD de plus par semaine, vous atteindrez votre objectif [Nom] X semaines plus tôt !"
   - "Si vous économisez 50 Gouds de plus par semaine sur votre objectif [Nom], vous parviendrez à l'accomplir Y semaines plus tôt !"
   Faites des vrais calculs cohérents basés sur la liste des objectifs actifs fournis ci-dessous (montant cible, montant déjà accumulé, fréquence d'épargne et date cible).

Le ton doit être amical, humain et professionnel. Évitez le jargon technique indigeste.

Données actuelles de l'utilisateur :
- Langue préférée : ${context?.language || 'fr'}
- Nom d'utilisateur : ${context?.userName || 'Chef'}
- Objectifs d'épargne actifs : ${JSON.stringify(context?.goals || [])}
- Résumé des contributions financières : ${JSON.stringify(context?.contributionsSummary || {})}
- Configuration du Sòl :
  * Cotisation hebdomadaire (Main Sòl) : ${context?.solWeeklyHand} HTG
  * Tour de tirage choisi : Semaine ${context?.solSelectedTurn}
  * Avancement du cycle actuel : Semaine ${context?.solWeek} sur 4
  * Semaines payées : ${JSON.stringify(context?.solPaidWeeks || [])}
  * Gains potentiels cumulés (Gwo Lòt) : ${context?.solPayout} HTG
- Fonds d'urgence (Kòb Sekou) : ${context?.emergencyFund} HTG

Organisez vos réponses de manière très structurée et facile à lire à l'aide de puces HTML/Markdown et de paragraphes aérés. Utilisez toujours les unités monétaires correspondantes (HTG, USD, CAD, EUR) pour les montants.
`;

      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));

      // Call standard gemini-3.5-flash as the recommended smart text model
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ content: response.text || "Désolé, je n'ai pas pu générer de réponse." });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Une erreur interne s'est produite lors du traitement." });
    }
  });

  // Vite middleware setup for Development vs Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
