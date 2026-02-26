// ============================================================
// ToggleSwitch — Toggle reutilizável extraído das configurações
// ============================================================

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

export function ToggleSwitch({ enabled, onToggle }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-16 h-9 rounded-full transition-all duration-200 flex-shrink-0 ${
        enabled ? 'bg-green-500' : 'bg-white/20'
      }`}
    >
      <div
        className={`w-7 h-7 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
