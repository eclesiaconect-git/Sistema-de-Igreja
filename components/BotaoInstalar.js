'use client';

import { useEffect, useState } from 'react';

export default function BotaoInstalar() {
  const [promptEvento, setPromptEvento] = useState(null);
  const [instalado, setInstalado] = useState(false);
  const [suportado, setSuportado] = useState(false);

  useEffect(() => {
    // Se já estiver rodando como app instalado, não faz sentido mostrar o botão
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalado(true);
      return;
    }

    function aoFicarDisponivel(e) {
      e.preventDefault();
      setPromptEvento(e);
      setSuportado(true);
    }

    function aoInstalar() {
      setInstalado(true);
      setPromptEvento(null);
    }

    window.addEventListener('beforeinstallprompt', aoFicarDisponivel);
    window.addEventListener('appinstalled', aoInstalar);

    return () => {
      window.removeEventListener('beforeinstallprompt', aoFicarDisponivel);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!promptEvento) return;
    promptEvento.prompt();
    await promptEvento.userChoice;
    setPromptEvento(null);
  }

  if (instalado) {
    return (
      <div className="rounded-full bg-sage/15 text-sage font-medium px-6 py-3 text-center">
        ✓ App já instalado neste dispositivo
      </div>
    );
  }

  if (!suportado) {
    // Navegador não oferece instalação automática (ex: iPhone/Safari) —
    // as instruções manuais abaixo do botão já cobrem esse caso.
    return null;
  }

  return (
    <button
      onClick={instalar}
      className="w-full rounded-full bg-gold text-ink font-semibold px-6 py-3.5 hover:bg-wine hover:text-parchment transition-colors"
    >
      ⬇ Instalar agora neste dispositivo
    </button>
  );
}
