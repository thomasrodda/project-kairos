// apps/web/src/components/SidebarButton/SidebarButton.tsx
import './SidebarButton.scss';
import React from 'react'; // Import React for React.ReactNode

export interface SidebarButtonProps {
  icon: React.ReactNode; // Changed type from string to React.ReactNode
  text: string;
  variant?: 'standard' | 'slim';
  isCollapsed?: boolean;
  onClick?: () => void;
  id?: string;
}

export function SidebarButton({ icon, text, variant = 'standard', isCollapsed = false, onClick, id }: SidebarButtonProps) {
  const className = `sidebar-button sidebar-button--${variant} ${isCollapsed ? 'sidebar-button--collapsed' : ''}`;

  return (
    <button className={className} onClick={onClick} data-testid={id}>
      <span className="sidebar-button__icon">{icon}</span> {/* This part remains the same as it renders the passed node */}
      {!isCollapsed && <span className="sidebar-button__text">{text}</span>}
    </button>
  );
}
