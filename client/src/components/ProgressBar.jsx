export default function ProgressBar({ percent }) {
  const tone = percent >= 90 ? 'red' : percent >= 60 ? 'amber' : 'green';
  return (
    <div className="progress">
      <div className={`progress-fill ${tone}`} style={{ width: `${percent}%` }} />
      <span>{percent}%</span>
    </div>
  );
}
