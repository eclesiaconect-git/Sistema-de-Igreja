// Gera o "Payload" PIX (padrão EMV / BR Code) para copia-e-cola e QR Code.
// Não depende de nenhum banco ou gateway — funciona com qualquer chave PIX.

function tlv(id, value) {
  const size = String(value.length).padStart(2, '0');
  return `${id}${size}${value}`;
}

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function normalize(str, max) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, max);
}

/**
 * @param {Object} opts
 * @param {string} opts.chave - chave PIX (email, telefone +55DDDNUMERO, CPF/CNPJ ou aleatória)
 * @param {string} opts.nomeRecebedor - nome do beneficiário (máx 25 caracteres)
 * @param {string} opts.cidade - cidade do beneficiário (máx 15 caracteres)
 * @param {number} [opts.valor] - valor em reais, opcional (se vazio, quem paga digita o valor)
 * @param {string} [opts.identificador] - identificador da transação (máx 25 caracteres), opcional
 * @param {string} [opts.descricao] - mensagem curta que aparece pro pagador, opcional
 */
export function gerarPayloadPix({
  chave,
  nomeRecebedor,
  cidade,
  valor,
  identificador = 'DIZIMO',
  descricao = 'Dizimo e oferta',
}) {
  const gui = tlv('00', 'br.gov.bcb.pix');
  const chaveField = tlv('01', chave);
  const descField = descricao ? tlv('02', normalize(descricao, 40)) : '';
  const merchantAccountInfo = tlv('26', gui + chaveField + descField);

  const merchantCategoryCode = tlv('52', '0000');
  const transactionCurrency = tlv('53', '986'); // BRL
  const transactionAmount = valor ? tlv('54', Number(valor).toFixed(2)) : '';
  const countryCode = tlv('58', 'BR');
  const merchantName = tlv('59', normalize(nomeRecebedor, 25) || 'IGREJA');
  const merchantCity = tlv('60', normalize(cidade, 15) || 'BRASIL');

  const additionalData = tlv('62', tlv('05', normalize(identificador, 25) || '***'));

  let payload =
    tlv('00', '01') + // Payload Format Indicator
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    '6304'; // CRC placeholder (id + tamanho)

  const crc = crc16(payload);
  return payload + crc;
}
