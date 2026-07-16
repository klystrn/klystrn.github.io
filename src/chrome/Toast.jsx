import { useMode } from './ModeContext';

export default function Toast() {
  const { toastMsg } = useMode();
  return <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>;
}
