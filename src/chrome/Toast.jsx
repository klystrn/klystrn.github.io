import { useMode } from './ModeContext';

export default function Toast() {
  const { toastMsg } = useMode();
  return (
    <div className={`toast ${toastMsg ? 'show' : ''}`} role="status" aria-live="polite">
      {toastMsg}
    </div>
  );
}
