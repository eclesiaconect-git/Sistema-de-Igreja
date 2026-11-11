// Gera a lista de próximas ocorrências de missa, a partir dos horários fixos
// (recorrentes, ex: "toda quinta às 19h") e das atividades específicas com data marcada.
// SEMANAS_A_FRENTE controla até quando olhar pra frente pra horários fixos.
const SEMANAS_A_FRENTE = 12;

function proximaDataDoDiaSemana(diaSemana, semanasAFrente) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const datas = [];

  for (let semana = 0; semana <= semanasAFrente; semana++) {
    const data = new Date(hoje);
    const diff = (diaSemana - data.getDay() + 7) % 7;
    data.setDate(data.getDate() + diff + semana * 7);
    if (data >= hoje) datas.push(new Date(data));
  }
  return datas;
}

export function gerarProximasMissas(atividades) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const ocorrencias = [];

  for (const a of atividades) {
    if (a.recorrente && a.dia_semana !== null && a.dia_semana !== undefined) {
      const datas = proximaDataDoDiaSemana(a.dia_semana, SEMANAS_A_FRENTE);
      for (const d of datas) {
        ocorrencias.push({
          titulo: a.titulo,
          hora: a.hora || '',
          data: d.toISOString().slice(0, 10),
          dataObj: d,
        });
      }
    } else if (a.data_evento) {
      const d = new Date(a.data_evento + 'T00:00:00');
      if (d >= hoje) {
        ocorrencias.push({
          titulo: a.titulo,
          hora: a.hora || '',
          data: a.data_evento,
          dataObj: d,
        });
      }
    }
  }

  ocorrencias.sort((x, y) => {
    if (x.data !== y.data) return x.data.localeCompare(y.data);
    return (x.hora || '').localeCompare(y.hora || '');
  });

  return ocorrencias;
}

export function formatarData(dataStr) {
  const d = new Date(dataStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
}
