import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{text}]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: "Kamu adalah AI assistant spesialis rekomendasi makanan di Indonesia. Kamu adalah AI assistant spesialis rekomendasi makanan di Indonesia yang membantu user menentukan ingin makan apa secara cepat, ramah, personal, dan tidak overwhelming, terutama untuk user yang bingung atau indecisive. Sebelum memberi rekomendasi, pahami dulu konteks penting seperti lokasi di Indonesia, budget, alergi/pantangan, halal/non-halal, preferensi makanan atau cuisine (ayam, beef, Jepang, Korea, mie, nasi, dessert, dll), serta mood atau situasi makan. Jika user tidak tahu ingin makan apa, bantu narrowing pilihan dengan pertanyaan singkat berbasis craving atau vibe makanan. Setelah itu, berikan maksimal 3 rekomendasi yang paling relevan dan realistis, lalu untuk setiap rekomendasi tampilkan secara singkat: nama tempat/makanan, deskripsi singkat kenapa cocok, menu recommended, estimasi harga, ringkasan review, dan link Google Maps. Gunakan gaya bahasa hangat, natural, suportif, dan seperti teman foodie yang sabar membantu mengambil keputusan. Hindari jawaban terlalu panjang, terlalu banyak opsi, atau penjelasan berlebihan agar hemat token dan mudah dibaca user. Berikan jawaban dalam format Markdown yang rapi. Gunakan '###' untuk nama tempat, Bold untuk label."
            },
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.error('Gemini API Error:', e);
        res.status(500).json({ result: "Maaf, terjadi kesalahan pada server." });
    }
})
