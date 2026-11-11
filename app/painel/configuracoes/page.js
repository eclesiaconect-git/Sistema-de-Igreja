'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Configuracoes() {
  const supabase = createClient();
  const [form, setForm] = useState({
    nome_igreja: '',
    pix_chave: '',
    pix_tipo: 'email',
    pix_nome_recebedor: '',
    pix_cidade: '',
    logo_url: '',
    capa_url: '',
    sobre_texto: '',
    nome_paroco: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    transmissao_url: '',
    transmissao_plataforma: 'youtube',
    limite_intencoes_missa: 10,
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [erroImagem, setErroImagem] = useState('');

  useEffect(() => {
    supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setForm((f) => ({ ...f, ...data }));
        setCarregando(false);
      });
  }, []);

  async function enviarImagem(e, bucket, campo, setEnviando) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setErroImagem('');

    if (arquivo.size > 3 * 1024 * 1024) {
      setErroImagem('A imagem precisa ter no máximo 3MB.');
      return;
    }

    setEnviando(true);
    const extensao = arquivo.name.split('.').pop();
    const caminho = `${campo}.${extensao}`;

    const { error: erroUpload } = await supabase.storage
      .from(bucket)
      .upload(caminho, arquivo, { upsert: true, cacheControl: '3600' });

    if (erroUpload) {
      setErroImagem(
        `Não foi possível enviar. Confira se o espaço "${bucket}" foi criado no Supabase.`
      );
      setEnviando(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(caminho);
    const novaUrl = `${urlData.publicUrl}?v=${Date.now()}`;

    await supabase.from('configuracoes').update({ [campo]: novaUrl }).eq('id', 1);
    setForm((f) => ({ ...f, [campo]: novaUrl }));
    setEnviando(false);
  }

  async function removerImagem(campo) {
    if (!confirm('Remover esta imagem?')) return;
    await supabase.from('configuracoes').update({ [campo]: null }).eq('id', 1);
    setForm((f) => ({ ...f, [campo]: '' }));
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setSalvo(false);

    const { error } = await supabase
      .from('configuracoes')
      .update({
        nome_igreja: form.nome_igreja,
        pix_chave: form.pix_chave,
        pix_tipo: form.pix_tipo,
        pix_nome_recebedor: form.pix_nome_recebedor,
        pix_cidade: form.pix_cidade,
        sobre_texto: form.sobre_texto,
        nome_paroco: form.nome_paroco,
        instagram: form.instagram,
        facebook: form.facebook,
        whatsapp: form.whatsapp,
        transmissao_url: form.transmissao_url,
        transmissao_plataforma: form.transmissao_plataforma,
        limite_intencoes_missa: Number(form.limite_intencoes_missa) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    setSalvando(false);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
      return;
    }
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  if (carregando) {
    return <div className="p-6 sm:p-10 text-ink/50 text-sm">Carregando...</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-lg">
      <h1 className="font-display text-2xl text-ink mb-2">Configurações</h1>
      <p className="text-sm text-ink/50 mb-6">
        Esses dados aparecem no site público.
      </p>

      {/* Logo */}
      <div className="border border-ink/10 rounded-2xl p-5 bg-white/50 mb-4">
        <p className="text-sm font-medium text-ink/70 mb-3">Logo (ao lado do nome, no menu)</p>
        <div className="flex items-center gap-4">
          {form.logo_url ? (
            <img src={form.logo_url} alt="" className="w-16 h-16 rounded-full object-cover border border-ink/10" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center text-ink/30 text-xs text-center">
              sem logo
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-ink bg-parchment border border-ink/20 rounded-full px-4 py-2 cursor-pointer hover:border-ink transition-colors text-center">
              {enviandoLogo ? 'Enviando...' : form.logo_url ? 'Trocar' : 'Enviar imagem'}
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => enviarImagem(e, 'logo', 'logo_url', setEnviandoLogo)}
                disabled={enviandoLogo}
                className="hidden"
              />
            </label>
            {form.logo_url && (
              <button type="button" onClick={() => removerImagem('logo_url')} className="text-xs text-wine hover:underline">
                Remover
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Capa */}
      <div className="border border-ink/10 rounded-2xl p-5 bg-white/50 mb-4">
        <p className="text-sm font-medium text-ink/70 mb-3">Foto de capa (fundo do topo do site)</p>
        {form.capa_url ? (
          <img src={form.capa_url} alt="" className="w-full h-28 object-cover rounded-xl border border-ink/10 mb-3" />
        ) : (
          <div className="w-full h-28 rounded-xl bg-ink/5 flex items-center justify-center text-ink/30 text-xs mb-3">
            sem foto de capa
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-ink bg-parchment border border-ink/20 rounded-full px-4 py-2 cursor-pointer hover:border-ink transition-colors">
            {enviandoCapa ? 'Enviando...' : form.capa_url ? 'Trocar' : 'Enviar imagem'}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => enviarImagem(e, 'capa', 'capa_url', setEnviandoCapa)}
              disabled={enviandoCapa}
              className="hidden"
            />
          </label>
          {form.capa_url && (
            <button type="button" onClick={() => removerImagem('capa_url')} className="text-xs text-wine hover:underline">
              Remover
            </button>
          )}
        </div>
        <p className="text-xs text-ink/40 mt-2">
          Imagem larga funciona melhor (ex: 1600x800px). Máximo 3MB.
        </p>
      </div>

      {erroImagem && (
        <p className="text-xs text-wine mb-4 -mt-2">{erroImagem}</p>
      )}

      <form onSubmit={salvar} className="space-y-4 border border-ink/10 rounded-2xl p-5 bg-white/50 mb-4">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Nome da igreja</label>
          <input
            required
            value={form.nome_igreja || ''}
            onChange={(e) => setForm({ ...form, nome_igreja: e.target.value })}
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Sobre a igreja (texto livre)</label>
          <textarea
            rows={4}
            value={form.sobre_texto || ''}
            onChange={(e) => setForm({ ...form, sobre_texto: e.target.value })}
            placeholder="Um pouco da história, missão, ou uma mensagem de boas-vindas..."
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Nome do pároco/pastor (opcional)</label>
          <input
            value={form.nome_paroco || ''}
            onChange={(e) => setForm({ ...form, nome_paroco: e.target.value })}
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div className="border-2 border-gold/30 rounded-xl p-3 -mx-1 space-y-3">
          <p className="text-sm font-medium text-ink/70">🔴 Transmissão ao vivo</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, transmissao_plataforma: 'youtube' })}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium border transition-colors ${
                form.transmissao_plataforma === 'youtube'
                  ? 'bg-ink text-parchment border-ink'
                  : 'border-ink/15 text-ink/60'
              }`}
            >
              YouTube
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, transmissao_plataforma: 'instagram' })}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium border transition-colors ${
                form.transmissao_plataforma === 'instagram'
                  ? 'bg-ink text-parchment border-ink'
                  : 'border-ink/15 text-ink/60'
              }`}
            >
              Instagram
            </button>
          </div>
          <input
            value={form.transmissao_url || ''}
            onChange={(e) => setForm({ ...form, transmissao_url: e.target.value })}
            placeholder={
              form.transmissao_plataforma === 'instagram'
                ? '@usuario ou link do perfil/instagram'
                : 'Cole aqui o link do vídeo/live do YouTube'
            }
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
          <p className="text-xs text-ink/40">Deixe em branco quando não houver transmissão.</p>
        </div>

        <div className="border-2 border-gold/30 rounded-xl p-3 -mx-1">
          <label className="block text-sm font-medium text-ink/70 mb-1">
            🙏 Limite de intenções por missa
          </label>
          <input
            type="number"
            min="0"
            value={form.limite_intencoes_missa ?? 10}
            onChange={(e) => setForm({ ...form, limite_intencoes_missa: e.target.value })}
            className="w-24 rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
          <p className="text-xs text-ink/40 mt-1">
            Quantas intenções cada horário de missa aceita antes de indicar o próximo
            disponível. Use 0 para não limitar.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Chave PIX</label>
          <input
            value={form.pix_chave || ''}
            onChange={(e) => setForm({ ...form, pix_chave: e.target.value })}
            placeholder="Telefone (+55DDDNÚMERO), e-mail, CPF/CNPJ ou chave aleatória"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Tipo da chave</label>
          <select
            value={form.pix_tipo || 'email'}
            onChange={(e) => setForm({ ...form, pix_tipo: e.target.value })}
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          >
            <option value="email">E-mail</option>
            <option value="telefone">Telefone</option>
            <option value="cpf_cnpj">CPF/CNPJ</option>
            <option value="aleatoria">Chave aleatória</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Nome de quem recebe o PIX</label>
          <input
            value={form.pix_nome_recebedor || ''}
            onChange={(e) => setForm({ ...form, pix_nome_recebedor: e.target.value })}
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Cidade</label>
          <input
            value={form.pix_cidade || ''}
            onChange={(e) => setForm({ ...form, pix_cidade: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Instagram (usuário ou link)</label>
          <input
            value={form.instagram || ''}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            placeholder="@nomeigreja"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Facebook (usuário ou link)</label>
          <input
            value={form.facebook || ''}
            onChange={(e) => setForm({ ...form, facebook: e.target.value })}
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">WhatsApp (com DDD)</label>
          <input
            value={form.whatsapp || ''}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="5583999999999"
            className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full rounded-full bg-ink text-parchment font-medium py-2.5 hover:bg-wine transition-colors disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  );
}
