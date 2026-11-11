export function proximoDomingo() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diasAteDomingo = (7 - hoje.getDay()) % 7; // se hoje já é domingo, retorna hoje
  const domingo = new Date(hoje);
  domingo.setDate(hoje.getDate() + diasAteDomingo);
  return domingo;
}

export function formatarDataCompleta(data) {
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
