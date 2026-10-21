/** Extrai os primeiros 11 algarismos (DDD + telefone). */
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11);
}

/** Máscara brasileira para telefone fixo (10 dígitos) ou celular (11). */
export function formatarTelefone(valor: string): string {
  const numeros = somenteDigitos(valor);
  if (!numeros) return '';
  if (numeros.length < 3) return `(${numeros}`;

  const ddd = numeros.slice(0, 2);
  const restante = numeros.slice(2);
  if (restante.length <= 4) return `(${ddd}) ${restante}`;

  if (numeros.length <= 10) {
    return `(${ddd}) ${restante.slice(0, 4)}-${restante.slice(4)}`;
  }

  return `(${ddd}) ${restante.slice(0, 5)}-${restante.slice(5)}`;
}

export function telefoneValido(valor: string): boolean {
  const tamanho = somenteDigitos(valor).length;
  return tamanho === 10 || tamanho === 11;
}
