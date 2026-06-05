// client/src/components/common/Loader.jsx
export default function Loader({ fullScreen = false, size = "md", text = "" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className={`${sizes[size]} rounded-full border-2 border-dark-700 border-t-gold-500 animate-spin`} />
        <div className={`${sizes[size]} rounded-full border-2 border-transparent border-b-gold-400/30 animate-spin absolute inset-0`} style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>
      {text && <p className="text-dark-400 text-sm animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-6">
          <div className="text-2xl font-display font-bold text-gradient-gold">HamroStay</div>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
