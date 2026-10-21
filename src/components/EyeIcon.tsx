type EyeIconProps = {
  visible: boolean;
};

/** Ícone de olho com o mesmo tamanho nos dois estados. */
export default function EyeIcon({ visible }: EyeIconProps) {
  return visible ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[20px] w-[20px]">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[20px] w-[20px]">
      <path d="M3.3 9.3C2.4 10.5 2 12 2 12s3.6 7 10 7c2 0 3.7-.7 5.1-1.6" />
      <path d="M20.7 14.7C21.6 13.5 22 12 22 12s-3.6-7-10-7c-2 0-3.7.7-5.1 1.6" />
      <path d="m3 3 18 18" />
      <path d="M10.5 10.5a2.1 2.1 0 0 0 3 3" />
    </svg>
  );
}
