'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Galeria() {
  const supabase = createClient();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({
    legenda: '',
    data_evento: new Date().toISOString().slice(0, 10),
  });

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from('galeria')
      .select('*')
      .order('data_evento', { ascending: false });
    setLista(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function enviar(e) {
    e.preventDefault();
    const arquivo = e.target.imagem.files?.[0];
    if (!arquivo) {
      setErro('Escolha uma imagem.');
      return;
    }
    if (arquivo.size > 4 * 1024 * 1024) {
      setErro('A imagem precisa ter no máximo 4MB.');
      return;
    }

    setErro('');
    setEnviando(true);

    const nomeArquivo = `${Date.now()}-${arquivo.name.replace(/\s+/g, '-')}`;
    const { error: erroUpload } = await supabase.storage
      .from('galeria')
      .upload(nomeArquivo, arquivo);

    if (erroUpload) {
      setErro('Não foi possível enviar a imagem. Confira se o bucket "galeria" existe no Supabase.');
      setEnviando(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('galeria').getPublicUrl(nomeArquivo);

    await supabase.from('galeria').insert({
      imagem_url: urlData.publicUrl,
      legenda: form.legenda || null,
      data_evento: form.data_evento || null,
    });

    setForm({ ...form, legenda: '' });
    e.target.reset();
    setEnviando(false);
    carregar();
  }

  async function remover(id) {
    if (!confirm('Remover esta foto?')) return;
    await supabase.from('galeria').delete().eq('id', id);
    carregar();
  }

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <h1 className="font-display text-2xl text-ink mb-2">Galeria</h1>
      <p className="text-sm text-ink/50 mb-6">
        Fotos de eventos passados, exibidas na página inicial do site.
      </p>

      <form
        onSubmit={enviar}
        className="border border-ink/10 rounded-2xl p-5 bg-white/50 mb-8 space-y-3"
      >
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Foto</label>
          <input
            type="file"
            name="imagem"
            accept="image/png, image/jpeg, image/webp"
            className="w-full text-sm"
          />
          <p className="text-xs text-ink/40 mt-1">Máximo 4MB.</p>
        </div>
        <input
          placeholder="Legenda (opcional)"
          value={form.legenda}
          onChange={(e) => setForm({ ...form, legenda: e.target.value })}
          className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Data do evento</label>
          <input
            type="date"
            value={form.data_evento}
            onChange={(e) => setForm({ ...form, data_evento: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>
        {erro && <p className="text-sm text-wine">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-ink text-parchment font-medium px-6 py-2.5 hover:bg-wine transition-colors disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Adicionar foto'}
        </button>
      </form>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : lista.length === 0 ? (
        <p className="text-ink/50 text-sm">Nenhuma foto na galeria ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {lista.map((foto) => (
            <div key={foto.id} className="relative group rounded-xl overflow-hidden border border-ink/10">
              <img src={foto.imagem_url} alt="" className="w-full aspect-square object-cover" />
              <button
                onClick={() => remover(foto.id)}
                className="absolute top-1.5 right-1.5 bg-ink/70 text-parchment text-xs rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remover
              </button>
              {foto.legenda && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-2 py-1.5">
                  <p className="text-parchment text-xs truncate">{foto.legenda}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
