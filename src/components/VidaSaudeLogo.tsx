type VidaSaudeLogoProps = {
  size?: 'default' | 'small';
};

/** Marca vetorial utilizada na tela de abertura e no login. */
export default function VidaSaudeLogo({ size = 'default' }: VidaSaudeLogoProps) {
  const dimensoes = size === 'small' ? 'h-[78px] w-[78px]' : 'h-[88px] w-[88px]';
  const tamanhoCoracao = size === 'small' ? 'h-[37px] w-[37px]' : 'h-11 w-11';

  return (
    <div
      aria-hidden="true"
      className={`flex ${dimensoes} shrink-0 items-center justify-center rounded-[16px] bg-brand-logo shadow-logo`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${tamanhoCoracao} text-brand-heart`}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    </div>
  );
}
