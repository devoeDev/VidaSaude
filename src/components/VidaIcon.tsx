import type { ReactNode } from 'react';

export type NomeIcone =
  | 'inicio' | 'saude' | 'remedio' | 'alertas' | 'gota'
  | 'pressao' | 'batimentos' | 'seta' | 'voltar' | 'mais'
  | 'aviso' | 'check' | 'relogio' | 'usuario' | 'sair' | 'fechar';

const desenhos: Record<NomeIcone, ReactNode> = {
  inicio: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
  saude: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  remedio: <><rect x="7" y="6" width="10" height="15" rx="2" /><path d="M9 3h6M12 10v7m-3.5-3.5h7" /></>,
  alertas: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  gota: <path d="M12 2C10 6 6 10 6 15a6 6 0 0 0 12 0c0-5-4-9-6-13Z" />,
  pressao: <><path d="M3 8V5h18v3" /><path d="M3 15h3l2-4 3 7 3-10 2 6h5" /><path d="M3 19h18" /></>,
  batimentos: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  seta: <path d="M4 12h16m-7-7 7 7-7 7" />,
  voltar: <path d="M19 12H5m7 7-7-7 7-7" />,
  mais: <path d="M12 5v14M5 12h14" />,
  aviso: <><path d="M12 3 2 21h20L12 3Z" /><path d="M12 9v5m0 4h.01" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  usuario: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-5 3-8 8-8s8 3 8 8" /></>,
  sair: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" /><path d="M12 12h9m-4-4 4 4-4 4" /></>,
  fechar: <path d="M5 5 19 19M19 5 5 19" />,
};

export default function VidaIcon({
  nome, tamanho = 22, preenchido = false,
}: { nome: NomeIcone; tamanho?: number; preenchido?: boolean }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24"
      fill={preenchido ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {desenhos[nome]}
    </svg>
  );
}
