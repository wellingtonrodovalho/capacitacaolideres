import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Phone, 
  Mail, 
  Users, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  QrCode,
  Send,
  ArrowRight,
  AlertCircle
} from "lucide-react";

const PIX_KEY = "redeadultosbotanico@gmail.com";
const WHATSAPP_NUMBER = "62985451980";
const EVENT_PRICE = "R$ 50,00";

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    discipler: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      console.log("Iniciando tentativa de inscrição...");
      
      const response = await fetch("/submit-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await response.json() : null;

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data?.error || `Erro ${response.status}: O servidor não encontrou a rota de salvamento.`);
      }
    } catch (error: any) {
      console.error("Erro na inscrição:", error);
      setStatus("error");
      setErrorMessage("Erro de conexão: O servidor pode estar fora do ar ou reiniciando.");
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Olá! Acabei de me inscrever na Capacitação de Líderes. Segue o comprovante de pagamento para ${formData.name}.`);
    window.open(`https://wa.me/55${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-white font-sans selection:bg-purple-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070')",
            filter: "blur(2px)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0502]/80 to-[#0a0502]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.15)_0%,transparent_70%)]" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 uppercase">
            Capacitação <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Líderes</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Rede de Adultos - Videira Botânico <span className="text-[10px] opacity-20">v1.1</span>
          </p>
        </motion.div>

        {/* Event Details Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {[
            { icon: Calendar, label: "Data", value: "Sábado, 21 de Março", color: "text-purple-400" },
            { icon: Clock, label: "Horário", value: "14:00 Horas", color: "text-cyan-400" },
            { icon: MapPin, label: "Local", value: "Videira Botânico", color: "text-purple-400" },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <item.icon className={`w-6 h-6 mx-auto mb-3 ${item.color}`} />
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">{item.label}</p>
              <p className="font-medium">{item.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Inscrição Realizada!</h2>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                      Sua vaga está pré-reservada. Para confirmar, realize o pagamento via PIX e envie o comprovante.
                    </p>
                    <div className="space-y-4">
                      <button 
                        onClick={openWhatsApp}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20"
                      >
                        <Send className="w-5 h-5" />
                        Enviar Comprovante no WhatsApp
                      </button>
                      <button 
                        onClick={() => setStatus("idle")}
                        className="text-zinc-500 hover:text-white transition-colors text-sm"
                      >
                        Fazer outra inscrição
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          required
                          type="text"
                          name="name"
                          placeholder="Nome Completo"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          required
                          type="tel"
                          name="phone"
                          placeholder="Telefone / WhatsApp"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          required
                          type="email"
                          name="email"
                          placeholder="E-mail"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          required
                          type="text"
                          name="discipler"
                          placeholder="Nome do seu Discipulador"
                          value={formData.discipler}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {status === "error" && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{errorMessage}</p>
                      </div>
                    )}

                    <button
                      disabled={status === "loading"}
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-900/20 group"
                    >
                      {status === "loading" ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Realizar Inscrição
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Payment Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Pagamento PIX</h3>
                  <p className="text-zinc-500 text-sm">Investimento: {EVENT_PRICE}</p>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-6 mb-6 border border-white/5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Chave PIX (E-mail)</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-purple-400 font-mono break-all text-sm">{PIX_KEY}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(PIX_KEY);
                      alert("Chave PIX copiada!");
                    }}
                    className="shrink-0 text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400 font-bold text-sm">1</div>
                  <p className="text-sm text-zinc-400">Realize a transferência de <span className="text-white font-medium">{EVENT_PRICE}</span> para a chave acima.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400 font-bold text-sm">2</div>
                  <p className="text-sm text-zinc-400">Tire um print do comprovante de pagamento.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-400 font-bold text-sm">3</div>
                  <p className="text-sm text-zinc-400">Envie o comprovante para o WhatsApp <span className="text-white font-medium">(62) 98545-1980</span>.</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-3xl p-6">
              <p className="text-sm text-purple-200 leading-relaxed italic">
                "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade." - 2 Timóteo 2:15
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-white/5">
        <p className="text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} Videira Botânico. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
