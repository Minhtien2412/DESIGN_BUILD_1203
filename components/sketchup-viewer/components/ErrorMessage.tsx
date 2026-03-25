
interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
}

/**
 * Inline error banner shown when file validation or model loading fails.
 * Supports multi-line messages (splits on \n).
 */
export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="skp-viewer__error" role="alert" aria-live="polite">
      <div className="skp-viewer__error-content">
        <strong>⚠ Lỗi</strong>
        {message.split("\n").map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="skp-viewer__ghost-button"
          onClick={onDismiss}
          aria-label="Đóng thông báo lỗi"
        >
          ✕
        </button>
      )}
    </div>
  );
}
