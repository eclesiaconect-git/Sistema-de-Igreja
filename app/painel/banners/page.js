'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Banners() {
  const supabase = createClient();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState({ titulo: '', link: '', ordem: '0' });

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase.from('banners').select('*').order('ordem');
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
      .from('banners')
      .upload(nomeArquivo, arquivo);

    if (erroUpload) {
      setErro('Não foi possível enviar a imagem. Confira se o bucket "banners" existe no Supabase.');
      setEnviando(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(nomeArquivo);

    await supabase.from('banners').insert({
      imagem_url: urlData.publicUrl,
      titulo: form.titulo || null,
      link: form.link || null,
      ordem: Number(form.ordem) || 0,
    });

    setForm({ titulo: '', link: '', ordem: '0' });
    e.target.reset();
    setEnviando(false);
    carregar();
  }

  async function alternarAtivo(banner) {
    await supabase.from('banners').update({ ativo: !banner.ativo }).eq('id', banner.id);
    carregar();
  }

  async function remover(id) {
    if (!confirm('Remover este banner?')) return;
    await supabase.from('banners').delete().eq('id', id);
    carregar();
  }

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <h1 className="font-display text-2xl text-ink mb-2">Banners</h1>
      <p className="text-sm text-ink/50 mb-6">
        Aparecem em rotação no topo da página inicial do site.
      </p>

      <form
        onSubmit={enviar}
        className="border border-ink/10 rounded-2xl p-5 bg-white/50 mb-8 space-y-3"
      >
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Imagem</label>
          <input
            type="file"
            name="imagem"
            accept="image/png, image/jpeg, image/webp"
            className="w-full text-sm"
          />
          <p className="text-xs text-ink/40 mt-1">
            Formato retangular funciona melhor (ex: 1200x450px). Máximo 4MB.
          </p>
        </div>
        <input
          placeholder="Título (opcional, aparece sobre a imagem)"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <input
          placeholder="Link ao clicar (opcional, ex: https://...)"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Ordem (menor número aparece primeiro)
          </label>
          <input
            type="number"
            value={form.ordem}
            onChange={(e) => setForm({ ...form, ordem: e.target.value })}
            className="w-24 rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>
        {erro && <p className="text-sm text-wine">{erro}</p>}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-ink text-parchment font-medium px-6 py-2.5 hover:bg-wine transition-colors disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Adicionar banner'}
        </button>
      </form>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : lista.length === 0 ? (
        <p className="text-ink/50 text-sm">Nenhum banner cadastrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {lista.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 border border-ink/10 rounded-2xl p-3 bg-white/50"
            >
              <img
                src={b.imagem_url}
                alt=""
                className="w-24 h-14 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${b.ativo ? 'text-ink' : 'text-ink/40'}`}>
                  {b.titulo || '(sem título)'}
                </p>
                <p className="text-xs text-ink/40">Ordem: {b.ordem}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => alternarAtivo(b)}
                  className="text-xs text-sage hover:underline"
                >
                  {b.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => remover(b.id)} className="text-xs text-wine hover:underline">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
