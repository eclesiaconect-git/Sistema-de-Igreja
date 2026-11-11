import { createClient } from './supabaseServer';

const PADRAO = {
  nome_igreja: 'Nossa Igreja',
  pix_chave: '',
  pix_tipo: 'email',
  pix_nome_recebedor: '',
  pix_cidade: 'BRASIL',
  logo_url: '',
  capa_url: '',
  sobre_texto: '',
  nome_paroco: '',
  instagram: '',
  facebook: '',
  whatsapp: '',
  transmissao_url: '',
};

export async function getConfig() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    return data ? { ...PADRAO, ...data } : PADRAO;
  } catch {
    return PADRAO;
  }
}
