export default function Footer() {
  return (
    <footer className="text-center text-xs text-text-muted py-4 px-4">
      <span>Made by </span>
      <a
        href="https://x.com/opitaru"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        Omri Pitaru
      </a>
      <span className="mx-1.5 opacity-40">·</span>
      <a
        href="https://x.com/opitaru"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        X
      </a>
      <span className="mx-1.5 opacity-40">·</span>
      <a
        href="https://www.linkedin.com/in/omripitaru/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-accent transition-colors"
      >
        LinkedIn
      </a>
    </footer>
  )
}
