import type { ReactNode } from 'react';

type MobileAppShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Mobile first: preenche todo o celular.
 * Em monitores grandes, centraliza o conteúdo para apresentação na faculdade.
 */
export default function MobileAppShell({ children, className = '' }: MobileAppShellProps) {
  return (
    <div className="app-stage">
      <div className={`app-shell ${className}`}>{children}</div>
    </div>
  );
}
